Rendering in the Reducer
========================

> This is just for fun to demonstrate the capabilities of redux-plus, I don't seriously recommend this

React components can be considered as functions that accept a slice of state (dependencies) and return a VDOM (derived data). Selectors in `redux-plus` do almost the exact same thing. Why not move our components into the reducer?
```js
const reducer = combineReducers({
  state: createReducer({
    'UPDATE_STATE': (state, payload) => payload,
  })
  App: createSelector(
    'state',
    (previous, state) => <div>{state}</div>
  )
})

const store = createStore(reducer)
store.subscribe(({App}) =>
  ReactDOM.render(
    document.getElementById('root'),
    App
  )
)
```

Here's a todo list, notice how `redux-plus` lends itself towards a *bottom-up* approach instead of *top-down* like React
```js
const store = {}

const reducer = combineReducers({
  state: combineReducers({
    todos: createReducer({
      ADD_TODO: (state, {payload: todo}) => createEffect(
        state.concat(todo),
        'CLEAR_FORM'
      ),
      REMOVE_TODO: (state, {payload}) => state.filter(todo => todo !== payload),
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
    todoForm: createReducer({
      UPDATE_FORM: (state, {payload}) => payload,
      CLEAR_FORM: () => '',
    }, '')
  }),

  components: combineReducers({
    $App: createSelector(
      'components.$SearchBox',
      'components.$TodoList',
      'components.$TodoForm',
      (previous, SearchBox, TodoList) => (
        <div>
          {TodoList}
          {SearchBox}
        </div>
      )),
    $SearchBox: createSelector(
      'state.searchQuery',
      (previous, searchQuery) => (
        <input
          value={searchQuery}
          onChange={e => store.dispatch('UPDATE_SEARCH', e.value)}
        />
      )),
    $TodoList: createSelector(
      'state.searchResults',
      'state.todoForm',
      'components.Todo',
      (previous, searchResults, todoForm, Todo) => (
        <ul>
          {searchResults.map((todo, i) => <Todo todo={todo} key={i} />)}
          {todoForm && <Todo todo={todoForm} />}
        </ul>
      )),
    $TodoForm: createSelector(
      'state.todoForm',
      (previous, todoForm) => (
        <div>
          <input
            value={todoForm}
            onChange={e => store.dispatch('UPDATE_FORM', e.value)}
          />
          <button onClick={() => store.dispatch('ADD_TODO', todoForm)} />
        </div>
      )),
    Todo: state => state || ({todo}) => (
      <li>
        {todo}
        <button onClick={() => store.dispatch('REMOVE_TODO', todo)} />
      </li>
    ),
  })
})

Object.assign(store, createStore(reducer))

store.subscribe(({components: {$App}}) =>
  ReactDOM.render(
    document.getElementById('root'),
    $App
  )
)
```

The $ in `components.$App` indicates `App` is a pre-rendered element

If you've used Angular before the `Todo` component may remind you of how services are instantized & injected
