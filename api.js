const apiUrl = "http://localhost:4730/todos";

function generateOptions(method, data) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  return options;
}

export async function fetchTodo(path = "", options = {}) {
  const response = await fetch(apiUrl + path, options);
  const data = await response.json();
  return data;
}

export async function getTodos() {
  return await fetchTodo();
}

export async function createTodo(newToDo) {
  return await fetchTodo("", generateOptions("POST", newToDo));
}

export async function changeTodo(id, todo) {
  return await fetchTodo(`/${id}`, generateOptions("PUT", todo));
}

export async function deleteTodo(id) {
  return await fetchTodo(`/${id}`, generateOptions("DELETE"));
}
