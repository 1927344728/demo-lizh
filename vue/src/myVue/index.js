function MyVue(options) {
  this.$options = options
  this.template = null
  this.methods = {}
  this.init()
}
MyVue.prototype.init = function () {
  const vm = this
  vm.template = document.querySelector(vm.$options.template)
  vm.methods = vm.$options.methods
  const data = vm.$options.data()
  const keys = Object.keys(data)
  keys.forEach(k => {
    defineReactive(vm, k, data[k])
  })
}
MyVue.prototype.$mount = function (selector) {
  const vm = this
  new Watcher(this, () => {
    render(selector, vm)
  })
}
window.MyVue = MyVue

function defineReactive(obj, key, val) {
  var dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      if (Dep.target) {
        dep.depend();
      }
      return val
    },
    set: function reactiveSetter(newVal) {
      val = newVal
      dep.notify();
    }
  });
  return dep;
}
function render (selector, inst) {
  const dom = parseToDom(inst.template.innerHTML, inst);
  const $app = document.querySelector(selector);
  $app.innerHTML = '';
  $app.appendChild(dom)
}
function parseToDom (html, inst) {
  const dom = new DOMParser().parseFromString(html, 'text/html').body.childNodes[0]
  dom.innerText = dom.innerText.replace(/{{.*}}/, function (str) {
    const key = str.replace(/{{(.*)}}/, '$1')
    return inst[key]
  })
  const methodName = dom.getAttribute('@click')
  dom.addEventListener('click', function () {
    inst.methods[methodName].bind(inst)()
  }, false)  
  return dom
}

var Dep = (function () {
  function Dep() {
    this.subs = [];
  }
  Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
  };
  Dep.prototype.depend = function () {
  	if (Dep.target) {
      this.addSub(Dep.target)
    }
  }
  Dep.prototype.removeSub = function (sub) {
    this.subs = this.subs.filter((item) => sub !== item)
  };
  Dep.prototype.notify = function () {
    this.subs.forEach((sub) => { sub.update() })
  };
  return Dep;
}());
Dep.target = null;

var Watcher = (function () {
  function Watcher(vm, expOrFn) {
    this.deps = []
    this.vm = vm
    this.getter = expOrFn
    this.value = this.get()
  }
  Watcher.prototype.get = function () {
    Dep.target = this
    const value = this.getter.call(this.vm)
    Dep.target = null
    return value;
  };

  Watcher.prototype.addDep = function (dep) {
    this.deps.push(dep)
  };
  Watcher.prototype.update = function () {
    const value = this.getter.call(this.vm)
    return value
  };
  return Watcher;
}());