<template>
  <div>
    <div class="todo-item">
      <input type="checkbox" v-model="todo.done" @change="toggleDone" />
      <input type="text" v-model="todo.title" @blur="saveTitle" />
      <button @click="deleteTodoClick">Supprimer</button>
      <button @click="addChildTodo">Ajouter Sous-tâche</button>
      <button v-if="!showChildren" @click="fetchChildren">Afficher les sous-tâches</button>
      <button v-if="showChildren" @click="hideChildren">Masquer les sous-tâches</button>
    </div>

    <div v-if="showChildren && todo.children && todo.children.length > 0">
      <div v-for="child in todo.children" :key="child.id">
        <TodoItem :todo="child" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { fetchTodos, updateTodo, toggleTodoStatus, deleteTodo, createTodo } from '~/services/todoService';

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
});

// Définir l'événement `fetch-children`
const emit = defineEmits(['fetch-children']);

const showChildren = ref(false);

const fetchChildren = async () => {
  const children = await fetchTodos(props.todo.id);
  props.todo.children = children;
  showChildren.value = true;
  emit('fetch-children', props.todo.id); // Émettre l'événement
};

const hideChildren = () => {
  showChildren.value = false;
};

const toggleDone = async () => {
  await toggleTodoStatus(props.todo.id, props.todo.done);
};

const saveTitle = async () => {
  await updateTodo(props.todo.id, { title: props.todo.title });
};

const deleteTodoClick = async () => {
  await deleteTodo(props.todo.id);
};

const addChildTodo = async () => {
  const childTodo = await createTodo({ title: 'Nouvelle sous-tâche', parentId: props.todo.id });
  if (!props.todo.children) {
    props.todo.children = [];
  }
  props.todo.children.push(childTodo);
};
</script>
