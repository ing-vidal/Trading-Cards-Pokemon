const path = require('path');

process.chdir(path.join(__dirname, 'apps', 'api'));
require('./dist/main.js');
