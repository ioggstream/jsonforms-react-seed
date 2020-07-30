
TMPDIR := $(shell mktemp  -u /tmp/fooXXXXXX)
ifndef CIRCLE_REPOSITORY_URL
	REPO_ORIGIN := "."
else
	REPO_ORIGIN := $(CIRCLE_REPOSITORY_URL)
endif



clean:
	rm package-lock.json yarn.lock -f
	# rm node_modules -rf
	git checkout -- tsconfig.json

setup:
	npm install
	npm run build

webpack:
	npm install --save-dev webpack webpack-cli
	npm install --save-dev typescript ts-loader source-map-loader
	npx webpack || true

gh-pages: setup
	git clone $(REPO_ORIGIN) $(TMPDIR) -b gh-pages
	sed -i 's,"/static,"static,g' build/index.html
	sed -i 's,href="/,href=",g' build/index.html
	cp -r build/* $(TMPDIR)
	git -C $(TMPDIR) add .
	git -C $(TMPDIR) -c user.name="gh-pages bot" -c user.email="gh-bot@example.it" \
		commit -m "Script updating gh-pages from $(shell git rev-parse --short HEAD). [ci skip]"
	git -C $(TMPDIR) push -q origin gh-pages
	#rm $(TMPDIR) -fr


