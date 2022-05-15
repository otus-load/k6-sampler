import http from 'k6/http';
import { check, group } from 'k6';

const BASE_URL = 'https://test.k6.io';

export const options = {
//   discardResponseBodies: true, // if you check only http-code
  scenarios: {
    base: {
      executor: 'constant-vus',
      exec: 'getBase',
      vus: 50,
      duration: '30s',
    },
    features: {
      executor: 'per-vu-iterations',
      exec: 'getFeatures',
      vus: 10,
      iterations: 100,
      startTime: '10s',
      maxDuration: '1m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<1'],
    http_req_duration: ['p(95)<300'],
  },
};

export function getBase() {
  const res = http.get(BASE_URL);
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });

  const payload = { name: 'Bert' };
  const headers = { headers: { 'Content-Type': 'application/json' } };
  const resPost = http.post(
    'https://test.k6.io/flip_coin.php',
    JSON.stringify(payload),
    headers,
  );
  check(resPost, {
    'status code is 200': (resPost) => resPost.status === 200,
  });
}

export function getFeatures() {
  group('Login', () => {
    const res = http.get(`${BASE_URL}/news.php`);
    check(res, {
      'status code is not 404': (res) => res.status !== 404,
    });
    const resMessage = http.get(`${BASE_URL}/my_messages.php`);
    const title = resMessage.html().find('head title').text();
    console.log(title);
  });
}

export default function () {
  group('getBase', () => { getBase(); });
  group('getFeatures', () => { getFeatures(); });
}
