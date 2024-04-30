(function () {
  console.log("Hello, World!");

  // Create a safe reference to the Underscore object for use below.
  var _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  _.chain = function (obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  var chainResult = function (instance, obj) {
    let result = instance._chain ? _(obj).chain() : obj;
    return result;
  };

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function (obj, iteratee) {
    var i, length;
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i);
    }
    return obj;
  };

  // Add all mutator Array functions to the wrapper.
  var ArrayProto = Array.prototype;

  _.each(
    ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"],
    function (name) {
      var method = ArrayProto[name];
      _.prototype[name] = function () {
        var obj = this._wrapped;
        method.apply(obj, arguments);
        if ((name === "shift" || name === "splice") && obj.length === 0)
          delete obj[0];
        return chainResult(this, obj);
      };
    }
  );

  _.isFunction = function (obj) {
    return typeof obj == "function" || false;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Add your own custom functions to the Underscore object.
  var push = ArrayProto.push;
  _.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      var func = (_[name] = obj[name]);
      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  _.prototype.value = function () {
    return this._wrapped;
  };

  _.prototype.toString = function () {
    return String(this._wrapped);
  };

  window._ = _;
})();
