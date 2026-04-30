#!/usr/bin/env bash
rm -rf dist
tsgo -p tsconfig-build.json
tsgo -p tsconfig-build-cjs.json
ts-node scripts/build.ts