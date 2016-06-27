redux-plus
==========

> **ADVERTISING:** I'm actively looking for work, see [www.ashtonwar.com](http://ashtonwar.com/) for details.

The core of Redux is simple. But it comes with a big ecosystem, middleware, action creators, selectors and other things attached that slow down development - a single change in specs shouldn't require changes in 5+ locations to implement. redux-plus makes developers more productive by finding one place for all state-related code: the reducer.

redux-plus makes four non-breaking changes to redux:

**dispatchEnhancer**: When using redux-plus you should dispatch actions directly to the store using `store.dispatch`. The API is nicer now: `store.dispatch('INCREMENT', 5)` & `store.dispatch({type: 'INCREMENT', payload: 5})` are equivalent.

**effectEnhancer**: Running side-effects inside the reducer is bad because it makes your state hard to predict & test. With redux-plus you can return effects from the reducer which run in a different context. Effects can optionally return actions that are dispatched to the store.

**selectorEnhancer**: Selectors are like formulas in a spreadsheet. They compute derived data and only update when the data they depend on does.

**dynamicReducerEnhancer**: Some (mostly performance-related) problems are impossible to solve statically. redux-plus allows you to generate reducers on the fly. *This feature is very powerful and should be used with caution and you probably won't need it.*

### Usage
```js
import {
  createStore, combineReducers, createReducer,
  createEffect, createSelector} from 'redux-plus'

const reducer = combineReducers({
  counter: createReducer({
    INCREMENT: state => state + 1
    INCREMENT_IN_5_SECONDS: state => createEffect(
      state,
      () => new Promise(resolve => setTimeout(() =>
        resolve('INCREMENT'),
        5000))
    )
  }, 0),
  counterDoubled: createSelector(
    'counter',
    (state, counter) => counter * 2),
})

const store = createStore(reducer)

store.getState() // {counter: 0, counterDoubled: 0}
store.dispatch('INCREMENT')
store.getState() // {counter: 1, counterDoubled: 2}
store.dispatch('INCREMENT_IN_5_SECONDS')
store.getState() // {counter: 1, counterDoubled: 2}
setTimeout(() =>
  store.getState(), // {counter: 2, counterDoubled: 4}
  5000)
```

### API
##### `createStore(reducer, [initialState], [storeEnhancer] = plus)`
Drop-in replacement for `redux.createStore`. Uses `plus` store-enhancer by default

```js
import {createStore, plus, compose} from 'redux-plus'

const store = createStore(reducer) // use it like this
const store = createStore(
  reducer,
  compose(plus, window.devToolsExtension ? window.devToolsExtension() : f => f),
) // or with other store enhancers
```

##### `plus`
The composite store-enhancer, you can import individual enhancers from `redux-plus/enhancers`

```js
import {dispatchEnhancer, selectorEnhancer, effectEnhancer} from 'redux-plus/enhancers'

export const plus = compose(
  dispatchEnhancer,
  selectorEnhancer, // doubles up as dynamicReducerEnhancer
  effectEnhancer,
)
```

##### `createReducer(reducerMap, [initialState])`
> `createReducer` is convenience-only, write reducers as plain functions if you like

Maps action types to reducers

```js
const counter = createReducer({
  INCREMENT: (state, {payload = 1}) => state + payload,
  DECREMENT: (state, {payload = 1}) => state - payload,
}, 0)

counter(undefined, {type: 'INCREMENT'}) // 1
counter(5, {type: 'INCREMENT'}) // 6
counter(82, {type: 'DECREMENT', payload: 80}) // 2
counter(13, {type: 'SOME_OTHER_ACTION'}) // 13
```

A switch statement could do the same thing

```js
const counter = (state = 0, {type, payload}) {
  switch (type) {
    case 'INCREMENT': return state + payload
    case 'DECREMENT': return state - payload
    default: return state
  }
}
```

##### `combineReducers(reducerMap, rootState, {getter, setter})`
Use `combineReducers` to split up your state

