<template>
  <div 
    class="app-container" 
    @mouseenter="handleAppFocus" 
    @mouseleave="isFocused = false"
  >
    <div v-if="!joined" class="login-card">
      <div class="header">
        <h1>💬 Chat Privé</h1>
        <p>Entrez un code de room pour commencer</p>
      </div>
      <div class="form">
        <div class="avatar-selector">
          <label>Choisissez un Avatar</label>
          <div class="avatars">
            <span v-for="a in ['👤','🐱','🐶','🦊','🦁','🤖']" 
                  :key="a" 
                  :class="{ active: avatar === a }" 
                  @click="avatar = a">{{ a }}</span>
          </div>
        </div>
        <div class="input-group">
          <label>Votre Nom</label>
          <input v-model="username" placeholder="Ex: Ahmed..." @keyup.enter="joinRoom" />
        </div>
        <div class="input-group">
          <label>Code de la Room</label>
          <input v-model="room" placeholder="Ex: 2024..." @keyup.enter="joinRoom" />
        </div>
        <button @click="joinRoom" class="join-btn">Rejoindre la Room</button>
      </div>
    </div>

    <div v-else class="chat-layout" :class="{ 'is-blurred': !isFocused }">
      <div class="sidebar">
        <h3>👥 Membres</h3>
        <div class="user-list">
          <div v-for="user in activeUsers" :key="user.username" class="user-item">
            <span class="user-avatar">{{ user.avatar }}</span>
            <span class="user-name">{{ user.username }}</span>
          </div>
        </div>
        <h3>🎲 Jeu de Morpion</h3>
        <button @click="toggleGame" class="game-btn">🎮 Jouer XO</button>

<div v-if="showGame" class="game-overlay">
  <div class="game-card" :style="{ width: boardSize > 3 ? '400px' : '300px' }">
    <div class="game-header">
  <div class="title-area">
    <h3>🎮 Morpion Dynamic</h3>
    
    <div class="dimension-selector" v-if="!winner">
      <span>Dimension:</span>
      <div class="size-options">
        <button v-for="size in [3, 4, 5, 9]" 
                :key="size" 
                :class="{ active: manualSize === size }"
                @click="changeDimension(size)">
          {{ size }}x{{ size }}
        </button>
      </div>
    </div>
  </div>
  <button class="close-btn" @click="showGame = false">✕</button>
</div>

    <div class="game-grid" :style="gridStyle">
  <div v-for="(cell, index) in board" 
       :key="index" 
       class="game-cell" 
       :class="{ 
          'small-cell': boardSize > 5,
          'winner-cell': winningLine.includes(index) 
       }"
       @click="makeMove(index)">
    {{ cell }}
  </div>
</div>

    <div class="game-footer">
      <p class="turn-info">Tour de: <span class="current-sym">{{ gameSymbols[currentPlayerIndex] }}</span></p>
      <button @click="resetGame" class="reset-btn">Réinitialiser</button>
      <h2 v-if="winner" class="winner-anim">🎉 Gagnant: {{ winner }} !</h2>
    </div>
  </div>
