<template>
  <div v-if="!isDeleted" class="task flex flex-col w-auto border border-gray-200 m-2 space-y-2 p-2 rounded-md">
    <div class="flex items-center space-x-2">
      <div v-if="haveChildren">
        <Button @click="toggleChildren" variant="outline" size="icon">
          <component :is="opened ? ChevronDown : ChevronRight" class="h-4 w-4" />
        </Button>
      </div>

      <input type="checkbox" v-model="props.task.done" @change="toggleDone" />

      <span v-if="!isEditing" @click="enableEditing" class="task-title">
        {{ props.task.title }}
      </span>
      <input v-else v-model="editableTitle" @blur="saveTitle" @keyup.enter="saveTitle"
        :class="['editable-input', { 'editing': isEditing }]" />

      <Button @click="deleteTodoWithToast" variant="outline" size="icon">
        <Trash class="h-4 w-4" />
      </Button>
      <Button @click="openModal" variant="outline" size="icon">
        <PlusCircle class="h-4 w-4" />
      </Button>
    </div>

    <div v-if="haveChildren">
      <div v-if="opened">
        <div v-for="child in props.task.children" :key="child.id">
          <Task :task="child" />
        </div>
      </div>
    </div>

    <!-- Modal for Adding Subtasks -->
    <div v-if="isModalOpen" class="modal-backdrop">
      <div class="modal-content p-4 bg-white border rounded-md shadow-md">
        <h3 class="text-lg font-semibold mb-2 text-black">Add Subtask</h3>
        <input v-model="newSubtaskTitle" class="border p-2 rounded w-full text-black"
          placeholder="Enter subtask title" />
        <div class="flex justify-end space-x-2 mt-4">
          <Button @click="closeModal" variant="outline">Cancel</Button>
          <Button @click="addSubtask" variant="outline">
            <PlusCircle class="h-4 w-4" /> Add Subtask
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { fetchTodos, updateTodo, toggleTodoStatus, deleteTodo, createTodo } from '~/services/todoService';
import { defineProps, defineEmits } from 'vue';
import { ChevronDown, ChevronRight, Trash, PlusCircle } from "lucide-vue-next";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(['delete-task', 'add-subtask']);

const opened = ref(false);
const isEditing = ref(false);
const editableTitle = ref(props.task.title);
const haveChildren = ref(props.task.links?.subtasks !== undefined);
const isDeleted = ref(false); // Variable for managing visibility
const isModalOpen = ref(false); // State for modal visibility
const newSubtaskTitle = ref(''); // Holds the new subtask title

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
      console.error("Failed to update task title:", error);
    }
  }
};

const toggleChildren = async () => {
  opened.value = !opened.value;
  if (opened.value && (!props.task.children || !props.task.children.length)) {
    try {
      // Fetch subtasks for parent task
      const subtasks = await fetchTodos(props.task.id);  // `props.task.id` for subtasks
      props.task.children = subtasks;
    } catch (error) {
      console.error("Failed to fetch subtasks:", error);
    }
  }
};

const toggleDone = async () => {
  try {
    await toggleTodoStatus(props.task.id, props.task.done);
  } catch (error) {
    console.error("Failed to toggle task status:", error);
  }
};

const deleteTodoWithToast = async () => {
  try {
    await deleteTodo(props.task.id);
    isDeleted.value = true;
    emits('delete-task', props.task.id);

    // Check if the task is a parent and if it still has children
    if (props.task.parentId) {
      const parentTask = props.task.links?.parent; // Assuming parent task is part of the task's links
      if (parentTask && parentTask.children) {
        parentTask.children = parentTask.children.filter(child => child.id !== props.task.id); // Remove this subtask
        if (parentTask.children.length === 0) {
          haveChildren.value = false; // Update parent task's `haveChildren` state if no children
        }
      }
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
};

const openModal = () => {
  isModalOpen.value = true;
  newSubtaskTitle.value = '';
};

const closeModal = () => {
  isModalOpen.value = false;
};

const addSubtask = async () => {
  if (!newSubtaskTitle.value) return;

  try {
    const childTodo = await createTodo({
      title: newSubtaskTitle.value,
      parentId: props.task.id,  // Link the subtask to the parent
    });

    if (!props.task.children) props.task.children = [];
    props.task.children.push(childTodo.data);

    haveChildren.value = true;  // Update the parent task to reflect that it has subtasks
    closeModal();
  } catch (error) {
    console.error("Failed to add subtask:", error);
  }
};
</script>
