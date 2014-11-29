SOURCES = lib/*.js

# =============================================================================
# Tests
# =============================================================================


TESTS = $(shell find test -name "test.js")
REPORTER = spec

test:
		@NODE_ENV=test ./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			--recursive \
			--growl \
			$(TESTS)

.PHONY: test