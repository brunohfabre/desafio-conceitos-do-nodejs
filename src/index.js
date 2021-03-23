const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(findUser => findUser.username === username);

  if(!user) {
    return response.status(404).json({ error: 'usuario nao encontrado' });
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkUserExists = users.find(findUser => findUser.username === username);

  if(checkUserExists) {
    return response.status(400).json({
      error: 'Já existe um usuário com o mesmo "username" criado.'
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const newUser = {
    ...user,
    todos: [...user.todos, todo],
  }

  users = users.map(findUser => findUser.id === user.id ? newUser : findUser);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if(!checkTodoExists) {
    return response.status(404).json({
      error: 'nao e possivel atualizar um todo que nao existe',
    });
  }

  const todo = { ...checkTodoExists, title, deadline: new Date(deadline) };

  const todos = user.todos.map(findTodo => findTodo.id === id ? todo : findTodo);

  const newUser = {
    ...user,
    todos,
  }

  users = users.map(findUser => findUser.id === user.id ? newUser : findUser);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if(!checkTodoExists) {
    return response.status(404).json({
      error: 'nao e possivel done um todo que nao existe',
    });
  }

  const todo = { ...checkTodoExists, done: true };

  const todos = user.todos.map(findTodo => findTodo.id === id ? todo : findTodo);

  const newUser = {
    ...user,
    todos,
  }

  users = users.map(findUser => findUser.id === user.id ? newUser : findUser);

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if(!checkTodoExists) {
    return response.status(404).json({
      error: 'nao e possivel deletar um todo que nao existe',
    });
  }

  const todos = user.todos.filter(findTodo => findTodo.id !== id);

  const newUser = {
    ...user,
    todos,
  }

  users = users.map(findUser => findUser.id === user.id ? newUser : findUser);

  return response.sendStatus(204);
});

module.exports = app;