const test = require('node:test');
const assert = require('node:assert/strict');

const { getPort, isAllowedOrigin } = require('./index.js');

test('uses a production-safe default port', () => {
  assert.equal(getPort(), 3001);
});

test('accepts localhost and configured origins', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173'), true);
  assert.equal(isAllowedOrigin('https://example.com'), false);
});
