<template>
  <div v-if="show" class="game-overlay">
    <div class="game-card" :style="{ width: boardSize > 3 ? '400px' : '300px' }">
      <div class="game-header">
        <div class="title-area">
          <h3>🎮 Morpion Dynamic</h3>
          
          <div class="dimension-selector" v-if="!winner">
            <span>Dimension:</span>
            <div class="size-options">
              <button 
                v-for="size in [3, 4, 5, 9]" 
                :key="size" 
                :class="{ active: boardSize === size }"
                @click="changeDimension(size)"
              >
                {{ size }}x{{ size }}
              </button>
            </div>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="game-grid" :style="gridStyle">
        <div 
          v-for="(cell, index) in board" 
          :key="index" 
          class="game-cell" 
          :class="{ 
            'small-cell': boardSize > 5,
            'winner-cell': winningLine.includes(index) 
          }"
          @click="makeMove(index)"
        >
          {{ cell }}
        </div>
      </div>

      <div class="game-footer">
        <p class="turn-info">
          Tour de: <span class="current-sym">{{ gameSymbols[currentPlayerIndex] }}</span>
        </p>
        <button @click="resetGame" class="reset-btn">Réinitialiser</button>
        <h2 v-if="winner" class="winner-anim">🎉 Gagnant: {{ winner }} !</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { GameService } from '../services/gameService';

const props = defineProps({
  show: Boolean,
  room: String,
  username: String,
  users: Array
});

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
// دالة تغيير الأبعاد وتنبيه السيرفر
const changeDimension = (size) => {
  manualSize.value = size; // تغيير الحجم محلياً
  generateBoard();         // إعادة بناء المصفوفة
  
  // إرسال الحجم الجديد للسيرفر ليتغير عند الجميع
  socket.emit('change_game_size', { 
    room: room.value, 
    size: size 
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

});
watch(() => props.show, (newVal) => {
  if (newVal) generateBoard();
});
</script>