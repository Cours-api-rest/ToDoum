import axios from 'axios';
import { useToast } from 'vue-toastification';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
});

// Utilisation du toast
const toast = useToast();

// Error handling function
const handleError = (error) => {
    if (error.response) {
        // The request was made, and the server responded with a status code outside the range of 2xx
        switch (error.response.status) {
            case 404:
                console.error('Error 404: Not Found');
                toast.error('Resource not found!');
                break;
            case 500:
                console.error('Error 500: Internal Server Error');
                toast.error('Internal server error!');
                break;
            default:
                toast.error('An error occurred!');
                console.error(`Error ${error.response.status}: ${error.response.statusText}`);
        }
    } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response received from server!');
        console.error('No response received from server');
    } else {
        // Something else happened in setting up the request
        toast.error('Error in setting up the request!');
        console.error('Error in setting up the request:', error.message);
    }
};

// Fetch all todos or subtasks based on parentId
export const fetchTodos = async (parentId = null) => {
    const url = parentId ? `/todos/${parentId}/subtasks` : '/todos';
    try {
        const response = await api.get(url);
        toast.success('Todos fetched successfully!');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error; // Optionally, rethrow the error to be handled in the calling function
    }
};

// Update a specific todo
export const updateTodo = async (id, data) => {
    try {
        const response = await api.patch(`/todos/${id}`, data);
        toast.success('Todo updated successfully!');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Toggle a todo's done status
export const toggleTodoStatus = async (id, done) => {
    try {
        const response = await api.patch(`/todos/${id}`, { done });
        toast.success('Todo status updated successfully!');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Delete a todo
export const deleteTodo = async (id) => {
    try {
        await api.delete(`/todos/${id}`);
        toast.success('Todo deleted successfully!');
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Create a new todo
export const createTodo = async (data) => {
    try {
        const response = await api.post(`/todos`, data);
        toast.success('Todo created successfully!');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};
