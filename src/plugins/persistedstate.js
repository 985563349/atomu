export function createPersistedState({
  key = 'atomu',
  actionFilter = (mutation, state) => true,
} = {}) {
  function getState(key) {
    const value = wx.getStorageSync(key);

    try {
      return typeof value === 'string'
        ? JSON.parse(value)
        : typeof value === 'object'
        ? value
        : undefined;
    } catch (err) {}

    return undefined;
  }

  function setState(key, state) {
    wx.setStorageSync(key, state);
  }

  return (context) => {
    const savedState = getState(key);

    if (typeof savedState === 'object' && savedState !== null) {
      context.set(savedState);
    }

    context.subscribe((mutation, state) => {
      if (actionFilter(mutation, state)) {
        setState(key, state);
      }
    });
  };
}
