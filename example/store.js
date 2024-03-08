const { createStore, createLogger, createPersistedState } = require('atomu');

const store1 = createStore({
  state: {
    count: 0,
  },

  actions: {
    increment({ set, get }) {
      set({ count: get().count + 1 });
    },
  },

  plugins: [createLogger(), createPersistedState()],
});

const store2 = createStore({
  state: {
    count: 0,
  },

  actions: {
    increment({ set, get }) {
      set({ count: get().count + 1 });
    },
  },
});

module.exports = { store1, store2 };
