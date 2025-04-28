import ws    from 'k6/ws';
import http  from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const options = {
  scenarios: {
    websocket_chat: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s',  target: 40 },
        { duration: '30s', target: 40 },
        { duration: '10s', target: 40 },
        { duration: '5s',  target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    ws_connecting:                         ['p(95)<200'],
    ping_sent_rate:                        ['rate>0.9'],
    'http_req_duration{stage:login,type:api}': ['p(95)<300'],
  },
};

const pingSent = new Rate('ping_sent_rate');
const API_URL   = __ENV.API_URL  || 'http://localhost:8080';
const WS_URL    = API_URL.replace(/^http/, 'ws') + '/chat-ws/websocket';

const EMAIL     = __ENV.TEST_EMAIL    || 'erin@example.com';
const PASSWORD  = __ENV.TEST_PASSWORD || 'password';

export default function () {
  let token;

  group('login', () => {
    const res = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({ email: EMAIL, password: PASSWORD }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags:    { stage: 'login', type: 'api' },
      }
    );
    check(res, { 'login succeeded': r => r.status === 200 && !!r.json().token });
    token = res.json().token;
  });

  group('ws handshake + ping', () => {
    const res = ws.connect(WS_URL, { headers: { Authorization: `Bearer ${token}` } }, (socket) => {
      socket.send('PING');
      pingSent.add(true);

      sleep(2);
      socket.close();
    });
    check(res, { 'WS handshake status is 101': r => r && r.status === 101 });
  });
}

