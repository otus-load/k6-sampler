import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend, Rate } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = 'https://quickpizza.grafana.com';

const myTrend = new Trend('my_otus_trend');
const myCheckFailureRate = new Rate('otus_check_failure_rate');

/* eslint prefer-arrow-callback: "warn" */
const data = new SharedArray('get Users', function () {
  const file = JSON.parse(open('./users.json'));
  return file.users;
});

export const options = {
  // discardResponseBodies: true, // if you check only http-code
  scenarios: {
    base: {
      executor: 'constant-vus',
      exec: 'login',
      vus: 50,
      duration: '30s',
    },
    getPages: {
      executor: 'ramping-arrival-rate',
      exec: 'getPages',
      startRate: 3,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      stages: [
        { target: 5, duration: '10s' },
        { target: 5, duration: '20s' },
        { target: 7, duration: '5s' },
        { target: 0, duration: '10s' },
      // RPS: 3 --> 5 --> 5 --> 7 --> 0
      // ░░██░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      // ░░██░░░░░░░░░░░░░░██████░░░░░░░░
      // ░░██░░░░░░░░░░░░██░░░░░░██░░░░░░
      // ░░██░░░░████████░░░░░░░░██░░░░░░
      // ░░██░░██░░░░░░░░░░░░░░░░░░██░░░░
      // ░░████░░░░░░░░░░░░░░░░░░░░██░░░░
      // ░░██░░░░░░░░░░░░░░░░░░░░░░░░██░░
      // ░░██░░░░░░░░░░░░░░░░░░░░░░░░██░░
      // ░░██████████████████████████████
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<1'],
    http_req_duration: ['p(95)<300'],
    'http_req_duration{my_tag:  API_OTUS}': ['p(95)<500'],
    otus_check_failure_rate: ['rate<0.3'],
  },
};

export function login() {
  /* eslint prefer-template: "warn" */
  let res = http.get(BASE_URL + '/', { tags: { my_tag: 'API_OTUS' } });
  const checkRes = check(
    res,
    { 'status code messages is 200': (res) => res.status === 200 },
    { my_tag: 'my check OTUS' },
  );
  myCheckFailureRate.add(!checkRes);

  http.get(BASE_URL + '/login', { tags: { my_tag: 'API_OTUS' } });
  // set CSRF-token
  res = http.post(BASE_URL + '/api/csrf-token', {});
  // get Cookies
  const cookiesResp = http.get(BASE_URL + '/api/cookies');
  const csrftoken = cookiesResp.json().cookies.csrf_token;

  // console.error(csrftoken)
  const random = Math.floor(Math.random() * data.length);
  const credentials = data[random];

  // console.log(credentials);
  // console.log(credentials.username);
  // console.log(credentials.password);

  const payload = {
    username: credentials.username,
    password: credentials.password,
    csrf: csrftoken,
  };

  const headers = { headers: { 'Content-Type': 'application/json' } };
  const resPost = http.post(
    'https://quickpizza.grafana.com/api/users/token/login',
    JSON.stringify(payload),
    headers,
  );
  check(resPost, {
    'status code login is 200': (resPost) => resPost.status === 200,
  });

  myTrend.add(resPost.timings.duration, { my_tag: "I'm a tag otus super trend" });
}

export function getPages() {
  group('open_web', () => {
    const res = http.get(`${BASE_URL}/api/tools`);
    check(res, {
      'status code news is not 404': (res) => res.status !== 404,
    });
  });

  const resMessage = http.get(`${BASE_URL}/api/quotes`);
  check(resMessage, {
    'status code resMessage is 200': (resMessage) => resMessage.status === 200,
  });

  const randomUUID = uuidv4();
  console.warn(randomUUID);
}

export default function () {
  group('login', () => { login(); });
  group('getPages', () => { getPages(); });
}
