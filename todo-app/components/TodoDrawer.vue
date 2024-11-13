<template>
  <div class="drawer-container">
    <!-- Bouton d'ouverture/fermeture du drawer -->
    <button
      class="toggle-button"
      @click="toggleDrawer"
      :aria-expanded="isOpen.toString()"
      aria-controls="todoDrawer"
    >
      <span class="arrow-icon" :class="isOpen ? 'rotate' : ''"></span>
      {{ isOpen ? 'Masquer les Sous-tâches' : 'Afficher les Sous-tâches' }}
    </button>

    <!-- Drawer contenant les sous-tâches -->
    <div
      v-show="isOpen"
      id="todoDrawer"
      class="drawer"
      @transitionend="onTransitionEnd"
    >
      <div class="drawer-content">
        <div v-for="child in todo.children" :key="child.id" class="todo-item">
          <TodoAccordion :todo="child" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TodoAccordion from '~/components/TodoAccordion.vue';

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
});

const isOpen = ref(false);

// Fonction pour basculer l'état du drawer
const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
};

// Fonction appelée à la fin de l'animation de transition
const onTransitionEnd = () => {
  // Logique si nécessaire après la transition
};
</script>

<style scoped>
.drawer-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.toggle-button:hover {
  background-color: #45a049;
}

.arrow-icon {
  margin-right: 10px;
  transition: transform 0.3s ease;
  width: 20px;
  height: 20px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
}

.arrow-icon.rotate {
  transform: rotate(-135deg); /* Flèche inversée lorsque le drawer est ouvert */
}

.drawer {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.5s ease;
  opacity: 0;
  pointer-events: none;
}

.drawer-content {
  padding: 10px;
  background-color: #f9f9f9;
}

.drawer.show {
  max-height: 1000px;
  opacity: 1;
  pointer-events: auto;
}

.todo-item {
  padding: 10px;
  background-color: #fff;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.todo-item:hover {
  background-color: #f0f0f0;
}
</style>
