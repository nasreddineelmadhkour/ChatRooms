<template>
  <div class="user-list-container">
    <h3>👥 Membres</h3>
    <div class="user-list">
      <div v-for="user in users" :key="user.username" class="user-item">
        <span class="user-avatar">{{ user.avatar }}</span>
        <span class="user-name">{{ user.username }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  users: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.user-list-container {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}
.user-avatar {
  font-size: 1.5rem;
}
.user-name {
  font-size: 0.875rem;
  color: #374151;
}
</style>