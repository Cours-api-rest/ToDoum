<template>
  <div class="todo-list">
    <!-- Parcours de toutes les tâches -->
    <div v-for="todo in todos" :key="todo.id">
      <TodoItem :todo="todo" @fetch-children="fetchChildren" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchTodos } from '~/services/todoService';
import TodoItem from '~/components/TodoItem.vue';

const todos = ref([]);

// Récupère les tâches au montage du composant
onMounted(async () => {
  todos.value = await fetchTodos();
});

// Fonction pour charger les sous-tâches
const fetchChildren = async (parentId) => {
  const children = await fetchTodos(parentId);
  const parentTodo = todos.value.find(todo => todo.id === parentId);
  parentTodo.children = children;
};
</script>

<style scoped>
.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
