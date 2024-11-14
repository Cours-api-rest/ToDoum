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
             :class="['editable-input', { 'editing': isEditing }]" class="text-black" />

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

// Définir les propriétés du composant
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

// Définir les événements émis par le composant
const emits = defineEmits(['delete-task', 'add-subtask']);

// Définir les variables réactives
const opened = ref(false); // État d'ouverture des sous-tâches
const isEditing = ref(false); // État d'édition du titre de la tâche
const editableTitle = ref(props.task.title); // Titre éditable de la tâche
const haveChildren = ref(props.task.links?.subtasks !== undefined); // Indicateur de présence de sous-tâches
const isDeleted = ref(false); // Indicateur de suppression de la tâche
const isModalOpen = ref(false); // État d'ouverture du modal pour ajouter des sous-tâches
const newSubtaskTitle = ref(''); // Titre de la nouvelle sous-tâche

// Activer l'édition du titre de la tâche
const enableEditing = () => {
  isEditing.value = true;
  editableTitle.value = props.task.title;
};

// Sauvegarder le titre de la tâche après édition
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

// Basculer l'affichage des sous-tâches
const toggleChildren = async () => {
  opened.value = !opened.value;
  if (opened.value && (!props.task.children || !props.task.children.length)) {
    try {
      // Récupérer les sous-tâches pour la tâche parente
      const subtasks = await fetchTodos(props.task.id);  // `props.task.id` pour les sous-tâches
      props.task.children = subtasks;
    } catch (error) {
      console.error("Failed to fetch subtasks:", error);
    }
  }
};

// Basculer l'état de réalisation de la tâche
const toggleDone = async () => {
  try {
    await toggleTodoStatus(props.task.id, props.task.done);
  } catch (error) {
    console.error("Failed to toggle task status:", error);
  }
};

// Supprimer la tâche avec une notification
const deleteTodoWithToast = async () => {
  try {
    await deleteTodo(props.task.id);
    isDeleted.value = true;
    emits('delete-task', props.task.id);

    // Vérifier si la tâche est parente et si elle a encore des enfants
    if (props.task.parentId) {
      const parentTask = props.task.links?.parent; // Supposons que la tâche parente fait partie des liens de la tâche
      if (parentTask && parentTask.children) {
        parentTask.children = parentTask.children.filter(child => child.id !== props.task.id); // Supprimer cette sous-tâche
        if (parentTask.children.length === 0) {
          haveChildren.value = false; // Mettre à jour l'état `haveChildren` de la tâche parente si elle n'a plus d'enfants
        }
      }
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
};

// Ouvrir le modal pour ajouter une sous-tâche
const openModal = () => {
  isModalOpen.value = true;
  newSubtaskTitle.value = '';
};

// Fermer le modal pour ajouter une sous-tâche
const closeModal = () => {
  isModalOpen.value = false;
};

// Ajouter une nouvelle sous-tâche
const addSubtask = async () => {
  if (!newSubtaskTitle.value) return;

  try {
    const childTodo = await createTodo({
      title: newSubtaskTitle.value,
      parentId: props.task.id,  // Lier la sous-tâche à la tâche parente
    });

    if (!props.task.children) props.task.children = [];
    props.task.children.push(childTodo);

    haveChildren.value = true;  // Mettre à jour la tâche parente pour refléter qu'elle a des sous-tâches
    closeModal();
  } catch (error) {
    console.error("Failed to add subtask:", error);
  }
};
</script>