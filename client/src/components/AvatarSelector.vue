<template>
  <div class="avatar-selector">
    <label>Choisissez un Avatar</label>
    <div class="avatars">
      <span 
        v-for="a in avatars" 
        :key="a" 
        :class="{ active: modelValue === a }" 
        @click="$emit('update:modelValue', a)"
      >
        {{ a }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String
});

defineEmits(['update:modelValue']);

const avatars = ['👤','🐱','🐶','🦊','🦁','🤖'];
</script>

<style scoped>
.avatar-selector {
  margin-bottom: 1rem;
}
.avatar-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.avatars {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.avatars span {
  font-size: 2rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.5rem;
  background: #f3f4f6;
  transition: all 0.2s;
}
.avatars span:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}
.avatars span.active {
  background: #3b82f6;
  transform: scale(1.15);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>