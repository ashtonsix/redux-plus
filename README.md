redux-plus
==========
> **WORK IN PROGRESS - DO NOT USE**

The core of Redux is simple. But it comes with a big ecosystem, middleware, action creators, selectors and other things attached that slow down development - a single change in specs shouldn't require changes in 5+ locations to implement. redux-plus makes developers more productive by finding one place for all state-related code: the reducer.

redux-plus makes three non-breaking changes to redux:

**dispatchEnhancer**: When using redux-plus you should dispatch actions directly to the store using `store.dispatch`. The API is nicer now: `store.dispatch('INCREMENT', 5)` & `store.dispatch({type: 'INCREMENT', payload: 5})` are equivalent.

**effectEnhancer**: Running side-effects inside the reducer is bad because it makes your state hard to predict & test. With redux-plus you can return effects from the reducer which run in a different context. Effects can optionally return actions that are dispatched to the store.

**selectorEnhancer**: Selectors are like formulas in a spreadsheet. They compute derived data and only update when the data they depend on does. Selectors can reference other selectors and their formulas (functions) can contain reducers, effects & other selectors.

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

#### API

createReducer / combineReducer: catch-all middleware as plain function

#### Migration
For most applications `redux-plus` should be a drop-in replacement. It works fine with store enhancers like `redux-devtools`

#### Reducer Creators

#### Computed Data


### Testing

### Alternatives
MobX

* Inflexible architecture (MobX really excels here)
* Referential integrity not guaranteed

### Thanks
Others did the real legwork. This library is merely a thin shell over some great technology including:

* redux-loop
* reselect
* and of course.. redux
