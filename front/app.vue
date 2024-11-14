<script setup lang="ts">
import { ChevronDown, ChevronRight, Edit, PlusCircle, Trash } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { createTodo, deleteTodo, fetchTodos } from '~/services/todoService';

export interface TaskType {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
  parentId?: string;
  children?: TaskType[];
}

const tasks = ref<TaskType[]>([]);

onMounted(async () => {
  try {
    const data = await fetchTodos();
    tasks.value = data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
});

const addingTask = ref(false);
const newTaskTitle = ref("");
const newTaskParentId = ref<string | null>(null);

async function addTask() {
  if (!newTaskTitle.value) return;

  const newTask = {
    title: newTaskTitle.value,
    done: false,
  };

  try {
    const response = await createTodo(newTask);
    tasks.value.push(response.data);
    newTaskTitle.value = "";
    newTaskParentId.value = null;
    addingTask.value = false;
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

function handleDeleteTask(taskId: string) {
  const index = tasks.value.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    // const taskToDelete = tasks.value[index];

    // // Suppression de la tâche via l'API
    // deleteTodo(taskId).then(() => {
    //   tasks.value.splice(index, 1); // Mise à jour de la tâche principale
    //   if (taskToDelete.parentId) {
    //     // Si c'est une sous-tâche, on la retire de l'array children de la tâche parente
    //     const parentTask = tasks.value.find((t) => t.id === taskToDelete.parentId);
    //     if (parentTask && parentTask.children) {
    //       const childIndex = parentTask.children.findIndex(c => c.id === taskId);
    //       if (childIndex !== -1) {
    //         parentTask.children.splice(childIndex, 1);
    //       }
    //     }
    //   }

    //   // Vérifier si la tâche parente n'a plus de sous-tâches et la passer en mode simple
    //   if (taskToDelete.children && taskToDelete.children.length === 0 && taskToDelete.parentId) {
    //     const parentTask = tasks.value.find((t) => t.id === taskToDelete.parentId);
    //     if (parentTask && parentTask.children) {
    //       parentTask.children = [];
    //     }
    //   }
    // }).catch((error) => {
    //   console.error("Failed to delete task:", error);
    // });
  }
}

function handleAddSubtask(subtask: TaskType, parentTask: TaskType) {
  if (!parentTask.children) {
    parentTask.children = [];
  }
  parentTask.children.push(subtask);
}

function editTask(task: TaskType) {
  const index = tasks.value.findIndex((t) => t.id === task.id);
  if (index === -1) return;

  tasks.value[index] = task;
}

function startNewParentTask() {
  newTaskParentId.value = null;
  addingTask.value = true;
}

function startNewSubtask(parentId: string) {
  newTaskParentId.value = parentId;
  addingTask.value = true;
}

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
        <!-- Assurez-vous que Task transmet bien les événements nécessaires -->
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