</div>
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
          <button @click="leaveChat" class="leave-btn">Quitter</button>
        </div>

        <div class="message-container" ref="messageBox">
          <div v-for="(m, i) in messages" :key="i" 
               :class="['message-wrapper', m.type === 'system' ? 'system-msg' : (m.username === username ? 'me' : 'others')]">
            
            <div v-if="m.type === 'system'" class="system-text">
              {{ m.message }}
            </div>

            <div v-else class="message-content">
              <span class="sender-name">{{ m.avatar }} {{ m.username }}</span>
              
              <div v-if="m.image" class="image-wrapper">
                <img :src="m.image" class="chat-img" alt="shared image" />
              </div>
              
              <p v-if="m.message" class="text">{{ m.message }}</p>
              <span class="time">{{ m.time }}</span>
            </div>
          </div>

          <div v-if="typingUser" class="typing-notif">
            ✍️ {{ typingUser }} est en train d'écrire...
          </div>
        </div>

        <div class="quick-actions">
          <button @click="sendQuickEmoji('😂😂😂')" class="quick-btn">😂😂😂</button>
          <button @click="sendQuickEmoji('❤️❤️❤️')" class="quick-btn">❤️❤️❤️</button>
          <button @click="sendQuickEmoji('😭😭😭')" class="quick-btn">😭😭😭</button>
        </div>

        <div class="chat-input-area">
          <div class="emoji-picker-container">
  <button @click="showEmojiPicker = !showEmojiPicker" class="emoji-trigger">😀</button>
  
  <div v-if="showEmojiPicker" class="emoji-picker">
    <div class="emoji-tabs">
      <span v-for="(list, category) in emojiGroups" 
            :key="category" 
            @click="activeCategory = category"
            :class="{ active: activeCategory === category }">
        {{ categoryIcons[category] }}
      </span>
    </div>

    <div class="emoji-grid">
      <span v-for="e in emojiGroups[activeCategory]" 
            :key="e" @click="addEmoji(e)">{{ e }}</span>
    </div>
  </div>
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
  </div>
  
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue';
import io from 'socket.io-client';

const socket = io('http://172.17.20.244:3001'); 

// --- حالات الدردشة الأساسية ---
const username = ref('');
const room = ref('');
const joined = ref(false);
const messages = ref([]);
const newMessage = ref('');
const messageBox = ref(null);
const inputField = ref(null); 
const avatar = ref('👤');
const activeUsers = ref([]);
const typingUser = ref("");
const showEmojiPicker = ref(false);
const isFocused = ref(true); 
let typingTimeout = null;

// --- حالات اللعبة ---
const showGame = ref(false);
const manualSize = ref(3); 
const gameSymbols = ['♥', '♦', '♣', '☻'];
const board = ref([]);
const currentPlayerIndex = ref(0);
const winner = ref(null);
const winningLine = ref([]); // المربعات الفائزة لتلوينها بالأخضر

