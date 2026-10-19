FROM grafana/k6:2.3.0
COPY sample.js .
COPY users.json .
ENTRYPOINT ["k6", "run", "sample.js"]
