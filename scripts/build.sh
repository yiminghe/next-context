#!/usr/bin/env bash
rm -rf dist
tsc -p tsconfig-build.json
tsc -p tsconfig-build-cjs.json
tsx scripts/build.ts