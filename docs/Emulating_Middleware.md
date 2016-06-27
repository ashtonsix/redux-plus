Emulating Middleware
====================
Reducer Creators
----------------
Without helpers using middleware is more productive than the `createEffect` API. There's more typing per action

```js
const reducer = createReducer({
  INCREMENT: state => state + 1
  INCREMENT_IN_5_SECONDS: state => createEffect(
    state,
    () => new Promise(resolve => setTimeout(() =>
      resolve('INCREMENT'),
      5000))
  )
}, 0)
```

We can reduce how much we type by writing helpers that generate code

```js
const wait = (delay, func) => (state, action) =>
  createEffect(
    state,
    () =>
      new Promise(resolve => setTimeout(() =>
        resolve(func(state, action)),
        delay)))

const reducer = createReducer({
  INCREMENT: state => state + 1
  INCREMENT_IN_5_SECONDS: wait(5000, () => 'INCREMENT')
}, 0)
```

Or write helpers around existing libraries like [xr](https://github.com/radiosilence/xr), a tiny HTTP utility

```js
const api = (method, url, config = {}, reducer = s => s) => (state, action) => {
  config = typeof config === 'function' ? config(action) : config

  return createEffect(
    reducer(state, action),
    () =>
      xr({
        [config.method === 'GET' ? 'params' : 'data']: action.payload,
        method, url, ...config})
      .then(
        response => ({
          type: `${action.type}_SUCCESS`, payload: response.data,
          meta: {response, originalAction: action}}),
        error => ({type: `${action.type}_FAILURE`, payload: error})))
}

const log = (method = 'log', transformer = 'payload') => (state, action) => {
  const result =
    typeof transformer === 'function' ?
      transformer(action) :
    transformer ?
      _.get(action, transformer) :
      action

  return createEffect(state, () => console[method](result))
}

const reducer = createReducer({
  LOGIN: api('GET', '/api/login', {headers: {'Cache-Control': 'no-cache'}})
  LOGIN_SUCCESS: (state, {payload}) => payload
  LOGIN_FAILURE: log('error')
})

const store = createStore(reducer)
store.dispatch('LOGIN', {username: 'user', password: 'pass'})
```

For your convenience you can import the `api`, `log` & `wait` reducer creators from `redux-plus/creators`

```js
import {api, log, wait} from 'redux-plus/creators'
```

---

> Sometimes middleware is the best way to get something done, these are just fun ideas

You can hide your middleware from state with `combineReducers` and eschew `createReducer` to create reducers that respond to every action

```js
import {defaultGetter, defaultSetter} from 'redux-plus/helpers'

const ignoreKeys = (keys) => ({
  getter: (child, key) => keys.indexOf(key) === -1 && defaultGetter(child, key)
  setter: (child, key, value) => keys.indexOf(key) === -1 && defaultSetter(child, key, value)
})

combineReducers(
  {
    effects: log('log', null),
    ...otherReducers,
  },
  {},
  ignoreKeys(['effects'])
)
```

Directives in action types may be useful if you use side-effects to transform some actions

```js
const createTransformer = transformerMap => (state, action) => {
  // If action.type = [AUTH]_LOGIN(FOO, BAR) then
  // transformers = [transformerMap[AUTH], transformerMap[FOO], transformerMap[BAR]]
  let transformers = _.flatten(
    (action.type.match(/[\[\(][\w\s,]+[\]\)]/g) || [])
      .map(v => v.slice(1, -1).split(','))
  ).map(key => transformerMap[key.trim()])

  if (!transformers.length) return state

  // If action.type = [AUTH]_LOGIN(FOO, BAR) then
  // actionTypeTransformer(action).type = AUTH_LOGIN
  const actionTypeTransformer = action => ({
    ...action,
    type: action.type
      .replace(/[\[\]]/g, '')
      .replace(/\([\w\s,]+\)/g, '')})

  transformers = [actionTypeTransformer].concat(transformers)

  // [transformer1, transformer2] becomes transformer2(transformer1(action))
  return createEffect(
    state,
    transformers.reduce((newAction, transformer) => transformer(newAction), action)
  )
}

const reducer = combineReducers({
  transformers: createTransformer({
    AUTH: action => _.set(action, 'meta.authToken', localStorage.getItem('authToken'))
  }),
  data: createReducer({
    GET_DATA: api(
      'GET', '/api/endpoint',
      ({payload: {id}, meta: {authToken}}) => ({params: {id, authToken}})),
    GET_DATA_SUCCESS: (state, {payload}) => payload
  })
})

const store = createStore(reducer)

store.dispatch('(AUTH)GET_DATA', {id: 'xxx-xxx'})
// the AUTH transformer will get a token from localStorage, enhance the action
// and the effectEnhancer will dispatch:
// {type: 'GET_DATA', payload: {id: 'xxx-xxx'}, meta: {authToken: 'xxx-xxx'}}
```

You can import `createTransformer` from `redux-plus/helpers`

```js
import {createTransformer} from 'redux-plus/helpers'
```
