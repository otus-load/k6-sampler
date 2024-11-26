FROM grafana/k6:0.55.0
COPY sample.js .
COPY users.json .
ENTRYPOINT ["k6", "run", "sample.js"]
