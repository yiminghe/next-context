rm -rf dist
tsc -p tsconfig-build.json
tsc -p tsconfig-build-cjs.json
ts-node scripts/build.ts