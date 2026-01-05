const socket = io();
const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');

// LẤY ROOM ID AN TOÀN
const parts = location.pathname.split('/').filter(Boolean);
const roomId = parts[0] === 'room' ? parts[1] : null;

if (!roomId) {
  alert('❌ URL sai. Dùng dạng /room/tenphong');
}

let mySymbol = null;
let currentPlayer = null;
let gameOver = false;

socket.emit('joinRoom', roomId);

socket.on('init', data => {
  mySymbol = data.symbol;
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  render(data.board);
  updateTurn();
});

socket.on('state', data => {
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  render(data.board);
  updateTurn();
});

socket.on('gameOver', res => {
  gameOver = true;
  alert(
    res.winner === 'draw'
      ? '🤝 Hòa!'
      : res.winner === mySymbol
        ? '🎉 Bạn thắng!'
        : '💀 Bạn thua!'
  );
});

function render(board) {
  boardEl.innerHTML = '';
  board.forEach((v, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = v || '';
    cell.onclick = () => {
      if (gameOver) return;
      if (currentPlayer !== mySymbol) return;
      socket.emit('move', { roomId, index: i });
    };
    boardEl.appendChild(cell);
  });
}

function updateTurn() {
  if (gameOver) {
    turnEl.textContent = 'Kết thúc';
  } else {
    turnEl.textContent =
      currentPlayer === mySymbol
        ? `🎯 Lượt của bạn (${mySymbol})`
        : '⏳ Đối thủ đang đánh';
  }
}

function reset() {
  socket.emit('reset', roomId);
}
