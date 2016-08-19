function Util() {
  throw new Error('Util should not be instantiated!');
};

Util.findObject = function (objArray, conditions) {
  objArray.forEach(function (object) {
    var valid = conditions.keys().every(function (key) {
      if (object[key] !== conditions[key]) 
        return false;
    });

    if (valid)
      return object;
  });

  return null;
};

if (typeof module === 'object')
  module.exports = Util;
else
  window.Util = Util;
