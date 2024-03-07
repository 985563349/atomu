class Store {
  constructor(options) {
    this.id = Symbol('atomu');
    this.state = options.state;
    this.actions = options.actions;
    this.dependencies = {};
    this.listeners = new Set();
  }

  register(ctx, states, namespace) {
    // register a namespace
    ctx[this.id] ??= [];
    ctx[this.id].push(namespace);

    const data = {};

    states.forEach((stateKey) => {
      data[stateKey] = this.state[stateKey];

      // collect dependencies
      this.dependencies[stateKey] ??= new Set();
      this.dependencies[stateKey].add(ctx);
    });

    // injection states
    ctx.setData({ [namespace]: data });
  }

  unregister(ctx, states) {
    states.forEach((stateKey) => {
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

  getState() {
    return this.state;
  }

  setState(state) {
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
        Object.keys(state).forEach((stateKey) => {
          if (stateKey in ctx.data[namespace]) {
            prev[namespace] ??= {};
            prev[namespace][stateKey] = state[stateKey];
          }
        });
        return prev;
      }, {});

      // update states
      ctx.setData(data);
    });
  }
}

export function createStore(options) {
  const store = new Store(options);

  const dispatch = (type, payload) => {
    const action = store.actions[type];
    const get = store.getState.bind(store);
    const set = store.setState.bind(store);
    const context = { get, set };

    return Promise.resolve(action(context, payload)).then(() => {
      store.listeners.forEach((listener) => {
        listener({ type, payload }, store.getState());
      });
    });
  };

  const subscribe = (listener) => {
    store.subscribe(listener);
    return () => store.unsubscribe(listener);
  };

  const bind = (ctx, states, namespace) => {
    namespace ??= '$store';
    states ??= Object.keys(store.getState());

    if (!ctx[namespace]) {
      store.register(ctx, states, namespace);
    } else {
      console.error('the namespace has already been registered.');
    }

    const unbind = () => {
      store.unregister(ctx, states);
    };

    return { unbind, dispatch };
  };

  return { bind, dispatch, subscribe };
}
