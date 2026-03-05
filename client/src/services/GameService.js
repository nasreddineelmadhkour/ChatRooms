export class GameService {
  static SYMBOLS = ['♥', '♦', '♣', '☻'];
  
  static createBoard(size) {
    return Array(size * size).fill(null);
  }

  static checkWinner(board, size) {
    const winCondition = size === 3 ? 3 : (size < 6 ? 4 : 5);
    
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) continue;
      
      const row = Math.floor(i / size);
      const col = i % size;
      
      const directions = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: -1 }
      ];

      for (const { x, y } of directions) {
        let line = [i];
        for (let step = 1; step < winCondition; step++) {
          const nextCol = col + x * step;
          const nextRow = row + y * step;
          const nextIdx = nextRow * size + nextCol;

          if (nextCol >= 0 && nextCol < size && nextRow >= 0 && nextRow < size && board[nextIdx] === board[i]) {
            line.push(nextIdx);
          } else break;
        }
        
        if (line.length === winCondition) {
          return { winner: board[i], line };
        }
      }
    }
    return { winner: null, line: [] };
  }
}