/* global hexo */

'use strict';

const Util = require('@next-theme/utils');
const utils = new Util(hexo, __dirname);

hexo.extend.filter.register('theme_inject', injects => {

  injects.head.raw('fireworks', '<script async src="{{ url_for("lib/fireworks.js") }}"></script>');
  injects.style.push(utils.getFilePath('fireworks.styl'));
});

hexo.extend.generator.register('fireworks', () => ({
  path: 'lib/fireworks.js',
  data: utils.getFileContent('fireworks.js')
}));
