
CUR_DIR := $(shell pwd)
ROOT_DIR := $(shell pwd)/../../..
build:
	cargo build --target=wasm32-unknown-unknown && \
	cp $(ROOT_DIR)/target/wasm32-unknown-unknown/debug/string_passing.wasm $(CUR_DIR)/string_passing.wasm  &&\
	wasm2wat $(CUR_DIR)/string_passing.wasm > result.wat
echo:
	echo $(CUR_DIR)
run:
	node index.js