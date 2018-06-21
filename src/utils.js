const isFunction = arg => typeof arg === 'function';
const isPromise = arg =>
  !!arg && typeof arg === 'object' && typeof arg.then === 'function';

export { isFunction, isPromise };
