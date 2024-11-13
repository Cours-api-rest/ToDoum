<template>
  <div>
    <!-- Si la tâche a des enfants, affichez un accordéon -->
    <div v-if="todo.children && todo.children.length > 0" class="todo-item">
      <div class="todo-header">
        <input type="checkbox" v-model="todo.done" @change="toggleDone" />
        <input type="text" v-model="todo.title" @blur="saveTitle" />
        <button @click="deleteTodoClick">Supprimer</button>
        <button @click="addChildTodo">Ajouter Sous-tâche</button>
        <button @click="toggleChildren">{{ showChildren ? 'Masquer' : 'Afficher' }} les sous-tâches</button>
      </div>

      <!-- Accordéon pour afficher les sous-tâches -->
      <div v-if="showChildren" class="children-list">
        <div v-for="child in todo.children" :key="child.id">
          <TodoAccordion :todo="child" />
        </div>
      </div>
    </div>

    <!-- Si la tâche n'a pas d'enfants, affichez une ligne simple -->
    <div v-else class="todo-item">
      <input type="checkbox" v-model="todo.done" @change="toggleDone" />
      <input type="text" v-model="todo.title" @blur="saveTitle" />
      <button @click="deleteTodoClick">Supprimer</button>
      <button @click="addChildTodo">Ajouter Sous-tâche</button>
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

const showChildren = ref(false);

const fetchChildren = async () => {
  const children = await fetchTodos(props.todo.id);
  props.todo.children = children;
  showChildren.value = true;
};

const toggleChildren = () => {
  if (!props.todo.children) {
    fetchChildren();
  } else {
    showChildren.value = !showChildren.value;
  }
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

<style scoped>
.todo-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.children-list {
  margin-top: 10px;
  padding-left: 20px;
  border-left: 2px solid #ddd;
}

button {
  margin-right: 5px;
}

input[type="text"] {
  width: 200px;
  margin-right: 10px;
}
</style>
