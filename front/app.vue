<script setup lang="ts">
import {  PlusCircle } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { createTodo, fetchTodos } from '~/services/todoService';

// Définir l'interface pour le type de tâche
export interface TaskType {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
  parentId?: string;
  children?: TaskType[];
}

// Définir les tâches comme une référence réactive
const tasks = ref<TaskType[]>([]);

// Fonction pour charger les tâches depuis le serveur
const loadTasks = async () => {
  try {
    const data = await fetchTodos();
    tasks.value = data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
};

// Charger les tâches lors du montage du composant
onMounted(loadTasks);

// Variables réactives pour la gestion de l'ajout de tâches
const addingTask = ref(false);
const newTaskTitle = ref("");
const newTaskParentId = ref<string | null>(null);

// Fonction pour ajouter une nouvelle tâche
async function addTask() {
  if (!newTaskTitle.value) return;

  const newTask = {
    title: newTaskTitle.value,
    done: false,
  };

  try {
    await createTodo(newTask);
    await loadTasks(); // Recharger les tâches depuis le serveur
    newTaskTitle.value = "";
    newTaskParentId.value = null;
    addingTask.value = false;
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

// Fonction pour gérer la suppression d'une tâche
function handleDeleteTask(taskId: string) {
  const index = tasks.value.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    // Code de suppression de la tâche via l'API (commenté)
  }
}

// Fonction pour ajouter une sous-tâche
function handleAddSubtask(subtask: TaskType, parentTask: TaskType) {
  if (!parentTask.children) {
    parentTask.children = [];
  }
  parentTask.children.push(subtask);
}

// Fonction pour éditer une tâche
function editTask(task: TaskType) {
  const index = tasks.value.findIndex((t) => t.id === task.id);
  if (index === -1) return;

  tasks.value[index] = task;
}

// Fonction pour démarrer l'ajout d'une nouvelle tâche principale
function startNewParentTask() {
  newTaskParentId.value = null;
  addingTask.value = true;
}

// Fonction pour démarrer l'ajout d'une nouvelle sous-tâche
function startNewSubtask(parentId: string) {
  newTaskParentId.value = parentId;
  addingTask.value = true;
}

// Fonction pour basculer l'état de réalisation d'une tâche
function toggleTaskDone(taskId: string) {
  const index = tasks.value.findIndex((t) => t.id === taskId);
  if (index === -1) return;

  tasks.value[index].done = !tasks.value[index].done;
}
</script>

<template>
  <div class="w-full flex justify-center mt-5">
    <main class="rounded-t-md w-full p-10 max-w-[800px]">
      <div class="mb-4">
        <Button @click="startNewParentTask">
          <PlusCircle class="mr-2 h-5 w-5" /> Add New Main Task
        </Button>
      </div>

      <div v-if="tasks.length === 0" class="text-center text-gray-500">
        No tasks found. Click the button above to add a new task.
      </div>

      <div v-else class="tasks-list">
        <Task v-for="task in tasks" :key="task.id" :task="task" :all-tasks="tasks" @add-subtask="handleAddSubtask"
              @edit-task="editTask" @delete-task="handleDeleteTask" @toggle-task-done="toggleTaskDone" />
      </div>

      <div v-if="addingTask" class="mt-4 p-5 border rounded-md">
        <h2 class="text-lg font-semibold mb-4">Add New Main Task</h2>
        <Input type="text" v-model="newTaskTitle" placeholder="Enter task title" />
        <div class="flex justify-end w-full space-x-2 mt-4">
          <Button @click="addingTask = false" class="m-2" variant="destructive">
            Cancel
          </Button>
          <Button @click="addTask" class="m-2"> Add Task </Button>
        </div>
      </div>
    </main>
  </div>
</template>