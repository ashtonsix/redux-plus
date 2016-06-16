redux-plus
==========
> **WORK IN PROGRESS - DO NOT USE**

The core of Redux is simple. But it comes with a big ecosystem, middleware, action creators and other things attached that slow down development. `redux-plus` solves this by bundling the best tools & exporting a preset store-creator optimized for productivity.

### Why
* More productive API
* Easy-to-test side-effects
* All state-related code in one place (the reducer)
* Sound theoretical foundation

### How It Works
Running side-effects in the reducer is bad because it makes your state hard to predict & test. Writing side-effects outside the reducer is also bad - because updating application logic requires making changes in several places. The solution is to *write* side-effects inside the reducer and *run* them outside.

Selectors are great... write something here about selectors

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
