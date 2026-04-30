#!/usr/bin/env bash
mv coverage/cypress-report coverage/test-report2 &&\
mkdir coverage/cypress-report &&\
npx mochawesome-merge "coverage/test-report2/*.json" > coverage/cypress-report/index.json &&\
npx marge coverage/cypress-report/index.json -o coverage/cypress-report &&\
rm -rf coverage/test-report2 &&\
rm -rf coverage/cypress-report/mochawesome.json