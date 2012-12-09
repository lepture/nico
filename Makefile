all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/


specs := $(shell find ./tests -name '*.test.js' ! -path "*node_modules/*")
reporter = spec
opts =
test: clean
	@node_modules/.bin/mocha --reporter ${reporter} ${opts} ${specs}


jsfiles := $(shell find . -name '*.js' ! -path "*node_modules/*" ! -path "*_themes/*" ! -path "*arale/*")
lint:
	@node_modules/.bin/jshint ${jsfiles} --config=scripts/config-lint.js

out = _site/coverage.html
coverage:
	# NOTE: You must have node-jscoverage installed:
	# https://github.com/visionmedia/node-jscoverage
	# The jscoverage npm module and original JSCoverage packages will not work
	@rm -fr lib-cov
	@jscoverage lib lib-cov
	@NICO_COVERAGE=1 $(MAKE) test reporter=html-cov > ${out}
	@echo
	@rm -fr lib-cov
	@echo "Built Report to ${out}"
	@echo

doc:
	@bin/nico -I docs -O _site
	@$(MAKE) coverage

publish: doc coverage
	@ghp-import _site

clean:
	@rm -fr tests/_site

.PHONY: all build test lint coverage
