rm -rf dist
tsc -p tsconfig-build.json
tsc -p tsconfig-build-cjs.json
NODE_OPTIONS='--no-experimental-require-module --no-experimental-strip-types' ts-node scripts/build.ts