```js
const reducer = combineReducers({
  todos: createReducer({
    (state, {payload}) => state.concat(payload)
  }),
  counter,
})

reducer(undefined, {type: 'ADD_TODO', payload: 'Read the docs'})
// {todos: ['Read the docs'], counter: 0}
```

You probably don't need to worry about this but `combineReducers` also lifts effects

```js
const newState = {
  todos: [[{id: 1, name: 'Read the docs'}], [() => getTodo(2)], isEffect: true],
  user: [{}, [() => login('ashtonwar', 'password')], isEffect: true],
}

liftEffects(newState)
// [{todos: [{id: 1, name: 'Read the docs'}], user: {}},
//  [() => getTodo(2), () => login('ashtonwar', 'password')],
//  isEffect: true]
```

And adds structural metadata to the reducer so the store-enhancer can build dependency trees

The `rootState` and `getter` / `setter` arguments help support a variety of reducer shapes like arrays

```js
const reducer = combineReducers([todos, counter], [])

reducer(undefined, {type: 'ADD_TODO', payload: 'Read the docs'})
// [['Read the docs'], 0]
```

Or [Immutable.js](https://facebook.github.io/immutable-js/) maps

```js
const reducer = combineReducers(
  {
    todos: createReducer({
      ADD_TODO: (state, {payload}) => state.push(payload)
    }, Immutable.List()),
    counter
  },
  Immutable.Map(),
)

reducer(undefined, {type: 'ADD_TODO', payload: 'Read the docs'}).toJS()
// {todos: ['Read the docs'], counter: 0}
```

##### `createEffect(newState, ...generators)`
The state returned by the reducer may contain descriptions of side-effects (generators), that the `effectEnhancer` knows how to interpret. Calling the reducer does not run effects

```js
const clock = createReducer({
  TICK: state => createEffect(!state, 'TICK')
}, false)

const store = createStore(clock)
store.dispatch('TICK') // start it off
store.subscribe(::console.log) // true, false, true... until universe heat death
```

An effect may contain multiple generators. Generators may be constants, functions or functions that return promises. They can optionally return actions that will be dispatched to the store

```js
const reducer = createReducer({
  ACTION_1: () => createEffect(
    null,
    'ACTION_2', // these
    () => 'ACTION_3', // are all
    () => Promise.resolve('ACTION_4'), // equivalent
    () => {} // this won't dispatch anything
  )
})
const logger = applyMiddleware(store => next => action => (console.log(action), next(action)))
const store = createStore(reducer, compose(plus, logger))
store.dispatch('ACTION_1')
// {type: 'ACTION_1'}
// {type: 'ACTION_2'}
// {type: 'ACTION_3'}
// {type: 'ACTION_4'}
```

Effects are useful for things like making HTTP requests and interacting with browser APIs

##### `createSelector(...dependencies, reducer)`
Selectors are like formulas in a spreadsheet. They compute derived data and only update when the data they depend on does

Each dependency is a path relevant to the state's root. These will be resolved and passed to the reducer when evaluated by the `selectorEnhancer`

```js
const reducer = combineReducers({
  todos: createReducer({
    ADD_TODO: (state, {payload}) => state.concat(payload),
  }, []),
  searchQuery: createReducer({
    UPDATE_SEARCH: (state, {payload}) => payload,
  }, ''),
  searchResults: createSelector(
    'todos',
    'searchQuery',
    (state, todos, searchQuery) =>
      todos.filter(todo => todo.indexOf(searchQuery) !== -1)
  ),
})

const store = createStore(reducer)
store.dispatch('ADD_TODO', 'Wash the dishes')
store.getState().searchResults // ['Wash the dishes']
store.dispatch('ADD_TODO', 'Wash the laundry')
store.dispatch('ADD_TODO', 'Hang the laundry')
store.dispatch('UPDATE_SEARCH', 'laundry')
store.getState().searchResults // ['Wash the laundry', 'Hang the laundry']
```

Selectors can depend on other selectors & be chained

```js
const reducer = combineReducers({
  counter,
  counterDoubled: createSelector(
    'counter',
    (state, counter) => counter * 2),
  counterHalved: createSelector(
    'counterDoubled',
    (state, counter) => counter / 4),
})

const store = createStore(reducer)

store.getState() // {counter: 0, counterDoubled: 0, counterHalved: 0}
store.dispatch('INCREMENT')
store.getState() // {counter: 1, counterDoubled: 2, counterHalved: 0.5}
```

> Selectors cannot have cyclic dependencies, example: A cannot depend on B, if B relies on A

Selector dependencies can be selectors themselves

```js
const reducer = combineReducers({
  todos: createReducer({
    ADD_TODO: (state, {payload}) => state.concat(payload),
  }, []),
  lastTodo: createSelector(
    ['todos', (state, todos) => `todos.${todos.length - 1}`],
    (state, todo) => todo
  ),
})

const store = createStore(reducer)
store.dispatch('ADD_TODO', 'Wash the dishes')
store.getState().lastTodo // 'Wash the dishes'
store.dispatch('ADD_TODO', 'Wash the laundry')
store.getState().lastTodo // 'Wash the laundry'
```

> Using static dependencies is preferred due to performance penalties (the selector graph has to be rebuilt every time a dynamic dependency is evaluated)

##### `createArraySelector(arrayPointer, itemResolver, [dependencies], reducer, [rootState])`
See [effcient lists](https://github.com/ashtonwar/redux-plus/blob/master/docs/Effcient_Lists.md)

##### `createDynamicReducer(reducer)`
> This feature is very powerful and should be used with caution and you probably won't need it.

Dynamic reducers return reducers which are evaluated in-place by the `dynamicStoreEnhancer`. They are required for problems that cannot be solved statically

Dynamic selector dependencies are a piece of syntactic sugar that relies on dynamic reducers

```js
createSelector(
  ['todos', (state, todos) => `todos.${todos.length - 1}`],
  (state, todo) => todo)

// is sugar for:

createDynamicReducer(
  createSelector(
    'todos',
    (previousReducer, todos) => createSelector(
      `todos.${todos.length - 1}`,
      (state, todo) => todo,
    )))
```

`createArraySelector` also relies on dynamic reducers. The reducer creates a selector for each item in the array and combines them into a reducer that only updates the individual items that change.

> Dynamic reducers are a potential performance bottleneck, every time one is evaluated the selector graph has to be rebuilt: an O(# selectors * # dynamic reducers * # actions dispatched) problem

##### `applyMiddleware(middleware)`
Same as *redux.applyMiddleware*

See [emulating middleware](https://github.com/ashtonwar/redux-plus/blob/master/docs/Emulating_Middleware.md) to learn how middleware can run in the reducer

##### `compose(...storeEnhancers)`
Same as *redux.compose*

##### `getModel(effect)` / `getGenerators(effect)`
These helpers are useful for unit testing reducers. Effects bubble so your final state is likely to be an effect itself

```js
[state, [generator1, generator2], isEffect: true]
```

`getModel` & `getGenerators` return the respective elements and default to `state` or `[]` if the state is not an effect.

### Tell Me More
* [emulating middleware](https://github.com/ashtonwar/redux-plus/blob/master/docs/Emulating_Middleware.md)
* [effcient lists](https://github.com/ashtonwar/redux-plus/blob/master/docs/Effcient_Lists.md)
* [rendering in the reducer](https://github.com/ashtonwar/redux-plus/blob/master/docs/Rendering_In_The_Reducer.md)

### Thanks
Others did the real legwork. This library was inspired by:

* [redux-loop](https://github.com/raisemarketplace/redux-loop) for side-effects in the reducer
* [reselect](https://github.com/reactjs/reselect) for the ideal memoizer
* [MobX](https://github.com/mobxjs/mobx) for the selector graph (great alternative that removes architectural constraints)
* and of course.. [redux](https://github.com/reactjs/redux)
