import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  scenarios: {
    quiz_medium: {
      executor: 'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '30s',  target: 10 },  // ramp to 10 users
        { duration: '2m',   target: 20 },  // ramp to 20 and hold
        { duration: '30s',  target: 0  },  // ramp down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'http_req_duration{stage:quiz,type:html}': ['p(95)<50'],
    'http_req_duration{stage:submit,type:api}':['p(95)<150'],
    http_req_failed: ['rate<0.01'],
  },
};

const UI_URL  = __ENV.UI_URL  || 'http://127.0.0.1:4200';
const API_URL = __ENV.API_URL || 'http://127.0.0.1:8080';

export default function () {

  group('quiz page load', () => {
    const res = http.get(`${UI_URL}/quiz`, {
      tags: { stage: 'quiz', type: 'html' },
    });
    check(res, {
      'quiz page status 200': (r) => r.status === 200,
      'quiz HTML non-empty':  (r) => r.body && r.body.length > 0,
    });
  });

  group('quiz submission', () => {
    const payload = JSON.stringify({ /* … */ });
    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags:    { stage: 'submit', type: 'api' },
    };
    const url = `${API_URL}/api/profiles/search?page=0&size=3&sort=averageRating,desc`;
    const r2 = http.post(url, payload, params);

    check(r2, {
      'search API 200':               (r) => r.status === 200,
      'response is JSON':             (r) => r.headers['Content-Type']?.includes('application/json'),
      'returned content array':       (r) => {
        const json = r.json();
        return Array.isArray(json.content) && json.content.length <= 3;
      },
      'totalElements is a number':    (r) => typeof r.json().totalElements === 'number',
    });
  });
  sleep(1);
}
