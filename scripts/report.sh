#!/usr/bin/env bash
mv coverage/cypress-report coverage/test-report2 &&\
mkdir coverage/cypress-report &&\
pnpx mochawesome-merge "coverage/test-report2/*.json" > coverage/cypress-report/index.json &&\
pnpx --package mochawesome-merge marge coverage/cypress-report/index.json -o coverage/cypress-report &&\
rm -rf coverage/test-report2 &&\
rm -rf coverage/cypress-report/mochawesome.json