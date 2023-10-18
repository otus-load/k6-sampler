# k6-sampler

Simple k6 load test for OTUS

```shell
k6 run sample.js
```

With logs:
```shell
k6 run  --log-format raw --console-output=test.log --out csv=test_result.csv sample.js
```

For debug
```shell
k6 run --http-debug="full" sample.js
```

## Docker


Build docker image

```shell
docker build -t otus/k6:1.0.0 .
``` 

Start k6 test:

```shell
docker run -it --rm otus/k6:1.0.0
```
