function Class () { }

Class.prototype = {
  super: function () {
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



function Person () { }

Person.prototype = Object.create(Class.prototype);

Class.extend(Person, (function () {
  var _age;
  var _name;
  return {
    _PARENT: Class,
    init: function (name, age) {
      _age = age;
      _name = name;

      return this.super.call(Person.prototype);
    },
    getOlder: function () {
      _age += 1;
    },
    getAge: function () {
      return _age;
    },
    getName: function () {
      return _name;
    }
  };
}()));


function Developer () { }

Developer.prototype = Object.create(Person.prototype);

Class.extend(Developer, (function () {
  var _languages = [];
  return {
    _PARENT: Person,
    init: function (languages, name, age) {
      _languages = languages;

      return this.super.call(Developer.prototype, name, age);
    },
    addLanguage: function (language) {
      _languages.push(language);
    },
    getLanguages: function () {
      return _languages.join(', ');
    }
  };
}()));

