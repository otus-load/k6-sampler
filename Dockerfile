FROM grafana/k6:0.47.0
COPY sample.js .
COPY users.json .
ENTRYPOINT ["k6", "run", "sample.js"]
