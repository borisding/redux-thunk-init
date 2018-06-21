import { isFunction, isPromise } from './utils';

const INIT_REJECTED = 'INIT_REJECTED';
const INIT_FULFILLED = 'INIT_FULFILLED';

export default function init(thunk, extra = null) {
  return (dispatch, getState, extraArgument) => {
    const _promise = new Promise((resolve, reject) => {
      if (!isFunction(thunk)) {
        reject(
          dispatch({
            type: INIT_REJECTED,
            meta: extra,
            payload: {
              rejected: true,
              message: 'Invalid thunk function!'
            }
          })
        );
      } else {
        resolve(
          dispatch({
            type: INIT_FULFILLED,
            meta: extra,
            payload: {
              fulfilled: true,
              message: 'Init action dispatched!'
            }
          })
        );
      }
    });

    const _thunk = thunk(dispatch, getState, extraArgument);
    const onRejected = reason => {
      throw reason;
    };

    if (isPromise(_thunk)) {
      return _thunk.then(value => value, onRejected);
    }

    return _promise.then(() => _thunk, onRejected);
  };
}
