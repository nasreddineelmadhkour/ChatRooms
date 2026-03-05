<template>
  <div :class="['message-wrapper', messageClass]">
    <div v-if="message.type === 'system'" class="system-text">
      {{ message.message }}
    </div>

    <div v-else class="message-content">
      <span class="sender-name">{{ message.avatar }} {{ message.username }}</span>
      
      <div v-if="message.image" class="image-wrapper">
        <img :src="message.image" class="chat-img" alt="shared image" />
      </div>
      
      <p v-if="message.message" class="text">{{ message.message }}</p>
      <span class="time">{{ message.time }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: Object,
  currentUsername: String
});

const messageClass = computed(() => {
  if (props.message.type === 'system') return 'system-msg';
  return props.message.username === props.currentUsername ? 'me' : 'others';
});
</script>
