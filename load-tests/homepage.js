// load-tests/homepage.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { parseHTML } from 'k6/html';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        {duration: '1m', target: 10},
        {duration: '2m', target: 50},
        {duration: '1m', target: 0},
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
}


const UI_URL = __ENV.UI_URL || 'http://localhost:4200';

function joinUrl(base, path) {
  if (path.match(/^https?:\/\//)) {
    return path;
  }

  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${b}/${p}`;
}

export default function () {

  const res = http.get(`${UI_URL}/`);
  check(res, { 'home status was 200': (r) => r.status === 200 });

  const doc = parseHTML(res.body);
  const assetUrls = [];

  doc.find('link[rel="stylesheet"]')
    .map((i, sel) => sel.attr('href'))
    .forEach(href => {
      if (href) assetUrls.push(joinUrl(UI_URL, href));
    });


  doc.find('script[src]')
    .map((i, sel) => sel.attr('src'))
    .forEach(src => {
      if (src) assetUrls.push(joinUrl(UI_URL, src));
    });

  assetUrls.forEach(url => {
    const assetRes = http.get(url);
    check(assetRes, { [`asset loaded ${url}`]: (r) => r.status === 200 });
    sleep(0.1);
  });

  sleep(1);
}

