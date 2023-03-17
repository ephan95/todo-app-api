import { getTodos, createTodo, changeTodo, deleteTodo } from "./api.js";

const addButton = document.getElementById("addNew");
const removeButton = document.getElementById("removeDone");
const filterRadios = document.getElementsByName("toDofilter");
const formInputNewTodo = document.getElementById("newTodo");
const todoListUl = document.getElementById("todoList");

const state = {
  todos: [],
  filter: "",
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
    toggleTodoDone(clickedElement);
    render();
  }
});

filterRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    getFilter();
    render();
  });
});

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
    await createTodo({
      id: +new Date(),
      description: description,
      done: false,
    });

    const updatedTodos = await getTodos();
    state.todos = updatedTodos;

    render();

    formInputNewTodo.value = "";
  }
}

async function deleteDoneTodosFromApi() {
  const doneTodos = state.todos.filter((todo) => todo.done === true);
  const deletePromises = doneTodos.map((todo) => deleteTodo(todo.id));
  await Promise.all(deletePromises);

  const updatedTodos = await getTodos();
  state.todos = updatedTodos;

  render();
}

async function toggleTodoDone(id) {
  const todo = state.todos.find((todo) => todo.id === id);
  if (todo) {
    todo.done = !todo.done;
    changeTodo(id, todo);
  }
}

function render() {
  const todoListUl = document.getElementById("todoList");
  todoListUl.innerHTML = "";

  for (let todo of filterTodos(state.filter)) {
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
  newLabel.htmlFor = `todo-${id}`;
  newLabel.innerText = todo.description;
  newLabel.classList.add("todoLabel");

  if (todo.done) {
    newLi.classList.add("strike-through");
  }

  newLi.append(newCheckBox, newLabel);
  return newLi;
}

function getFilter() {
  state.filter = document.querySelector(
    'input[name="toDofilter"]:checked'
  ).value;
}

function filterTodos(filter) {
  let filteredTodos = state.todos;

  if (filter === "done") {
    filteredTodos = state.todos.filter((todo) => todo.done === true);
  } else if (filter === "open") {
    filteredTodos = state.todos.filter((todo) => todo.done === false);
  }

  return filteredTodos;
}

(async () => {
  state.todos = await getTodos();
  render();
})();
