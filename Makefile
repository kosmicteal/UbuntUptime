#!make

EXT_UUID=kosmicteal+ubuntuptime@kosmicteal.local

default: install build deploy clean

install:
	@yarn install

build:
	@yarn tsc
	echo "[MAKE] Build complete"

deploy:
	mkdir -p $(HOME)/build
	cp dist/* $(HOME)/build
	cp metadata.json $(HOME)/build

	echo "[MAKE] Deploy complete"
	ls $(HOME)/build

clean:
	@rm -rf dist