// --- منطق حجم اللعبة والشبكة ---
const boardSize = computed(() => manualSize.value);

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${boardSize.value}, 1fr)`,
  gap: '6px'
}));

const generateBoard = () => {
  board.value = Array(boardSize.value * boardSize.value).fill(null);
  winner.value = null;
  winningLine.value = [];
};

const toggleGame = () => {
  showGame.value = !showGame.value;
};

// إرسال تحديث الحجم للجميع
const updateBoardSize = () => {
  socket.emit('change_game_size', { 
    room: room.value, 
    size: manualSize.value 
  });
};

// --- منطق اللعب ---
const makeMove = (index) => {
  if (!board.value[index] && !winner.value) {
    const myIndex = activeUsers.value.findIndex(u => u.username === username.value);
    
    // منع اللاعب من اللعب في غير دوره
    if (myIndex !== currentPlayerIndex.value) {
      alert("Ce n'est pas votre tour !");
      return;
    }

    socket.emit('game_move', {
      room: room.value,
      index: index,
      symbol: gameSymbols[currentPlayerIndex.value],
      nextPlayer: (currentPlayerIndex.value + 1) % activeUsers.value.length
    });
  }
};

const checkWinner = () => {
  const size = boardSize.value;
  const b = board.value;
  // شرط الفوز: 3 في المصفوفة الصغيرة، 4 في المتوسطة، 5 في الكبيرة (9x9)
  const winCondition = size === 3 ? 3 : (size < 6 ? 4 : 5); 

  for (let i = 0; i < b.length; i++) {
    if (!b[i]) continue;
    const row = Math.floor(i / size);
    const col = i % size;

    const directions = [
      { x: 1, y: 0 },  // أفقي
      { x: 0, y: 1 },  // عمودي
      { x: 1, y: 1 },  // قطري يمين
      { x: 1, y: -1 }  // قطري يسار
    ];

    for (const { x, y } of directions) {
      let line = [i];
      for (let step = 1; step < winCondition; step++) {
        const nextCol = col + x * step;
        const nextRow = row + y * step;
        const nextIdx = nextRow * size + nextCol;

        if (nextCol >= 0 && nextCol < size && nextRow >= 0 && nextRow < size && b[nextIdx] === b[i]) {
          line.push(nextIdx);
        } else { break; }
      }
      
      if (line.length === winCondition) {
        winner.value = b[i];
        winningLine.value = line; // تحديد المربعات الفائزة
        return;
      }
    }
  }
};

const resetGame = () => {
  socket.emit('game_reset', { room: room.value });
};

// --- إعدادات الإيموجي ---
const activeCategory = ref('Smileys');
const categoryIcons = { Smileys: '😀', Gestures: '👍', Hearts: '❤️', Objects: '🔥', Nature: '🌍', Food: '🍕' };
const emojiGroups = {
  Smileys: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','😗','😙','😚','🙂','🤗','🤔','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🤠','🥳','🥸','😈','👿','👹','👺','💀','👻','👽'],
  Gestures: ['👍','👎','👌','✌️','🤞','🤟','🤘','👏','🙌','👐','🤲','🙏','✋','🖐️','🖖','👋','🤙','💪'],
  Hearts: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','✅','❌','⚠️','❓','❗','💯','✔️','✖️'],
  Objects: ['🔥','✨','🎉','🎊','🎁','🎈','🚀','🛸','💣','💡','📌','📎','🧠','💻','📱','⌨️','🖥️'],
  Nature: ['🌍','🌎','🌏','🌞','🌝','⭐','🌟','🌈','☀️','🌙','☁️','⛅','🌧️','❄️','🌊'],
  Food: ['🍕','🍔','🍟','🌭','🍿','🥓','🥚','🍳','🧀','🍰','🎂','🍩','🍪','☕','🍺','🍷','🥤']
};

// --- منطق الدردشة المتقدم ---
const handlePaste = (event) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file' && item.type.includes('image')) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => sendImage(e.target.result);
      reader.readAsDataURL(blob);
    }
  }
};

const sendImage = (base64Data) => {
  const data = {
    room: room.value, username: username.value, avatar: avatar.value,
    message: "", image: base64Data,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  socket.emit('send_message', data);
};

const sendQuickEmoji = (emojiString) => {
  const data = { 
    room: room.value, username: username.value, avatar: avatar.value, 
    message: emojiString, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  socket.emit('send_message', data);
  showEmojiPicker.value = false;
  nextTick(() => inputField.value.focus());
};

const joinRoom = () => {
  if(username.value && room.value) {
    socket.emit('join_room', { username: username.value, room: room.value, avatar: avatar.value });
    joined.value = true;
  }
};

const handleTyping = () => {
  socket.emit('typing', { room: room.value, username: username.value, typing: true });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { room: room.value, username: username.value, typing: false });
  }, 2000);
};

const addEmoji = (e) => {
  newMessage.value += e;
  nextTick(() => inputField.value.focus());
};

const send = () => {
  if(newMessage.value.trim()) {
    const data = { 
      room: room.value, username: username.value, avatar: avatar.value, 
      message: newMessage.value, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit('send_message', data);
    newMessage.value = '';
    showEmojiPicker.value = false;
  }
};

const handleAppFocus = () => { isFocused.value = true; };
const leaveChat = () => { socket.disconnect(); window.location.reload(); };

// --- السوكيت والمراقبة ---
watch(activeUsers, () => {
  if (joined.value && board.value.length === 0) generateBoard();
}, { immediate: true });

onMounted(() => {
  if ("Notification" in window) Notification.requestPermission();

  socket.on("receive_message", (data) => {
    messages.value.push(data);
    nextTick(() => { if (messageBox.value) messageBox.value.scrollTop = messageBox.value.scrollHeight; });
  });

  socket.on("room_users", (users) => activeUsers.value = users);
  
  socket.on("user_typing", (data) => {
    if (data.username !== username.value) typingUser.value = data.typing ? data.username : "";
  });

  socket.on("update_game", (data) => {
    board.value[data.index] = data.symbol;
    currentPlayerIndex.value = data.nextPlayer;
    checkWinner();
  });

  socket.on("game_resetted", () => {
    generateBoard();
  });

  socket.on("size_changed", (newSize) => {
    manualSize.value = newSize;
    generateBoard();
  });

  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>