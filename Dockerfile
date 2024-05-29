FROM grafana/k6:0.51.0
COPY sample.js .
COPY users.json .
ENTRYPOINT ["k6", "run", "sample.js"]
