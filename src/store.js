class Store {
  constructor(options = {}) {
    this.id = Symbol('atomu');
    this.state = options.state || {};
    this.actions = options.actions || {};
    this.plugins = options.plugins || [];
    this.dependencies = {};
    this.listeners = new Set();

    this.plugins.forEach((plugin) => plugin(this));
  }

  register(ctx, stateKeys, namespace) {
    // register a namespace
    ctx[this.id] ??= [];
    ctx[this.id].push(namespace);

    const data = {};

    stateKeys.forEach((stateKey) => {
      data[stateKey] = this.state[stateKey];

      // collect dependencies
      this.dependencies[stateKey] ??= new Set();
      this.dependencies[stateKey].add(ctx);
    });

    // injection states
    ctx.setData({ [namespace]: data });
  }

  unregister(ctx, stateKeys) {
    stateKeys.forEach((stateKey) => {
      const stateDependencies = this.dependencies[stateKey];
      stateDependencies.delete(ctx);
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener) {
    this.listeners.delete(listener);
  }

  get() {
    return this.state;
  }

  set(state) {
    // read the dependency of stateKey
    const stateDependencies = [];

    Object.keys(state).forEach((stateKey) => {
      // update the state in the store
      if (stateKey in this.state) {
        this.state[stateKey] = state[stateKey];
      }

      stateDependencies.push(...(this.dependencies[stateKey] || []));
    });

    [...new Set(stateDependencies)].forEach((ctx) => {
      const namespaces = ctx[this.id];

      // calculate the state that needs to be updated based on the namespace
      const data = namespaces.reduce((prev, namespace) => {
        prev[namespace] = { ...(ctx.data[namespace] || {}) };

        Object.keys(state).forEach((stateKey) => {
          if (stateKey in prev[namespace]) {
            prev[namespace][stateKey] = state[stateKey];
          }
        });
        return prev;
      }, {});

      // update states
      ctx.setData(data);
    });
  }

  dispatch(type, payload) {
    const action = this.actions[type];
    const get = this.get.bind(this);
    const set = this.set.bind(this);
    const context = { get, set };

    return Promise.resolve(action(context, payload)).then(() => {
      this.listeners.forEach((listener) => {
        listener({ type, payload }, this.get());
      });
    });
  }
}

export function createStore(options) {
  const store = new Store(options);

  const getState = store.get.bind(store);
  const dispatch = store.dispatch.bind(store);

  function bind(ctx, stateKeys, namespace) {
    namespace ??= '$store';
    stateKeys ??= Object.keys(store.get());

    if (!ctx[namespace]) {
      store.register(ctx, stateKeys, namespace);
    } else {
      console.error('the namespace has already been registered.');
    }

    function unbind() {
      store.unregister(ctx, stateKeys);
    }

    return { unbind, dispatch };
  }

  function subscribe(listener) {
    store.subscribe(listener);

    return function unsubscribe() {
      store.unsubscribe(listener);
    };
  }

  return { getState, bind, dispatch, subscribe };
}
