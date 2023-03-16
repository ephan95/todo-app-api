"use strict";

const addButton = document.getElementById("addNew");
const removeButton = document.getElementById("removeDone");
const filterRadios = document.getElementsByName("toDofilter");
const formInputNewTodo = document.getElementById("newTodo");
const todoListUl = document.getElementById("todoList");

const state = {
  todos: [],
  filter: [],
};

addButton.addEventListener("click", (event) => {
  event.preventDefault();
  addNewTodo();
});

formInputNewTodo.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addNewTodo();
  }
});

removeButton.addEventListener("click", (event) => {
  deleteDoneTodosFromApi();
});

todoListUl.addEventListener("click", (event) => {
  if (event.target.matches(".todoItem, .todoCheckbox, todoLabel")) {
    const clickedElement = parseInt(event.target.closest("li").id);
    console.log(clickedElement);
    toggleTodoDone(clickedElement);
    render();
  }
});

async function fetchTodo() {
  const response = await fetch("http://localhost:4730/todos");
  const data = await response.json();
  return data;
}

async function addToDoToApi(newToDo) {
  const response = await fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newToDo),
  });
}

async function addNewTodo() {
  const description = formInputNewTodo.value;

  if (
    state.todos.find(
      (todo) => todo.description.toLowerCase() === description.toLowerCase()
    )
  ) {
    alert("Todo with the same description already exists!");
    return;
  }

  if (description !== "" && description.length >= 5) {
    await addToDoToApi({
      id: +new Date(),
      description: description,
      done: false,
    });

    const updatedTodos = await fetchTodo();
    state.todos = updatedTodos;

    render();

    formInputNewTodo.value = "";
  }
}

async function deleteDoneTodosFromApi() {
  const doneTodos = state.todos.filter((todo) => todo.done === true);
  const deletePromises = doneTodos.map((todo) =>
    fetch(`http://localhost:4730/todos/${todo.id}`, { method: "DELETE" })
  );
  await Promise.all(deletePromises);

  const updatedTodos = await fetchTodo();
  state.todos = updatedTodos;

  render();
}

async function toggleTodoDone(id) {
  const todo = state.todos.find((todo) => todo.id === id);
  if (todo) {
    console.log(todo);
    todo.done = !todo.done;
    const response = await fetch(`http://localhost:4730/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
  }
}

function render() {
  const todoListUl = document.getElementById("todoList");
  todoListUl.innerHTML = "";

  //add filtered array here

  for (let todo of state.todos) {
    const newTodoItem = renderItem(todo);
    todoListUl.append(newTodoItem);
  }
}

function renderItem(todo) {
  const newLi = document.createElement("li");
  newLi.classList.add("todoItem");

  const { done, id } = todo;

  newLi.id = `${id}`;

  const newCheckBox = document.createElement("input");
  newCheckBox.type = "checkbox";
  newCheckBox.checked = done;
  newCheckBox.id = `todo-${id}`;
  newCheckBox.classList.add("todoCheckbox");

  const newLabel = document.createElement("label");
  newLabel.htmlFor = `todo-${todo.id}`;
  newLabel.innerText = todo.description;
  newLabel.classList.add("todoLabel");

  if (todo.done) {
    newLi.classList.add("strike-through");
  }

  newLi.append(newCheckBox, newLabel);
  return newLi;
}

(async () => {
  state.todos = await fetchTodo();
  render();
})();
