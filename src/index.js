import { isFunction, isPromise } from './utils';

export const INIT_REJECTED = 'INIT_REJECTED';
export const INIT_FULFILLED = 'INIT_FULFILLED';

export default function init(thunk, extra = {}) {
  return (dispatch, getState, extraArgument = {}) => {
    const _promise = new Promise((resolve, reject) => {
      if (!isFunction(thunk)) {
        reject(
          dispatch({
            type: INIT_REJECTED,
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

    const onRejected = reason => {
      const { errorActionCreator } = extraArgument;

      if (!errorActionCreator) {
        throw reason;
      }

      if (typeof errorActionCreator !== 'function') {
        throw new TypeError('`errorActionCreator` must be a function.');
      }

      // dispatch error action creator that is passed
      // via `redux-thunk` extraArgument, which accepts given error
      return dispatch(errorActionCreator(reason));
    };

    const _thunk =
      isFunction(thunk) && thunk(dispatch, getState, extraArgument);

    if (isPromise(_thunk)) {
      return _thunk.then(value => value, onRejected);
    }

    return _promise.then(() => _thunk, onRejected);
  };
}
