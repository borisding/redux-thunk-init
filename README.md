## redux-thunk-init

[![npm version](https://img.shields.io/npm/v/redux-thunk-init.svg?style=flat-square)](https://www.npmjs.com/package/redux-thunk-init)
[![build status](https://img.shields.io/travis/borisding/redux-thunk-init/master.svg?style=flat-square)](https://travis-ci.org/borisding/redux-thunk-init)
[![npm downloads](https://img.shields.io/npm/dm/redux-thunk-init.svg?style=flat-square)](https://www.npmjs.com/package/redux-thunk-init)

- An opt-in addon for `redux-thunk` middleware to perform asynchronous dispatch.
- You may only need this if you need to handle something before the subsequent action is dispatched. (imagine the dispatch "start" action in action creators)

## Usage

- Assumed you have already [installed](https://github.com/reduxjs/redux-thunk#installation) and enabled redux-thunk middleware. Then, install package:

```
npm i redux-thunk-init
```

- Instead of returning thunk function directly in action creator, we wrap it with `init` function as first argument.
- `extra` can be provided, by passing it as second argument which to be assigned to `meta` in `INIT_FULFILLED` action. (default: `{}`)

```js
import init from redux-thunk-init;

function myActionCreator() {
  const extra = {
    /* additional info you want to pass as second argument (optional) */
  };

  return init((dispatch, getState, extraArgument) => {
    // do some stuff here,
    // eg: return dispatched action or Promise-based `fetch`
  }, extra);
}
```

- Once `myActionCreator` is invoked, an initial action will be dispatched:

```js
{
  type: 'INIT_FULFILLED',
  meta: extra, // the second argument passed to `init`
  payload: {
    fulfilled: true,
    message: 'Init action dispatched!'
  }
}
```

- You may do something in common at this initial stage in reducers, before subsequent action(s) is dispatched.

- If initial action is not required, you may continue with the original redux thunk approach without using `init` wrapper.

#### Promises

- `init` will eventually return a promise once action creator is invoked.

- When a promise is returned, the original promise will remain untouched and be used (eg: the fetch's promise). Otherwise, the promise that resolved initial action will be returned.

- By default, this addon is throwing back the reason when promise is rejected. However, it's possible for us to handle thrown error for all actions wrapped by `init`, globally:

For instance, we have one error action creator, `errorActionCreator` defined as follows:

```js
// `error` received from rejected promise,
// you shape whatever error action based on needs
const errorActionCreator = error => ({
  type: "ERROR_ACTION",
  payload: error
});
```

and then, we pass it as one of the extra arguments via `redux-thunk` middleware:

```js
const store = createStore(
  reducer,
  applyMiddleware(
    thunk.withExtraArgument({
      errorActionCreator // we register `errorActionCreator` here
    })
  )
);
```

When promise get rejected, `errorActionCreator` will be dispatched from this addon instead of throwing error back.

## License

MIT
