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

### 组件中使用

在逻辑层中，绑定 store：

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

完成绑定后，可以在视图层中轻松访问并使用 store 中存储的状态：

```html
<button wx:bind="increment">count: {{ $store.count }}</button>
```

> TIP: 由于小程序框架的限制，状态库无法自动劫持组件的生命周期。因此，在组件销毁后，务必手动进行解绑操作，以避免潜在的内存泄漏问题。

### 携带载荷

actions 可以接收 dispatch 方法传递的载荷，从而灵活处理各种业务逻辑：

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

调用 dispatch 方法时，会返回一个 Promise 实例，能够方便地判断异步 action 的执行状态：

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

- `bind(ctx: Component | Page, stateKey?: string[], namespace?: string)`

bind 方法用于将 store 中的状态绑定到组件中，通过 stateKey 参数，可以指定需要绑定的具体状态（若未指定，则默认绑定 store 中的所有状态）。而 namespace 则用于为绑定的状态创建一个独立的空间，确保在状态更新时仅更新该空间内的状态，这在同时绑定多个 store 时尤为实用，有助于避免状态之间的混淆和冲突。

bind 方法所绑定的状态都会自动存储在组件的 data 对象中，方便在组件内部直接使用这些状态数据：

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

## 插件

### Logger

日志插件用于一般的调试：

```javascript
const { createLogger } = require('atomu');

const store = createStore({
  plugins: [createLogger()],
});
```

createLogger 函数有几个配置项：

```javascript
const logger = createLogger({
  collapsed: false, // 自动展开记录的 mutation
  filter(mutation, state) {
    // 若 mutation 需要被记录，就让它返回 true 即可
    // `mutation` 的格式是 `{ type, payload }`
    return mutation.type !== 'ignore';
  },
  logger: console, // 自定义 console 实现，默认为 `console`
});
```

### Persisted State

持久化插件用于本地缓存 store 中的状态：

```javascript
const { createPersistedState } = require('atomu');

const store = createStore({
  plugins: [createPersistedState()],
});
```

createPersistedState 函数有几个配置项：

```javascript
const logger = createPersistedState({
  key: 'atomu', // 本地缓存中指定的 key
  filter(mutation, state) {
    // 若 mutation 需要被记录，就让它返回 true 即可
    // `mutation` 的格式是 `{ type, payload }`
    return mutation.type !== 'ignore';
  },
});
```
