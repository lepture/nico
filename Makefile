all:
	@npm install -d

specs := $(shell find ./tests -name '*.test.js' ! -path "*node_modules/*")
reporter = spec
opts =
test:
	@rm -fr tests/_site
	@node_modules/.bin/mocha --reporter ${reporter} ${opts} ${specs}


jsfiles := $(shell find . -name '*.js' ! -path "*node_modules/*" ! -path "*_themes/*" ! -path "*docs/*" ! -path "*_site/*")
lint:
	@node_modules/.bin/jshint ${jsfiles}

out = _site/coverage.html
coverage:
	@rm -fr lib-cov
	@node_modules/.bin/jscoverage lib lib-cov
	@NICO_COVERAGE=1 $(MAKE) test reporter=html-cov > ${out}
	@echo
	@rm -fr lib-cov
	@echo "Built Report to ${out}"
	@echo

docs:
	@bin/nico build -C nico.json

api:
	@node_modules/.bin/jsdoc -d _site/api -r lib

server:
	@bin/nico server -C nico.json -v --watch

publish: clean docs
	@scripts/ghp-import.py _site -p

clean:
	@rm -fr tests/_site
	@rm -fr _site

.PHONY: all build test lint coverage docs api
