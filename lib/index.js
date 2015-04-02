var Hoek = require('hoek');

// Declare internals

var internals = {};
  internals.registerList = [];


exports.register = function (server, options, next) {

  function register(hook, plugin, cb){
    internals.registerList.push({hook: hook, plugin: plugin, cb: cb});
  }

  server.expose('register', register);

  server.after(function (server, next) {

    var registerList = internals.registerList;

    var sortedList = registerList.map(function(registerItem){
      var indexOfItem = options.indexOf(registerItem.hook)
      Hoek.assert(indexOfItem !== -1, 'Plugin hook is not in the lifecycle options array.');
      registerItem._index = indexOfItem;
      return registerItem;
    }).sort(function compare(a, b) {
      if (a._index < b._index) {
        return -1;
      }
      if (a._index > b._index) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });

    sortedList.forEach(function(registerItem){
      server.register(registerItem.plugin, registerItem.cb);
    });

    next();

  });

  return next();
};

exports.register.attributes = {
    pkg: require('../package.json'),
    name: 'lifecycle'
};
