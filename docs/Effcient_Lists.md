Effcient Lists
==============
If asked to filter some todos by a search query your first attempt might look something like this

```js
combineReducers({
  todos: createReducer({
      ADD_TODO: (state, {payload}) => state.concat(payload),
    }, ['Take Jack to school']),
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
```

This is fine for such a simple example, but if the computation for each todo was more significant you may be sacrificing performance by duplicating the work. A better solution would be to generate a reducer for each item in the array & only update the items that change. Doing this takes a few steps

1. `createArraySelector` is a map-based transform, filtering won't do (toggling display: 'none' vs 'hidden' is faster than other DOM manipulations anyway)
2. Normalize your state so paths can be resolved statically in O(1) time (you can use something like [normalizr](https://github.com/paularmstrong/normalizr) or write your own helpers to do this)
3. Use the `createArraySelector(arrayPointer, itemResolver, [dependencies], reducer, [rootState])` helper

```js
const reducer = combineReducers({
  todos: createReducer(
    {
      ADD_TODO: ({result, entities}, {payload}) => ({
        result: result.concat(payload.id),
        entities: {...entities, [payload.id]: payload},
      }),
    },
    {
      result: ['a', 'b'],
      entities: {
        a: {id: 'a', name: 'Check the trunk.'},
        b: {id: 'b', name: 'Move the body.'},
      },
    }),
  searchQuery: createReducer({
    UPDATE_SEARCH: (state, {payload}) => payload,
  }, ''),
  searchResults: createArraySelector(
    'todos.result',
    todoId => `todos.entities.${todoId}`,
    ['searchQuery'],
    (state, todo, searchQuery) => ({
      ...todo,
      hidden: todo.name.indexOf(searchQuery) === -1,
    }),
  ),
})
```

When `todos.result` updates `searchResults` will use cached state for unchanged items, remove missing items & map new items. When `searchQuery` updates every todo will be updated because every todo is possibly affected

> For light computation `createArraySelector` may actually slow your application down, each time an arraySelector is evaluated the selector graph needs to be rebuilt O(# selectors * # dynamic reducers * # actions dispatched)

Pass in `rootState` if you are using exotic arrays like [Immutable.js](https://facebook.github.io/immutable-js) lists

```js
const searchResults = createArraySelector(
  'todos.result',
  todoId => `todos.entities.${todoId}`,
  ['searchQuery'],
  (state, todo, searchQuery) => todo.set(
    'hidden',
    todo.get('name').indexOf(searchQuery) === -1,
  ),
  Immutable.List()
)
```
