<template>
  <div class="chat-layout" :class="{ 'is-blurred': !isFocused }">
    <div class="sidebar">
      <UserList :users="activeUsers" />
      
      <h3>🎲 Jeu de Morpion</h3>
      <button @click="showGame = !showGame" class="game-btn">
        🎮 Jouer XO
      </button>

      <TicTacToeGame
        :show="showGame"
        :room="room"
        :username="username"
        :users="activeUsers"
        @close="showGame = false"
        @move="handleGameMove"
        @reset="handleGameReset"
        @changeSize="handleSizeChange"
      />
    </div>

    <div class="chat-window">
      <div class="chat-header">
        <div class="room-info">
          <span class="status-dot"></span>
          <div>
            <h3>Room: {{ room }}</h3>
            <small>Connecté en tant que {{ username }}</small>
          </div>
        </div>
        <button @click="$emit('leave')" class="leave-btn">Quitter</button>
      </div>

      <div class="message-container" ref="messageBox">
        <MessageItem
          v-for="(m, i) in messages"
          :key="i"
          :message="m"
          :currentUsername="username"
        />

        <div v-if="typingUser" class="typing-notif">
          ✍️ {{ typingUser }} est en train d'écrire...
        </div>
      </div>

      <div class="quick-actions">
        <button 
          v-for="emoji in quickEmojis" 
          :key="emoji"
          @click="sendQuickEmoji(emoji)" 
          class="quick-btn"
        >
          {{ emoji }}
        </button>
      </div>

      <div class="chat-input-area">
        <div class="emoji-picker-container">
          <button @click="showEmojiPicker = !showEmojiPicker" class="emoji-trigger">
            😀
          </button>
          
          <EmojiPicker
            :show="showEmojiPicker"
            @select="addEmoji"
          />
        </div>
        
        <input 
          ref="inputField" 
          v-model="newMessage" 
          @keyup.enter="send" 
          @input="handleTyping"
          placeholder="Écrivez votre message..." 
        />
        
        <button @click="send" class="send-btn">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import UserList from './UserList.vue';
import MessageItem from './MessageItem.vue';
import EmojiPicker from './EmojiPicker.vue';
import TicTacToeGame from './TicTacToeGame.vue';
import { ChatService } from '../services/chatService';
import { EmojiService } from '../services/emojiService';

const props = defineProps({
  room: String,
  username: String,
  avatar: String,
  socket: Object
});

const emit = defineEmits(['leave']);

const messages = ref([]);
const newMessage = ref('');
const messageBox = ref(null);
const inputField = ref(null);
const activeUsers = ref([]);
const typingUser = ref('');
const showEmojiPicker = ref(false);
const showGame = ref(false);
const isFocused = ref(true);
const quickEmojis = EmojiService.getQuickEmojis();

let typingTimeout = null;

const handleTyping = () => {
  props.socket.emit('typing', { 
    room: props.room, 
    username: props.username, 
    typing: true 
  });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    props.socket.emit('typing', { 
      room: props.room, 
      username: props.username, 
      typing: false 
    });
  }, 2000);
};

const addEmoji = (emoji) => {
  newMessage.value += emoji;
  showEmojiPicker.value = false;
  nextTick(() => inputField.value.focus());
};

const send = () => {
  if (newMessage.value.trim()) {
    const data = ChatService.createMessage(
      props.username,
      props.avatar,
      props.room,
      newMessage.value
    );
    props.socket.emit('send_message', data);
    newMessage.value = '';
    showEmojiPicker.value = false;
  }
};

const sendQuickEmoji = (emoji) => {
  const data = ChatService.createMessage(
    props.username,
    props.avatar,
    props.room,
    emoji
  );
  props.socket.emit('send_message', data);
};

const handlePaste = (event) => {
  ChatService.handlePasteImage(event, (base64) => {
    const data = ChatService.createMessage(
      props.username,
      props.avatar,
      props.room,
      '',
      base64
    );
    props.socket.emit('send_message', data);
  });
};

const handleGameMove = (moveData) => {
  props.socket.emit('game_move', {
    room: props.room,
    ...moveData
  });
};

const handleGameReset = () => {
  props.socket.emit('game_reset', { room: props.room });
};

const handleSizeChange = (size) => {
  props.socket.emit('change_game_size', { 
    room: props.room, 
    size 
  });
};

onMounted(() => {
  props.socket.on('receive_message', (data) => {
    messages.value.push(data);
    nextTick(() => {
      if (messageBox.value) {
        messageBox.value.scrollTop = messageBox.value.scrollHeight;
      }
    });
  });

  props.socket.on('room_users', (users) => {
    activeUsers.value = users;
  });

  props.socket.on('user_typing', (data) => {
    if (data.username !== props.username) {
      typingUser.value = data.typing ? data.username : '';
    }
  });

  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>