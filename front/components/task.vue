
<template>
  <div class="task">
    <div class="task-header">
      <h3>{{ task.title }}</h3>
      <div class="task-actions">
        <button @click="editTask(task)">Edit</button>
        <button @click="deleteTask(task)">Delete</button>
      </div>
    </div>
    <div class="task-content">
      <p>{{ task.description }}</p>
      <div class="subtasks">
        <div v-for="subtask in getSubtasks(task.id)" :key="subtask.id">
          <Task :task="subtask" />
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>

</script>
