import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
});

export const fetchTodos = async (parentId = null) => {
    const url = parentId ? `/todos/${parentId}/subtasks` : '/todos';
    const response = await api.get(url);
    return response.data;
};

export const updateTodo = (id, data) => api.patch(`/todos/${id}`, data);

export const toggleTodoStatus = (id, done) => api.patch(`/todos/${id}`, { done });

export const deleteTodo = (id) => api.delete(`/todos/${id}`);

export const createTodo = (data) => api.post(`/todos`, data);
