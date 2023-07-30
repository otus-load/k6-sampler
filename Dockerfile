FROM grafana/k6:0.44.0
COPY sample.js .
ENTRYPOINT ["k6", "run", "sample.js"]
