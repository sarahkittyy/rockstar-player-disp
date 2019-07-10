.PHONY = all dist move

SOURCES = $(wildcard src/*.ts)
INCLUDE = config.json LICENSE.md

all: zip

zip: move dist
	cd dist/ && zip -r Display-Bot.zip .

dist: dist/bot.exe

dist/bot.exe: $(SOURCES)
	npx nexe . -t windows-x64-6.11.2 -o $@

move:
	rm -rf dist/*
	cp -rf $(INCLUDE) dist/
	mkdir dist/private
	echo "PUT YOUR TOKEN HERE" >> dist/private/token.txt
	echo Done moving files!
