import configureStore from 'redux-mock-store';
import fetch from 'node-fetch';
import nock from 'nock';
import thunk from 'redux-thunk';
import init from '../src/index';

const middlewares = [thunk.withExtraArgument({ api: 'api' })];
const mockStore = configureStore(middlewares);

const types = {
  ADD_TODO: 'ADD_TODO',
  TODOS_SUCCESS: 'TODOS_SUCCESS',
  INIT_REJECTED: 'INIT_REJECTED',
  INIT_FULFILLED: 'INIT_FULFILLED'
};

const todo = 'my new todo!';
const todoAction = { type: types.ADD_TODO, payload: { todos: [todo] } };
const todoActionCreator = () => init(dispatch => dispatch(todoAction));
const invalidActionCreator = () => init(null);

let store;

beforeEach(() => {
  store = mockStore({ todos: ['todo'] });
});

describe('dispatch `INIT_FULFILLED` action from action creator:', () => {
  test('`INIT_FULFILLED` action type is dispatched', () => {
    store.dispatch(todoActionCreator());
    const actions = store.getActions();
    expect(actions[0].type).toBe(types.INIT_FULFILLED);
  });

  test('`INIT_FULFILLED` action has `meta` property', () => {
    store.dispatch(todoActionCreator());
    const actions = store.getActions();
    expect(actions[0]).toHaveProperty('meta');
  });

  test('`INIT_FULFILLED` action has `payload` property', () => {
    store.dispatch(todoActionCreator());
    const actions = store.getActions();
    expect(actions[0]).toHaveProperty('payload');
  });

  test("`INIT_FULFILLED` action's payload `fulfilled` property is `true`", () => {
    store.dispatch(todoActionCreator());
    const actions = store.getActions();
    expect(actions[0].payload).toHaveProperty('fulfilled', true);
  });

  test("`INIT_FULFILLED` action's payload `message` property value", () => {
    store.dispatch(todoActionCreator());
    const actions = store.getActions();
    expect(actions[0].payload).toHaveProperty(
      'message',
      'Init action dispatched!'
    );
  });
});

describe('dispatch `INIT_REJECTED` action from action creator:', () => {
  test('`INIT_REJECTED` action type is dispatched', done => {
    store.dispatch(invalidActionCreator()).catch(error => {
      expect(error.type).toBe(types.INIT_REJECTED);
      done();
    });
  });

  test('`INIT_REJECTED` action has `payload` property', done => {
    store.dispatch(invalidActionCreator()).catch(error => {
      expect(error).toHaveProperty('payload');
      done();
    });
  });

  test("`INIT_REJECTED` action's payload `rejected` property is `true`", done => {
    store.dispatch(invalidActionCreator()).catch(error => {
      expect(error.payload).toHaveProperty('rejected', true);
      done();
    });
  });

  test("`INIT_REJECTED` action's payload `message` property value", done => {
    store.dispatch(invalidActionCreator()).catch(error => {
      expect(error.payload).toHaveProperty(
        'message',
        'Invalid thunk function!'
      );
      done();
    });
  });
});

describe('dispatch action from action creator via `fetch`:', () => {
  const urlSegments = ['http://example.com', '/todos'];

  const httpMock = todo =>
    nock(urlSegments[0])
      .get(urlSegments[1])
      .reply(200, { payload: { todos: [todo] } });

  const fetchTodos = (url = urlSegments.join('')) =>
    init(dispatch =>
      fetch(url)
        .then(response => response.json())
        .then(json =>
          dispatch({ type: types.TODOS_SUCCESS, todos: json.payload.todos })
        )
    );

  beforeEach(() => {
    httpMock(todo);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('`init` function for http request, action returned successfully', done => {
    store.dispatch(fetchTodos()).then(action => {
      const dispatchedTodo = store.getActions()[1];

      expect(dispatchedTodo.type).toBe(types.TODOS_SUCCESS);
      expect(dispatchedTodo.todos[0]).toBe(todo);

      expect(action.type).toBe(types.TODOS_SUCCESS);
      expect(action.todos[0]).toBe(todo);

      done();
    });
  });

  test('`init` function for http request, action returned unsuccessfully', done => {
    store
      .dispatch(fetchTodos('http://fake.com'))
      .then(() => {
        // it won't reach here
        console.log("You can't see me");
      })
      .catch(errors => {
        expect(errors.code).toBe('ENOTFOUND');
        done();
      });
  });
});

describe('dispatch action from action creator without `fetch`:', () => {
  test('action returned successfully', done => {
    store.dispatch(todoActionCreator()).then(action => {
      const dispatchedTodo = store.getActions()[1];

      expect(dispatchedTodo.type).toBe(types.ADD_TODO);
      expect(dispatchedTodo.payload.todos[0]).toBe(todo);

      expect(action.type).toBe(types.ADD_TODO);
      expect(action.payload.todos[0]).toBe(todo);

      done();
    });
  });

  test('action returned unsuccessfully', done => {
    const value = 'Failed';
    const promiseRejectedActionCreator = () => {
      /* eslint-disable no-unused-vars */
      return init(dispatch => Promise.reject(value));
    };

    store
      .dispatch(promiseRejectedActionCreator())
      .then(() => {
        // it won't reach here
        console.log("You can't see me");
      })
      .catch(errors => {
        expect(errors).toBe(value);
        done();
      });
  });
});

describe('`init` configurations:', () => {
  test('`getState`, `extraArgument` arguments in init', done => {
    const actionCreator = () =>
      init((dispatch, getState, extraArgument) => {
        expect(getState()).toHaveProperty('todos');
        expect(extraArgument).toHaveProperty('api');
        dispatch(todoAction);
        done();
      });

    store.dispatch(actionCreator());
  });

  test('`extra`, in `meta` property for INIT_FULFILLED', done => {
    const actionCreator = () =>
      init(dispatch => dispatch(todoAction), { key: 'value' });

    store.dispatch(actionCreator()).then(() => {
      const dispatchedInitAction = store.getActions()[0];
      expect(dispatchedInitAction.meta).toHaveProperty('key', 'value');
      done();
    });
  });
});
