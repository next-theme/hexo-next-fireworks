/* global hexo */

'use strict';

const Util = require('next-util');
const utils = new Util(hexo, __dirname);
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('theme_inject', injects => {

  injects.head.raw('fireworks', '<script src="{{ url_for("lib/fireworks.js") }}"></script>');
  injects.style.push(utils.getFilePath('fireworks.styl'));
});

hexo.extend.generator.register('fireworks', () => {
  return {
    path: 'lib/fireworks.js',
    data: function() {
      return fs.createReadStream(path.join(__dirname, 'fireworks.js'));
    }
  };
});
