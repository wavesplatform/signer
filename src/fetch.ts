const globalObject: any =
    typeof globalThis === 'object'
        ? globalThis
        : typeof self === 'object'
        ? self
        : typeof global === 'object'
        ? global
        : {};

if (typeof globalObject.globalThis === 'undefined') {
    globalObject.globalThis = globalObject;
}

if (typeof globalObject.fetch !== 'function') {
    globalObject.fetch = require('node-fetch');
}
