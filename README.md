# k6-sampler

Simple k6 load test for OTUS

```shell
k6 run sample.js
```

With logs:
```shell
k6 run  --logformat raw --console-output=test.log --out csv=test_result.csv sample.js
```

For debug
```shell
k6 run --http-debug="full" sample.js
```