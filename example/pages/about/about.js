const { store1, store2 } = require('../../store');

Component({
  lifetimes: {
    attached() {
      this.$store1 = store1.bind(this);
      this.$store2 = store2.bind(this, ['count'], '$store2');
    },

    detached() {
      this.$store1.unbind();
      this.$store2.unbind();
    },
  },

  methods: {
    increment(e) {
      this[e.target.dataset.store].dispatch('increment');
    },
  },
});
