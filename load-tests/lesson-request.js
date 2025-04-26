import http from 'k6/http';
import { check, sleep } from 'k6';

const API_URL    = __ENV.API_URL    || 'http://localhost:8080';
const PROFILE_ID = __ENV.PROFILE_ID || '2';
const STUDENT    = { email: 'erin@example.com', password: 'password' };

export function setup() {
  // tutor login (once)
  const tutorLogin = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: 'test@example.com', password: 'password' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(tutorLogin, { 'tutor login 200': r => r.status === 200 });
  const tutorToken = tutorLogin.json('token');

  // student login (once)
  const studentLogin = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify(STUDENT),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(studentLogin, { 'student login 200': r => r.status === 200 });
  const studentToken = studentLogin.json('token');

  return { tutorToken, studentToken };
}

export let options = {
  vus: 10,
  duration: '1m',
};

export default function(data) {

  const SLOT_LEN    = 30 * 60_000;  // 30m in ms
  const SLOTS_PER_VU = 5;

  const randomYear  = 2026 + Math.floor(Math.random() * 100);
  const randomMonth = Math.floor(Math.random() * 11);
  const randomDay   = Math.floor(Math.random() * 28) + 1;

  const base = Date.UTC(randomYear, randomMonth, randomDay)
    + (__VU - 1) * (SLOTS_PER_VU * SLOT_LEN);


  const toCreate = Array.from({ length: 5 }, (_, i) => {
    const start = new Date(base + i * SLOT_LEN).toISOString();
    const end   = new Date(base + (i + 1) * SLOT_LEN).toISOString();
    return {
      profileId: +PROFILE_ID,
      startTime: start,
      endTime:   end,
      status:    'AVAILABLE',
    };
  });

  const batchRes = http.post(
    `${API_URL}/api/availability/${PROFILE_ID}/batchCreate`,
    JSON.stringify(toCreate),
    {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${data.tutorToken}`,
      },
    }
  );
  check(batchRes, { 'batchCreate 200': r => r.status === 200 });

  const raw = batchRes.json();
  const slots = (Array.isArray(raw) ? raw : Object.values(raw))
    .filter(s => s && s.id)
    .map(s => ({ id: s.id, startTime: s.startTime, endTime: s.endTime }));

  const slot = slots[(__VU - 1) % slots.length];

  const book = http.post(
    `${API_URL}/api/lessonRequest`,
    JSON.stringify({
      studentProfileId: 9,       // adjust as needed
      tutorProfileId:    +PROFILE_ID,
      availabilityId:    slot.id,
      requestedStartTime: slot.startTime,
      requestedEndTime:   slot.endTime,
    }),
    {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${data.studentToken}`,
      },
    }
  );
  check(book, { 'booking created': r => r.status === 201 });
  if (book.status !== 201) return sleep(1);


  const requestId = book.json('id');

  const delRes = http.del(
    `${API_URL}/api/lessonRequest/${requestId}`,
    null,
    {
      headers: {
        'Authorization': `Bearer ${data.studentToken}`,
      },
    }
  );
  check(delRes, { 'lessonRequest deleted': r => r.status === 200 });


  slots.forEach(s => {
    const r = http.del(
      `${API_URL}/api/availability/delete/${PROFILE_ID}` +
      `?availabilityId=${s.id}`,
      null,
      { headers: { 'Authorization': `Bearer ${data.tutorToken}` } }
    );
    check(r, { 'deleted slot': resp => resp.status === 204 });
  });
  sleep(1);
}
