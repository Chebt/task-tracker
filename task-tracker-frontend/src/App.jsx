import './App.css'
import { useState, useEffect} from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState("")
  const [error, setError] = useState(null)

    function addTodo() {
    fetch('http://127.0.0.1:8000/todos?title=' + encodeURIComponent(newTitle), {
        method: 'POST',
    })
        .then((res) => res.json())
        .then((createdTodo) => {
            setTodos([...todos, createdTodo])
            setNewTitle("")
            setError(null)
        })
        .catch(() => setError("Could not add a todo. Is the server running?"))
}

function toggleTodo(id, completed) {
      fetch(`http://127.0.0.1:8000/todos/${id}?completed=${!completed}`, {
          method: 'PATCH',
      })
          .then((res) => res.json())
          .then((updatedTodo) => {
              setTodos(todos.map((todo) => (todo.id === id ? updatedTodo :todo)))
              setError(null)
          })
          .catch(() => setError("Could not update a todo, check if the server is running"))
}

  function deleteTodo(id) {
      fetch(`http://127.0.0.1:8000/todos/${id}`, {
          method: 'DELETE',
      }) .then(() => {
          setTodos(todos.filter((todo) => todo.id !== id))
          setError(null)
      })
          .catch(() => setError("Could not delete a todo"))
  }

  const [loading, setLoading] = useState(true)
    useEffect(() => {
        fetch('http://127.0.0.1:8000/todos')
            .then((res) => res.json())
            .then((data) => {
                setTodos(data)
                setLoading(false)
                setError(null)
            })
            .catch(() => setError("An error encountered, check your server status"))
    }, [])

  return (
    <div className = "app">
        {error && <p className = "error"
            style={{color: "red" }}>{error}</p>}
      <h1>My Todos</h1>
        <element className = "todo-form">
            <input value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>
        </element>

        {loading ? <p>Loading...</p> : (
      <ul className = "todo-list">
        {todos.map((todo) => (
            <li className = "todo-item"
                key ={todo.id} style={{margin: "10px 0"}}>
                <span onClick={() => toggleTodo(todo.id, todo.completed)}
                style={{textDecoration: todo.completed ? "line-through": "none", cursor: "pointer", marginRight: "10px"}}>
            {todo.title}
                </span>
            <button onClick={() => deleteTodo(todo.id)}>x</button>    </li>
        ))}
      </ul>
            )}
    </div>
  )
}

export default App