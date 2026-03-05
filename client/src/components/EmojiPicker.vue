<template>
  <div v-if="show" class="emoji-picker">
    <div class="emoji-tabs">
      <span 
        v-for="(icon, category) in categoryIcons" 
        :key="category" 
        @click="activeCategory = category"
        :class="{ active: activeCategory === category }"
      >
        {{ icon }}
      </span>
    </div>

    <div class="emoji-grid">
      <span 
        v-for="e in emojiGroups[activeCategory]" 
        :key="e" 
        @click="$emit('select', e)"
      >
        {{ e }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { EmojiService } from '../services/emojiService';

defineProps({
  show: Boolean
});

defineEmits(['select']);

const activeCategory = ref('Smileys');
const categoryIcons = EmojiService.CATEGORY_ICONS;
const emojiGroups = EmojiService.EMOJIS;
</script>

<style scoped>
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  width: 20rem;
  max-height: 20rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}
.emoji-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.emoji-tabs span {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}
.emoji-tabs span:hover {
  background: #f3f4f6;
}
.emoji-tabs span.active {
  background: white;
  border-bottom: 2px solid #3b82f6;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  padding: 0.75rem;
  max-height: 16rem;
  overflow-y: auto;
}
.emoji-grid span {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  text-align: center;
  transition: background 0.2s;
}
.emoji-grid span:hover {
  background: #f3f4f6;
}
</style>