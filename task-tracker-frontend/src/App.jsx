import './App.css'
import { useState, useEffect} from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState("")
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authMode, setAuthMode] = useState("login") // "login" or "register"
  const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        setLoading(true)
        fetch('http://127.0.0.1:8000/todos', {
            headers: { Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => {
                setTodos(data)
                setLoading(false)
                setError(null)
            })
            .catch(() => setError("Could not load Todos"))
    }, [token])

    function handleAuth() {
  const url = `http://127.0.0.1:8000/${authMode}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  fetch(url, { method: 'POST' })
    .then((res) => {
      if (!res.ok) throw new Error(authMode === "login" ? "Login failed" : "Registration failed")
      return res.json()
    })
    .then((data) => {
      if (authMode === "login") {
        localStorage.setItem("token", data.access_token)
        setToken(data.access_token)
      } else {
        setAuthMode("login") // after registering, drop them into the login form
      }
      setError(null)
    })
    .catch((err) => setError(err.message))
}
function handleLogout() {
  localStorage.removeItem("token")
  setToken(null)
}

function addTodo() {
    fetch('http://127.0.0.1:8000/todos?title=' + encodeURIComponent(newTitle), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`}
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
          headers: { Authorization: `Bearer ${token}`}
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
          headers: { Authorization: `Bearer ${token}`}
      }) .then(() => {
          setTodos(todos.filter((todo) => todo.id !== id))
          setError(null)
      })
          .catch(() => setError("Could not delete a todo"))
  }

  return (
    <div className = "app">
        {error && <p className = "error" style={{color: "red" }}>{error}</p>}
        {!token ? (
  <div className="auth-form">
    <h2>{authMode === "login" ? "Log In" : "Register"}</h2>
    <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <button onClick={handleAuth}>{authMode === "login" ? "Log In" : "Register"}</button>
    <p onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} style={{ cursor: "pointer", textDecoration: "underline" }}>
      {authMode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
    </p>
    {error && <p className="error">{error}</p>}
  </div>
) : (
    <div>
        <button onClick={handleLogout} style={{ float: "right", cursor: "pointer" }} >Logout</button>
      <h1>My Todos</h1>
        <div className = "todo-form">
            <input value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}/>
      <button onClick={addTodo}>Add</button>
        </div>

        {loading ? <p>Loading...</p> : (
      <ul className = "todo-list">
        {todos.map((todo) => (
            <li className = "todo-item"
                key ={todo.id} style={{margin: "10px 0"}}>
                <span onClick={() => toggleTodo(todo.id, todo.completed)}
                style={{textDecoration: todo.completed ? "line-through": "none", cursor: "pointer", marginRight: "10px"}}>
            {todo.title}
                </span>
            <button onClick={() => deleteTodo(todo.id)}>x</button>
            </li>
        ))}
      </ul>
            )}
         </div>
)}
    </div>
  )
}


export default App