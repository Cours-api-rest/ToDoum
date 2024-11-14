<script setup lang="ts">
import {
  ChevronDown,
  ChevronRight,
  Edit,
  PlusCircle,
  Trash,
} from "lucide-vue-next";
import { ref } from "vue";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
  parentId?: string;
}

const tasks = ref<Task[]>([
  {
    id: "parent1",
    title: "Task Parent 1",
    done: false,
    createdAt: new Date("2021-01-01"),
  },
  {
    id: "subtask1",
    title: "Subtask 1 of Parent 1",
    done: false,
    createdAt: new Date("2021-01-01"),
    parentId: "parent1",
  },
  {
    id: "subtask2",
    title: "Subtask 2 of Parent 1",
    done: false,
    createdAt: new Date("2021-01-02"),
    parentId: "parent1",
  },
  {
    id: "parent2",
    title: "Task Parent 2",
    done: false,
    createdAt: new Date("2021-01-03"),
  },
  {
    id: "subtask3",
    title: "Subtask 1 of Parent 2",
    done: false,
    createdAt: new Date("2021-01-04"),
    parentId: "parent2",
  },
]);

const expandedTasks = ref<Record<string, boolean>>({});
const editingTask = ref<Task | null>(null);
const newTaskTitle = ref(""); // Title of the new task being added
const newTaskParentId = ref<string | null>(null); // Determines if it's a parent or subtask
const addingTask = ref(false); // Controls if the add form should be displayed

function toggleExpand(taskId: string) {
  expandedTasks.value[taskId] = !expandedTasks.value[taskId];
}

function editTask(task: Task) {
  editingTask.value = { ...task };
}

function saveTask() {
  if (editingTask.value) {
    const index = tasks.value.findIndex(
      (task) => task.id === editingTask.value!.id
    );
    if (index !== -1) tasks.value[index] = { ...editingTask.value };
    editingTask.value = null;
  }
}

function deleteTask(task: Task) {
  tasks.value = tasks.value.filter(
    (t) => t.id !== task.id && t.parentId !== task.id
  );
}

function cancelEdit() {
  editingTask.value = null;
}

function getSubtasks(parentId: string) {
  return tasks.value.filter((task) => task.parentId === parentId);
}

function addTask() {
  if (!newTaskTitle.value) return;

  const id = `task${Date.now()}`;
  tasks.value.push({
    id,
    title: newTaskTitle.value,
    done: false,
    createdAt: new Date(),
    parentId: newTaskParentId.value || undefined,
  });
  newTaskTitle.value = "";
  newTaskParentId.value = null;
  addingTask.value = false; // Reset addingTask to hide the form
}

function startNewParentTask() {
  newTaskParentId.value = null; // Setting this to null indicates a parent task
  addingTask.value = true;
}

function startNewSubtask(parentId: string) {
  newTaskParentId.value = parentId; // Set the parent ID for the subtask
  addingTask.value = true;
}
</script>

<template>
  <div class="w-full flex justify-center mt-5">
    <main class="rounded-md w-full p-10 max-w-[800px]">
      <!-- Button to add a new parent task -->
      <div class="mb-4">
        <button @click="startNewParentTask" class="flex items-center bg-green-500 text-white px-4 py-2 rounded-md">
          <PlusCircle class="mr-2 h-5 w-5" /> Add New Main Task
        </button>
      </div>

      <div v-if="tasks.length === 0" class="text-center text-gray-500">
        No tasks found. Click the button above to add a new task.
      </div>

      <div class="p-2 border border-gray-300 rounded-t-md text-center mt-4" v-else>
        Total Tasks: {{ tasks.length }} | Completed: {{ tasks.filter((t) => t.done).length }}
      </div>

      <div class="w-full border border-gray-300 rounded-md">

        <!-- <Task v-for="task in tasks" :key="task.id" :task="task" /> -->


        <!-- Task table -->
        <table class="table-auto w-full">
          <thead>
            <tr>
              <th class="p-2 border-b">Expand</th>
              <th class="p-2 border-b">Task</th>
              <th class="p-2 border-b">Done</th>
              <th class="p-2 border-b">Edit</th>
              <th class="p-2 border-b">Delete</th>
              <th class="p-2 border-b">Add Subtask</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="task in tasks" :key="task.id">
              <!-- Parent Task Row -->
              <tr v-if="!task.parentId">
                <td class="p-2 text-center">
                  <button @click="toggleExpand(task.id)">
                    <component :is="expandedTasks[task.id] ? ChevronDown : ChevronRight" class="h-4 w-4" />
                  </button>
                </td>
                <td class="p-2">{{ task.title }}</td>
                <td class="p-2 text-center">
                  <input type="checkbox" v-model="task.done" />
                </td>
                <td class="p-2 text-center">
                  <button @click="editTask(task)">
                    <Edit class="h-4 w-4" />
                  </button>
                </td>
                <td class="p-2 text-center">
                  <button @click="deleteTask(task)">
                    <Trash class="h-4 w-4" />
                  </button>
                </td>
                <td class="p-2 text-center">
                  <button @click="startNewSubtask(task.id)">
                    <PlusCircle class="h-4 w-4" />
                  </button>
                </td>
              </tr>

              <!-- Subtask Rows -->
              <tr v-for="subtask in getSubtasks(task.id)" v-if="expandedTasks[task.id]" :key="subtask.id">
                <td class="p-2"></td>
                <td class="p-2 pl-6">{{ subtask.title }}</td>
                <td class="p-2 text-center">
                  <input type="checkbox" v-model="subtask.done" />
                </td>
                <td class="p-2 text-center">
                  <button @click="editTask(subtask)">
                    <Edit class="h-4 w-4" />
                  </button>
                </td>
                <td class="p-2 text-center">
                  <button @click="deleteTask(subtask)">
                    <Trash class="h-4 w-4" />
                  </button>
                </td>
                <td class="p-2"></td>
              </tr>
            </template>
          </tbody>
        </table>

      </div>

      <!-- Input for new task (Parent or Subtask) -->
      <div v-if="addingTask" class="mt-4 p-4 border rounded-md">
        <h2 class="text-lg font-semibold">
          {{ newTaskParentId ? "Add Subtask" : "Add New Main Task" }}
        </h2>
        <input type="text" v-model="newTaskTitle" placeholder="Enter task title"
          class="w-full border p-2 rounded mt-2 text-gray-800" />
        <div class="flex justify-between space-x-2 w-full">
          <button @click="addTask" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md">
            Add Task
          </button>
          <button @click="addingTask = false" class="mt-2 bg-red-500 text-white px-4 py-2 rounded-md">
            Cancel
          </button>
        </div>
      </div>

      <!-- Edit Dialog -->
      <div v-if="editingTask" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
        <div class="bg-white p-4 rounded-lg shadow-lg w-96">
          <h2 class="text-lg font-bold mb-2">Edit Task</h2>
          <input type="text" v-model="editingTask.title" class="w-full border p-2 rounded mb-4" />
          <div class="flex justify-end space-x-2">
            <button @click="cancelEdit" class="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button @click="saveTask" class="px-4 py-2 bg-blue-500 text-white rounded">
              Save
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
