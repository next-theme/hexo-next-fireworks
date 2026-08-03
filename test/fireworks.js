'use strict';

const assert = require('assert');
const { readFileSync } = require('fs');
const path = require('path');
const vm = require('vm');

const calls = {
  clear: 0,
  fill: 0,
  scale: 0,
  stroke: 0
};
const context = {
  beginPath() {},
  clearRect() {
    calls.clear++;
  },
  fill() {
    calls.fill++;
  },
  arc() {},
  scale() {
    calls.scale++;
  },
  stroke() {
    calls.stroke++;
  }
};
const canvas = {
  classList: {
    add() {}
  },
  getBoundingClientRect() {
    return { left: 0, top: 0 };
  },
  getContext() {
    return context;
  },
  style: {}
};
const documentListeners = {};
const windowListeners = {};
const animationFrames = [];
let currentTime = 0;
let frameId = 0;

const sandbox = {
  clearTimeout() {},
  document: {
    addEventListener(name, callback) {
      documentListeners[name] = callback;
    },
    body: {
      append() {}
    },
    createElement() {
      return canvas;
    }
  },
  performance: {
    now() {
      return currentTime;
    }
  },
  requestAnimationFrame(callback) {
    animationFrames.push(callback);
    return ++frameId;
  },
  setTimeout(callback) {
    callback();
    return 1;
  },
  window: {
    addEventListener(name, callback) {
      windowListeners[name] = callback;
    },
    innerHeight: 600,
    innerWidth: 800
  }
};

function runAnimationFrame(timestamp) {
  currentTime = timestamp;
  const callbacks = animationFrames.splice(0);
  callbacks.forEach(callback => callback(timestamp));
}

const source = readFileSync(path.resolve(__dirname, '..', 'fireworks.js'), 'utf8');
vm.runInNewContext(source, sandbox);
windowListeners.load();

assert.strictEqual(calls.scale, 1);
assert.strictEqual(canvas.width, 1600);
assert.strictEqual(canvas.height, 1200);
assert.strictEqual(animationFrames.length, 0);

const pageTarget = { id: '', nodeName: 'DIV' };
documentListeners.mousedown({ clientX: 100, clientY: 200, target: pageTarget });
documentListeners.mousedown({ clientX: 300, clientY: 400, target: pageTarget });

assert.strictEqual(animationFrames.length, 1);
runAnimationFrame(16);
assert.strictEqual(calls.clear, 1);
assert.strictEqual(calls.fill, 60);
assert.strictEqual(calls.stroke, 2);
assert.strictEqual(animationFrames.length, 1);

runAnimationFrame(2000);
assert.strictEqual(calls.clear, 2);
assert.strictEqual(animationFrames.length, 0);

documentListeners.mousedown({
  clientX: 100,
  clientY: 200,
  target: { id: '', nodeName: 'A' }
});
assert.strictEqual(animationFrames.length, 0);

documentListeners.mousedown({ clientX: 100, clientY: 200, target: pageTarget });
assert.strictEqual(animationFrames.length, 1);
runAnimationFrame(2016);
assert.strictEqual(calls.fill, 90);
