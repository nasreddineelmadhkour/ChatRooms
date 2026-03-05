<template>
  <div class="login-card">
    <div class="header">
      <h1>💬 Chat Privé</h1>
      <p>Entrez un code de room pour commencer</p>
    </div>
    <div class="form">
      <AvatarSelector v-model="avatar" />
      
      <div class="input-group">
        <label>Votre Nom</label>
        <input 
          v-model="username" 
          placeholder="Ex: Ahmed..." 
          @keyup.enter="handleJoin" 
        />
      </div>
      
      <div class="input-group">
        <label>Code de la Room</label>
        <input 
          v-model="room" 
          placeholder="Ex: 2024..." 
          @keyup.enter="handleJoin" 
        />
      </div>
      
      <button @click="handleJoin" class="join-btn">
        Rejoindre la Room
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AvatarSelector from './AvatarSelector.vue';

const emit = defineEmits(['join']);

const username = ref('');
const room = ref('');
const avatar = ref('👤');

const handleJoin = () => {
  if (username.value.trim() && room.value.trim()) {
    emit('join', {
      username: username.value,
      room: room.value,
      avatar: avatar.value
    });
  }
};
</script>