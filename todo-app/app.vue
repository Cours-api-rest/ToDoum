<template>
  <div>
    <h1>Liste des tâches</h1>
    <div v-for="todo in todos" :key="todo.id">
      <TodoItem :todo="todo" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchTodos } from '~/services/todoService';
import TodoItem from '~/components/TodoItem.vue';

const todos = ref([]);

onMounted(async () => {
  todos.value = await fetchTodos();
});
</script>
