FROM grafana/k6:0.38.2
COPY sample.js .
ENTRYPOINT ["k6", "run", "sample.js"]
