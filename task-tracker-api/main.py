from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal, Todo, User
from auth import hash_password, verify_password, create_access_token, get_current_user_email
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,# type: ignore
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@app.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    hashed = hash_password(password)
    new_user = User(email=email, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}

@app.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):  #type: ignore
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/todos")
def get_todos(db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    todos = db.query(Todo).filter(Todo.owner_email == current_user).all()
    return todos

@app.post("/todos")
def add_todo(title: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    new_todo = Todo(title=title, owner_email=current_user)
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@app.patch("/todos/{id}")
def update_todo(id: int, completed: bool, db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    todo_item =db.query(Todo).filter(Todo.id == id, Todo.owner_email==current_user).first()
    todo_item.completed=completed
    db.commit()
    db.refresh(todo_item)
    return todo_item
@app.delete("/todos/{id}")
def delete_todo(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    todo_item=db.query(Todo).filter(Todo.id == id, Todo.owner_email==current_user).first()
    db.delete(todo_item)
    db.commit()
    return {"deleted_id": id}