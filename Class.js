function Class () { 'use strict'; }

Class.prototype = {
  _PARENT: Class,
  _super: function () {
    this._PARENT.prototype.init.apply(this, arguments);
  },
  init: function () { }
};

Class.extend = function (newClass, stuff) {
  var i;
  for (i in stuff) {
    newClass.prototype[i] = stuff[i];
  }
};
