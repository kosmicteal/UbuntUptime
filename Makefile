#!make

EXT_UUID=kosmicteal+ubuntuptime@kosmicteal.local

default: install build deploy clean

install:
	@yarn install

build:
	@yarn tsc

deploy:
	mkdir -p $(HOME)/.local/share/gnome-shell/extensions/$(EXT_UUID)
	cp dist/* $(HOME)/.local/share/gnome-shell/extensions/$(EXT_UUID)
	cp metadata.json $(HOME)/.local/share/gnome-shell/extensions/$(EXT_UUID)

clean:
	@rm -rf dist