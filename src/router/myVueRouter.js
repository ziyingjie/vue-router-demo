//https://segmentfault.com/a/1190000015123061/
//https://github.com/Sunny-lucking/howToBuildMyVueRouter
let Vue = null;
class HistoryRoute {
  constructor() {
    this.current = null
  }
}
class VueRouter {
  constructor(options) {
    this.mode = options.mode || "hash"
    this.routes = options.routes || [] //你传递的这个路由是一个数组表
    this.routesMap = this.createMap(this.routes)
    this.history = new HistoryRoute();
    this.init()
  }
  init() {
    if (this.mode === "hash") {
      debugger
      // 先判断用户打开时有没有hash值，没有的话跳转到#/
      location.hash ? '' : location.hash = "/";
      window.addEventListener("load", () => {
        this.history.current = location.hash.slice(1)
      })
      window.addEventListener("hashchange", () => {
        this.history.current = location.hash.slice(1)
        console.log(this.history);
      })
    } else {
      location.pathname ? '' : location.pathname = "/";
      window.addEventListener('load', () => {
        this.history.current = location.pathname
      })
      window.addEventListener("pushState", () => {
        this.history.current = location.pathname
      })
    }
  }

  createMap(routes) {
    return routes.reduce((pre, current) => {
      pre[current.path] = current.component
      return pre;
    }, {})
  }

}
VueRouter.install = function (v) {
  Vue = v;
  Vue.mixin({
    beforeCreate() {
      if (this.$options && this.$options.router) { // 如果是根组件
        this._root = this; //把当前实例挂载到_root上
        this._router = this.$options.router;
        console.log(this);
        // 因此当我们第一次渲染router - view这个组件的时候，
        // 会获取到this._router.history这个对象，
        // 从而就会被监听到获取this._router.history。就会把router - view组件的依赖wacther收集到this._router.history对应的收集器dep中，
        // 因此this._router.history每次改变的时候。this._router.history对应的收集器dep就会通知router - view的组件依赖的wacther执行update() ，
        // 从而使得router - view重新渲染（其实这就是vue响应式的内部原理）
        Vue.util.defineReactive(this, "xxx", this._router.history)
      } else { //如果是子组件
        this._root = this.$parent && this.$parent._root
      }
      Object.defineProperty(this, '$router', {
        get() {
          return this._root._router
        }
      });
      Object.defineProperty(this, '$route', {
        get() {
          return this._root._router.history.current
        }
      })
    }
  })
  Vue.component('router-link', {
    props: {
      to: String
    },
    render(h) {
      let mode = this._self._root._router.mode;
      let to = mode === "hash" ? "#" + this.to : this.to
      //这里可以重写a标签默认行为 不让跳转页面 请求数据
      return h('a', { attrs: { href: to } }, this.$slots.default)
    }
  })
  Vue.component('router-view', {
    render(h) {
      //render函数里的this指向的是一个Proxy代理对象，代理
      //而我们前面讲到每个组件都有一个_root属性指向根组件，
      //根组件上有_router这个路由实例。
      // 所以我们可以从router实例上获得路由表，也可以获得当前路径。 然后再把获得的组件放到h()里进行渲染。
      //根据当前路径从路由表中获取对应的组件进行渲染
      let current = this._self._root._router.history.current
      let routeMap = this._self._root._router.routesMap;
      return h(routeMap[current])
    }
  })
};

export default VueRouter