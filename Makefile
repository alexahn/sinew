# will run the prettier command over all .js files in the src directory
format:
	npx eslint src
	npx prettier package.json --write
	npx prettier eslint.config.js --write
	npx prettier src --write
	npx prettier test --write
