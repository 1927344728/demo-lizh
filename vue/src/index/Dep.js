/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};

var uid$2 = 0;
var pendingCleanupDeps = [];
var cleanupDeps = function () {
  for (var i = 0; i < pendingCleanupDeps.length; i++) {
    var dep = pendingCleanupDeps[i];
    dep.subs = dep.subs.filter(function (s) { return s; });
    dep._pending = false;
  }
  pendingCleanupDeps.length = 0;
};
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * @internal
 */
var Dep = /** @class */ (function () {
  function Dep() {
    // pending subs cleanup
    this._pending = false;
    this.id = uid$2++;
    this.subs = [];
  }
  Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
  };
  Dep.prototype.removeSub = function (sub) {
    // #12696 deps with massive amount of subscribers are extremely slow to
    // clean up in Chromium
    // to workaround this, we unset the sub for now, and clear them on
    // next scheduler flush.
    this.subs[this.subs.indexOf(sub)] = null;
    if (!this._pending) {
      this._pending = true;
      pendingCleanupDeps.push(this);
    }
  };
  Dep.prototype.depend = function (info) {
    if (Dep.target) {
      Dep.target.addDep(this);
      if (info && Dep.target.onTrack) {
        Dep.target.onTrack(__assign({ effect: Dep.target }, info));
      }
    }
  };
  Dep.prototype.notify = function (info) {
    // stabilize the subscriber list first
    var subs = this.subs.filter(function (s) { return s; });
    if (!config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort(function (a, b) { return a.id - b.id; });
    }
    for (var i = 0, l = subs.length; i < l; i++) {
      var sub = subs[i];
      if (info) {
        sub.onTrigger &&
          sub.onTrigger(__assign({ effect: subs[i] }, info));
      }
      sub.update();
    }
  };
  return Dep;
}());
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
var targetStack = [];
function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}
function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

/*
  * not type checking this file because flow doesn't play well with
  * dynamically accessing methods on Array prototype
  */
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);
var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];
/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted)
      ob.observeArray(inserted);
    // notify change
    {
      ob.dep.notify({
        type: "array mutation" /* TriggerOpTypes.ARRAY_MUTATION */,
        target: this,
        key: method
      });
    }
    return result;
  });
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
var NO_INIITIAL_VALUE = {};
/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
var shouldObserve = true;
function toggleObserving(value) {
  shouldObserve = value;
}
// ssr mock dep
var mockDep = {
  notify: noop,
  depend: noop,
  addSub: noop,
  removeSub: noop
};
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = /** @class */ (function () {
  function Observer(value, shallow, mock) {
    if (shallow === void 0) { shallow = false; }
    if (mock === void 0) { mock = false; }
    this.value = value;
    this.shallow = shallow;
    this.mock = mock;
    // this.value = value
    this.dep = mock ? mockDep : new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (isArray(value)) {
      if (!mock) {
        if (hasProto) {
          value.__proto__ = arrayMethods;
          /* eslint-enable no-proto */
        }
        else {
          for (var i = 0, l = arrayKeys.length; i < l; i++) {
            var key = arrayKeys[i];
            def(value, key, arrayMethods[key]);
          }
        }
      }
      if (!shallow) {
        this.observeArray(value);
      }
    }
    else {
      /**
       * Walk through all properties and convert them into
       * getter/setters. This method should only be called when
       * value type is Object.
       */
      var keys = Object.keys(value);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        defineReactive(value, key, NO_INIITIAL_VALUE, undefined, shallow, mock);
      }
    }
  }
  /**
   * Observe a list of Array items.
   */
  Observer.prototype.observeArray = function (value) {
    for (var i = 0, l = value.length; i < l; i++) {
      observe(value[i], false, this.mock);
    }
  };
  return Observer;
}());
// helpers
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe(value, shallow, ssrMockReactivity) {
  if (value && hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    return value.__ob__;
  }
  if (shouldObserve &&
    (ssrMockReactivity || !isServerRendering()) &&
    (isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value.__v_skip /* ReactiveFlags.SKIP */ &&
    !isRef(value) &&
    !(value instanceof VNode)) {
    return new Observer(value, shallow, ssrMockReactivity);
  }
}
/**
 * Define a reactive property on an Object.
 */
function defineReactive(obj, key, val, customSetter, shallow, mock) {
  var dep = new Dep();
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) &&
    (val === NO_INIITIAL_VALUE || arguments.length === 2)) {
    val = obj[key];
  }
  var childOb = !shallow && observe(val, false, mock);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        {
          dep.depend({
            target: obj,
            type: "get" /* TrackOpTypes.GET */,
            key: key
          });
        }
        if (childOb) {
          childOb.dep.depend();
          if (isArray(value)) {
            dependArray(value);
          }
        }
      }
      return isRef(value) && !shallow ? value.value : value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (!hasChanged(value, newVal)) {
        return;
      }
      if (customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      }
      else if (getter) {
        // #7981: for accessor properties without setter
        return;
      }
      else if (!shallow && isRef(value) && !isRef(newVal)) {
        value.value = newVal;
        return;
      }
      else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal, false, mock);
      {
        dep.notify({
          type: "set" /* TriggerOpTypes.SET */,
          target: obj,
          key: key,
          newValue: newVal,
          oldValue: value
        });
      }
    }
  });
  return dep;
}
function set(target, key, val) {
  if ((isUndef(target) || isPrimitive(target))) {
    warn$2("Cannot set reactive property on undefined, null, or primitive value: ".concat(target));
  }
  if (isReadonly(target)) {
    warn$2("Set operation on key \"".concat(key, "\" failed: target is readonly."));
    return;
  }
  var ob = target.__ob__;
  if (isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    // when mocking for SSR, array methods are not hijacked
    if (ob && !ob.shallow && ob.mock) {
      observe(val, false, true);
    }
    return val;
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }
  if (target._isVue || (ob && ob.vmCount)) {
    warn$2('Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.');
    return val;
  }
  if (!ob) {
    target[key] = val;
    return val;
  }
  defineReactive(ob.value, key, val, undefined, ob.shallow, ob.mock);
  {
    ob.dep.notify({
      type: "add" /* TriggerOpTypes.ADD */,
      target: target,
      key: key,
      newValue: val,
      oldValue: undefined
    });
  }
  return val;
}
function del(target, key) {
  if ((isUndef(target) || isPrimitive(target))) {
    warn$2("Cannot delete reactive property on undefined, null, or primitive value: ".concat(target));
  }
  if (isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }
  var ob = target.__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    warn$2('Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.');
    return;
  }
  if (isReadonly(target)) {
    warn$2("Delete operation on key \"".concat(key, "\" failed: target is readonly."));
    return;
  }
  if (!hasOwn(target, key)) {
    return;
  }
  delete target[key];
  if (!ob) {
    return;
  }
  {
    ob.dep.notify({
      type: "delete" /* TriggerOpTypes.DELETE */,
      target: target,
      key: key
    });
  }
}
/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value) {
  for (var e = void 0, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    if (e && e.__ob__) {
      e.__ob__.dep.depend();
    }
    if (isArray(e)) {
      dependArray(e);
    }
  }
}

