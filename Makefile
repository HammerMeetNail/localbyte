.PHONY: local

local:
	python3 -m http.server 9000 --directory public
