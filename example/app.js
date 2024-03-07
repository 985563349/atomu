const { store1, store2 } = require('./store');

App({
  onLaunch() {
    store1.subscribe((mutation, state) => {
      console.log('store1', mutation, state);
    });

    store2.subscribe((mutation, state) => {
      console.log('store2', mutation, state);
    });
  },
});
