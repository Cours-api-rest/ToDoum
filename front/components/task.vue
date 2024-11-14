<template>
  <div class="task flex flex-col w-auto border border-gray-200 m-2 space-y-2 p-2 rounded-md">
    <div class="flex items-center">
      <div v-if="haveChildren">
        <Button @click="toggleChildren" variant="outline" size="icon">
          <component :is="opened ? ChevronDown : ChevronRight" class="h-4 w-4" />
        </Button>
      </div>

      <input type="checkbox" v-model="props.task.done" @change="toggleTodoStatus(props.task.id, props.task.done)" />

      <span v-if="!isEditing" @click="enableEditing" class="task-title">
        {{ props.task.title }}
      </span>
      <input v-else v-model="editableTitle" @blur="saveTitle" @keyup.enter="saveTitle"
        :class="['editable-input', { 'editing': isEditing }]" />

      <button @click="deleteTodoWithToast">Supprimer</button>
    </div>

    <div v-if="haveChildren">
      <div v-if="opened">
        <div v-for="child in props.task.children" :key="child.id">
          <Task :task="child" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { fetchTodos, updateTodo, toggleTodoStatus, deleteTodo } from '~/services/todoService';
import { defineProps } from 'vue';
import { ChevronDown, ChevronRight } from "lucide-vue-next";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const opened = ref(false);
const isEditing = ref(false);
const editableTitle = ref(props.task.title);
const haveChildren = ref(props.task.links?.subtasks !== undefined);

const enableEditing = () => {
  isEditing.value = true;
  editableTitle.value = props.task.title;
};

const saveTitle = async () => {
  isEditing.value = false;
  if (editableTitle.value !== props.task.title) {
    try {
      await updateTodo(props.task.id, { title: editableTitle.value });
      props.task.title = editableTitle.value;
    } catch (error) {
    }
  }
};

const toggleChildren = async () => {
  opened.value = !opened.value;
  if (opened.value && (!props.task.children || !props.task.children.length)) {
    try {
      props.task.children = await fetchTodos(props.task.id);
    } catch (error) {
    }
  }
};

const deleteTodoWithToast = async () => {
  try {
    await deleteTodo(props.task.id);
  } catch (error) {
  }
};
</script>

<style scoped>
.editable-input {
  border: none;
  background: none;
  outline: none;
  font-size: inherit;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.editable-input.editing {
  border-bottom: 1px solid #3182ce;
  /* Blue border for edit mode */
}

.task-title {
  cursor: pointer;
}
</style>
