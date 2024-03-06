# atomu

[![npm version](https://img.shields.io/npm/v/atomu.svg?style=flat-square)](https://www.npmjs.com/package/atomu)
[![npm downloads](https://img.shields.io/npm/dm/atomu.svg?style=flat-square)](http://npm-stat.com/charts.html?package=atomu)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

一个轻量级微信小程序状态管理库。

## 安装

通过 npm:

```bash
npm install atomu
```

## 用例

### 创建 store

```javascript
const { createStore } = require('atomu');

const store = createStore({
  state: {
    count: 0,
  },

  actions: {
    increment({ set, get }) {
      set({ count: get().count });
    },
  },
});
```

### 在组件中使用

在逻辑层中，绑定 store:

```javascript
Component({
  lifetimes: {
    attached() {
      this.$store = store.bind(this, ['count'], '$store');
    },

    detached() {
      this.$store.unbind();
    },
  },

  methods: {
    increment() {
      this.$store.dispatch('increment');
    },
  },
});
```

完成绑定后，可在视图层中使用 store 中的状态:

```html
<button wx:bind="increment">count: {{ $store.count }}</button>
```

> TIP: 由于小程序框架限制，状态库内无法劫持组件的生命周期，因此在组件销毁后，需要进行手动解绑，否则会造成内存泄漏。

### 携带载荷

actions 可以接受来自 dispatch 方法携带的载荷:

```javascript
actions: {
  increment({ set, get }, payload) {
    set({ count: payload });
  }
}

store.dispatch('increment', 0)
```

### 异步提交更新

actions 支持异步操作:

```javascript
actions: {
  async increment({ set, get }) {
    // await ...
    set({ count: get().count });
  }
}
```

dispatch 会返回一个 Promise 实例，可以判断当前异步 action 是否执行成功：

```javascript
store
  .dispatch('increment')
  .then(() => {
    // ...
  })
  .catch(() => {
    // ...
  });
```

### 订阅状态更新

```javascript
Component({
  lifetimes: {
    attached() {
      this.unsubscribe = store.subscribe((mutation, state) => {
        console.log(mutation, state);
      });
    },

    detached() {
      this.unsubscribe();
    },
  },
});
```

### 绑定多个 store

```javascript
Component({
  lifetimes: {
    attached() {
      this.$store = store.bind(this, ['count'], '$store');
      this.$user = user.bind(this, ['profile'], '$user');
    },

    detached() {
      this.$store.unbind();
      this.$user.unbind();
    },
  },
});
```

## API

### bind

- `bind(ctx: Component | Page, stateKey: string[], namespace?: string)`

bind 方法用于将 store 中的状态绑定到组件中，stateKey 可以指定需要绑定 store 中的哪些状态。namespace 用于为绑定的状态创建独立的空间，在状态更新时只会更新空间内的状态（这在绑定多个 store 时很有用）。

bind 方法绑定的状态都会存储在组件的 data 对象中:

```javascript
Component({
  lifetimes: {
    attached() {
      this.$store = store.bind(this, ['count'], '$store');
    },

    detached() {
      this.$store.unbind();
    },
  },

  methods: {
    increment() {
      // 访问状态
      this.$store.dispatch('increment', this.data.$store.count);
    },
  },
});
```
