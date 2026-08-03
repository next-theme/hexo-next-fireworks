'use strict';

const assert = require('assert');
const { readFileSync } = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const pluginPath = require.resolve('..');

assert.ok(!packageJson.dependencies.animejs);

function loadPlugin(fireworksConfig) {
  const registrations = {};

  global.hexo = {
    config: {
      fireworks: fireworksConfig
    },
    extend: {
      filter: {
        register(name, callback) {
          registrations[name] = callback;
        }
      },
      generator: {
        register(name, callback) {
          registrations[name] = callback;
        }
      }
    }
  };

  delete require.cache[pluginPath];
  require(pluginPath);
  delete global.hexo;

  return registrations;
}

const enabled = loadPlugin();
const injected = {};
const styles = [];

enabled.theme_inject({
  head: {
    raw(name, value) {
      injected[name] = value;
    }
  },
  style: {
    push(value) {
      styles.push(value);
    }
  }
});

assert.strictEqual(injected.fireworks, '<script defer src="{{ url_for("lib/fireworks.js") }}"></script>');
assert.strictEqual(styles.length, 1);
assert.strictEqual(styles[0], path.resolve(__dirname, '..', 'fireworks.styl'));

const route = enabled.fireworks();

assert.strictEqual(route.path, 'lib/fireworks.js');
assert.strictEqual(route.data, readFileSync(path.resolve(__dirname, '..', 'fireworks.js'), 'utf8'));
assert.ok(!/\banime\b/.test(route.data));

const disabled = loadPlugin({ enable: false });

assert.deepStrictEqual(disabled, {});
