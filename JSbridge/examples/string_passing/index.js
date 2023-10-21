const fs = require('fs/promises');
const path = require('path');

let wasmExports = null;
let wasmMemory = null;

/**
 * 
 */

function getEncodedString(string) {
    const encoder = new TextEncoder();
    const encodedString = encoder.encode(string);
    return encodedString;
}

function getDecodedString(rawString) {
    const decoder = new TextDecoder();
    const decodedString = decoder.decode(rawString);
    return decodedString;
}

function passStringToWasm(string) {
    // alloc memory by rs
    const ptr = wasmExports.alloc_memory(string.length, 1);
    // write it by js
    const memoryArray = new Uint8Array(wasmMemory.buffer);
    const encodedString = getEncodedString(string);
    memoryArray.subarray(ptr >>> 0, (ptr >>> 0) + encodedString.length).set(encodedString);
    return ptr;
}

function getStringFromWasm(ptr, len) {
    const memoryArray = new Uint8Array(wasmMemory.buffer);
    const rawString = memoryArray.subarray(ptr, ptr + len);
    return rawString;
}

function dropString(ptr, string) {
    // dealloc memory
    const encodedString = getEncodedString(string)
    wasmExports.dealloc_memory(ptr, encodedString.length, 1);
}


function actuallay_js_function(string) {
    console.log("[Js Get String]", string);
}

fs.readFile(path.join(__dirname, "string_arguments.wasm")).then(buffer => {
    WebAssembly.instantiate(buffer, {
        env: {
            log_number: (num) => {
                console.log("[Js Called For Log Number]",num)
            },
            js_function: (ptr, len) => {
                actuallay_js_function(getDecodedString(getStringFromWasm(ptr, len)))
            }
        }
    })
        .then(wasm => {
            // init wasm 
            wasmMemory = wasm.instance.exports.memory;
            wasmExports = wasm.instance.exports;
            // wrap for call wasm wrap function need string arugments
            const ptr = passStringToWasm("string-value-from-js");
            try {
                wasm.instance.exports.function_take_string_reference(ptr, getEncodedString("string-value-from-js").length);
            } finally {
                dropString(ptr);
            }
            wasm.instance.exports.function_call_js_with_string();
        });
});