function reactive(target) {
  makeReactive(target, false);
  return target;
}
/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
function shallowReactive(target) {
  makeReactive(target, true);
  def(target, "__v_isShallow" /* ReactiveFlags.IS_SHALLOW */, true);
  return target;
}
function makeReactive(target, shallow) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (!isReadonly(target)) {
    {
      if (isArray(target)) {
        warn$2("Avoid using Array as root value for ".concat(shallow ? "shallowReactive()" : "reactive()", " as it cannot be tracked in watch() or watchEffect(). Use ").concat(shallow ? "shallowRef()" : "ref()", " instead. This is a Vue-2-only limitation."));
      }
      var existingOb = target && target.__ob__;
      if (existingOb && existingOb.shallow !== shallow) {
        warn$2("Target is already a ".concat(existingOb.shallow ? "" : "non-", "shallow reactive object, and cannot be converted to ").concat(shallow ? "" : "non-", "shallow."));
      }
    }
    var ob = observe(target, shallow, isServerRendering() /* ssr mock reactivity */);
    if (!ob) {
      if (target == null || isPrimitive(target)) {
        warn$2("value cannot be made reactive: ".concat(String(target)));
      }
      if (isCollectionType(target)) {
        warn$2("Vue 2 does not support reactive collection types such as Map or Set.");
      }
    }
  }
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw" /* ReactiveFlags.RAW */]);
  }
  return !!(value && value.__ob__);
}
function isShallow(value) {
  return !!(value && value.__v_isShallow);
}
function isReadonly(value) {
  return !!(value && value.__v_isReadonly);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  var raw = observed && observed["__v_raw" /* ReactiveFlags.RAW */];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  // non-extensible objects won't be observed anyway
  if (Object.isExtensible(value)) {
    def(value, "__v_skip" /* ReactiveFlags.SKIP */, true);
  }
  return value;
}
/**
 * @internal
 */
function isCollectionType(value) {
  var type = toRawType(value);
  return (type === 'Map' || type === 'WeakMap' || type === 'Set' || type === 'WeakSet');
}


var uid$1 = 0;
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 * @internal
 */
var Watcher = /** @class */ (function () {
  function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
    recordEffectScope(this,
      // if the active effect scope is manually created (not a component scope),
      // prioritize it
      activeEffectScope && !activeEffectScope._vm
        ? activeEffectScope
        : vm
          ? vm._scope
          : undefined);
    if ((this.vm = vm) && isRenderWatcher) {
      vm._watcher = this;
    }
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
      {
        this.onTrack = options.onTrack;
        this.onTrigger = options.onTrigger;
      }
    }
    else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$1; // uid for batching
    this.active = true;
    this.post = false;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression = expOrFn.toString();
    // parse expression for getter
    if (isFunction(expOrFn)) {
      this.getter = expOrFn;
    }
    else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
        warn$2("Failed watching path: \"".concat(expOrFn, "\" ") +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.', vm);
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }
  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher.prototype.get = function () {
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    }
    catch (e) {
      if (this.user) {
        handleError(e, vm, "getter for watcher \"".concat(this.expression, "\""));
      }
      else {
        throw e;
      }
    }
    finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value;
  };
  /**
   * Add a dependency to this directive.
   */
  Watcher.prototype.addDep = function (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };
  /**
   * Clean up for dependency collection.
   */
  Watcher.prototype.cleanupDeps = function () {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };
  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher.prototype.update = function () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    }
    else if (this.sync) {
      this.run();
    }
    else {
      queueWatcher(this);
    }
  };
  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher.prototype.run = function () {
    if (this.active) {
      var value = this.get();
      if (value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          var info = "callback for watcher \"".concat(this.expression, "\"");
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
        }
        else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };
  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher.prototype.evaluate = function () {
    this.value = this.get();
    this.dirty = false;
  };
  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher.prototype.depend = function () {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };
  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher.prototype.teardown = function () {
    if (this.vm && !this.vm._isBeingDestroyed) {
      remove$2(this.vm._scope.effects, this);
    }
    if (this.active) {
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  };
  return Watcher;
}());