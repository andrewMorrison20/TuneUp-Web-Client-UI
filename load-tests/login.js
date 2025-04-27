import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  scenarios: {
    login_smoke: {
      executor: 'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '10s', target: 2 },  // ramp to 2 VUs
        { duration: '20s', target: 2 },  // hold
        { duration: '10s', target: 0 },  // ramp down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    'http_req_duration{stage:login_page,type:html}': ['p(95)<200'],
    'http_req_duration{stage:login_submit,type:api}':['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

const UI_URL  = __ENV.UI_URL  || 'http://localhost:4200';
const API_URL = __ENV.API_URL || 'http://localhost:8080';

// Replace with a valid test user
const TEST_EMAIL    = __ENV.TEST_EMAIL    || 'erin@example.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'password';

export default function () {
  group('login page load', () => {
    const res = http.get(`${UI_URL}/login`, {
      tags: { stage: 'login_page', type: 'html' },
    });
    check(res, {
      'login page 200':       (r) => r.status === 200,
      'login HTML non-empty': (r) => r.body && r.body.length > 0,
    });
  });

  group('login submission', () => {
    const payload = JSON.stringify({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags:    { stage: 'login_submit', type: 'api' },
    };
    const res2 = http.post(
      `${API_URL}/auth/login`,
      payload,
      params
    );
    check(res2, {
      'login API 200':   (r) => r.status === 200,
      'got a token':     (r) => {
        try { return typeof r.json().token === 'string' && r.json().token.length > 0; }
        catch (e) { return false; }
      },
    });
  });

  sleep(1);
}
