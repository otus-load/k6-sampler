import http from "k6/http";
import { check, group } from "k6";

const BASE_URL = 'https://test.k6.io';

export let options = {
    discardResponseBodies: true,
    scenarios: {
      base: {
        executor: 'constant-vus',
        exec: 'get_base',
        vus: 50,
        duration: '30s',
      },
      features: {
        executor: 'per-vu-iterations',
        exec: 'get_features',
        vus: 10,
        iterations: 100,
        startTime: '10s',
        maxDuration: '1m',
      },
    },
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<200'],
    },
};

export default function(){
    group("get_base", function(){get_base()});
    group("get_features", function(){get_features()});
};

export function get_base(){
    let res = http.get(BASE_URL);
    check(res, {
        "status code is 200": (res) => res.status == 200,
    });

    let data = { name: 'Bert' };
    let resPost = http.post("https://test.k6.io/flip_coin.php", JSON.stringify(data),
                        { headers: { 'Content-Type': 'application/json' } });
};

export function get_features(){
    let res = http.get(BASE_URL + "/feature.php");
    check(res, {
        "status code is 404": (res) => res.status == 404,
    });
	http.get(BASE_URL + "/news.php");

    console.log("outs test")

};