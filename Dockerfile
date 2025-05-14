FROM grafana/k6:1.0.0
COPY sample.js .
COPY users.json .
ENTRYPOINT ["k6", "run", "sample.js"]
