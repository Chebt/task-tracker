const todos = [
    {id:1, title: "Learn FastAPI", completed: false},
    {id:2, title: "Buy groceries", completed: true},
    {id:3, title: "Do exams", completed: false},
    {id:4, title: "Learn SQL", completed: true}
]
const todoTitles = todos.map(todo=> todo.title)
console.log(todoTitles)
const todoCompleted = todos.filter(todo => todo.completed)
console.log(todoCompleted)


