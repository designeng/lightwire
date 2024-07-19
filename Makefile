define release
	VERSION=`node -pe "require('./package.json').version"` && \
	NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
	node -e "\
		var j = require('./package.json');\
		j.version = \"$$NEXT_VERSION\";\
		var s = JSON.stringify(j, null, 2);\
		require('fs').writeFileSync('./package.json', s);" && \
	git commit -m "Version $$NEXT_VERSION" -- package.json && \
	git tag "$$NEXT_VERSION" -m "Version $$NEXT_VERSION"
endef

release-patch:
	npm run build
	@$(call release,patch)

release-minor:
	npm run build
	@$(call release,minor)

release-major:
	npm run build
	@$(call release,major)

publish:
	git push origin master
	git push --tags origin HEAD:master
	npm publish