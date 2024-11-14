<script setup lang="ts">
import {
  ChevronDown,
  ChevronRight,
  Edit,
  PlusCircle,
  Trash,
} from "lucide-vue-next";
import { ref } from "vue";
import { fetchTodos } from '~/services/todoService';

export interface NewTask {
  id: number;
  title: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
  links: {
    self: string;
    subtasks?: string;
    parent?: string;
  };
}

const newtasks = ref<NewTask[]>([]);

fetchTodos().then((data) => {
  newtasks.value = data;
});

const expandedTasks = ref<Record<string, boolean>>({});
const editingTask = ref<NewTask | null>(null);
const newTaskTitle = ref(""); // Title of the new task being added
const newTaskParentId = ref<string | null>(null); // Determines if it's a parent or subtask
const addingTask = ref(false); // Controls if the add form should be displayed

function toggleExpand(taskId: string) {
  expandedTasks.value[taskId] = !expandedTasks.value[taskId];
}

function cancelEdit() {
  editingTask.value = null;
}

function addTask() {
  if (!newTaskTitle.value) return;

  const id = `task${Date.now()}`;
  // tasks.value.push({
  //   id,
  //   title: newTaskTitle.value,
  //   done: false,
  //   createdAt: new Date(),
  //   parentId: newTaskParentId.value || undefined,
  // });
  newTaskTitle.value = "";
  newTaskParentId.value = null;
  addingTask.value = false;
}

function startNewParentTask() {
  newTaskParentId.value = null;
  addingTask.value = true;
}

function startNewSubtask(parentId: string) {
  newTaskParentId.value = parentId;
  addingTask.value = true;
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

      <div v-if="newtasks.length === 0" class="text-center text-gray-500">
        No tasks found. Click the button above to add a new task.
      </div>

      <div class="p-2 border border-gray-300 rounded-t-md text-center mt-4" v-else>
        Total Tasks: {{ newtasks.length }} | Completed:
        {{ newtasks.filter((task: any) => task.done).length }}
      </div>

      <div class="w-full border border-gray-300 rounded-b-md">

        <Task v-for="task in newtasks" :key="task.id" :task="task" />

        <!-- 
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
              <tr v-if="!task.parentId">
                <td class="p-2 text-center">
                  <Button @click="toggleExpand(task.id)" variant="outline" size="icon">
                    <component :is="expandedTasks[task.id] ? ChevronDown : ChevronRight" class="h-4 w-4" />
                  </Button>
                </td>
                <td class="p-2">{{ task.title }}</td>
                <td class="p-2 text-center">
                  <input type="checkbox" v-model="task.done" />
                </td>
                <td class="p-2 text-center" variant="outline" size="icon">
                  <Button @click="editTask(task)" variant="outline" size="icon">
                    <Edit class="h-4 w-4" />
                  </Button>
                </td>
                <td class="p-2 text-center">
                  <Button @click="deleteTask(task)" variant="outline" size="icon">
                    <Trash class="h-4 w-4" />
                  </Button>
                </td>
                <td class="p-2 text-center">
                  <Button @click="startNewSubtask(task.id)" variant="outline" size="icon">
                    <PlusCircle class="h-4 w-4" />
                  </Button>
                </td>
              </tr>

              <tr v-for="subtask in getSubtasks(task.id)" v-if="expandedTasks[task.id]" :key="subtask.id">
                <td class="p-2"></td>
                <td class="p-2 pl-6">{{ subtask.title }}</td>
                <td class="p-2 text-center">
                  <input type="checkbox" v-model="subtask.done" />
                </td>
                <td class="p-2 text-center">
                  <Button @click="editTask(subtask)" variant="outline" size="icon">
                    <Edit class="h-4 w-4" />
                  </Button>
                </td>
                <td class="p-2 text-center">
                  <Button @click="deleteTask(subtask)" variant="outline" size="icon">
                    <Trash class="h-4 w-4" />
                  </Button>
                </td>
                <td class="p-2"></td>
              </tr>
            </template>
</tbody>
</table> -->
      </div>

      <div v-if="addingTask" class="mt-4 p-5 border rounded-md">
        <h2 class="text-lg font-semibold mb-4">
          {{ newTaskParentId ? "Add Subtask" : "Add New Main Task" }}
        </h2>
        <Input type="text" v-model="newTaskTitle" placeholder="Enter task title" />
        <div class="flex justify-end w-full space-x-2 mt-4">
          <div>
            <Button @click="addingTask = false" class="m-2" variant="destructive">
              Cancel
            </Button>

            <Button @click="addTask" class="m-2"> Add Task </Button>
          </div>
        </div>
      </div>

      <div v-if="editingTask" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
        <div class="bg-background border border-border p-5 rounded-lg shadow-lg w-96">
          <h2 class="text-lg font-bold mb-4">Edit Task</h2>
          <Input type="text" v-model="editingTask.title" placeholder="Enter task title" />
          <div class="flex justify-end w-full space-x-2 mt-4">
            <div>
              <Button @click="cancelEdit" class="m-2" variant="destructive">
                Cancel
              </Button>
              <Button @click="saveTask" class="m-2"> Save </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
