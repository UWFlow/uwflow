'use strict';

// Webpack 4 hardcodes `md4` for module/chunk/contenthash hashing, but Node 17+
// ships with OpenSSL 3, which disables MD4 by default and throws
// `ERR_OSSL_EVP_UNSUPPORTED` the moment webpack tries to use it. Rather than
// requiring every dev/CI to set `NODE_OPTIONS=--openssl-legacy-provider`, we
// monkey-patch `crypto.createHash` once at process start: any request for
// `md4` is transparently served by `sha256` instead. Webpack only uses these
// hashes for cache busting and chunk identity (not security), so swapping in
// a stronger algorithm is safe. Must be required before `webpack` is loaded
// in scripts/start.js and scripts/build.js. Remove this shim if/when we
// upgrade to webpack 5, which uses xxhash and no longer needs MD4.
const crypto = require('crypto');

const createHash = crypto.createHash;

crypto.createHash = (algorithm, options) =>
  createHash(algorithm === 'md4' ? 'sha256' : algorithm, options);
