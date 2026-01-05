import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// ===== SERVE FRONTEND =====
const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// SPA fallback (CỰC KỲ QUAN TRỌNG)
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ===== GAME DATA =====
const rooms = {};

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  if (board.every(Boolean)) return { winner: 'draw' };
  return null;
}

// ===== SOCKET =====
io.on('connection', socket => {

  socket.on('joinRoom', roomId => {
    if (!roomId) return;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        gameOver: false,
        players: {}
      };
    }

    const room = rooms[roomId];
    const count = Object.keys(room.players).length;

    if (count >= 2) {
      socket.emit('roomFull');
      return;
    }

    const symbol = count === 0 ? 'X' : 'O';
    room.players[socket.id] = symbol;
    socket.join(roomId);

    socket.emit('init', {
      symbol,
      board: room.board,
      currentPlayer: room.currentPlayer,
      gameOver: room.gameOver
    });

    // 🔥 BẮT BUỘC: đồng bộ state cho tất cả
    io.to(roomId).emit('state', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      gameOver: room.gameOver
    });
  });

  socket.on('move', ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room || room.gameOver) return;

    const symbol = room.players[socket.id];
    if (!symbol || symbol !== room.currentPlayer) return;
    if (room.board[index]) return;

    room.board[index] = symbol;

    const result = checkWinner(room.board);
    if (result) {
      room.gameOver = true;
      io.to(roomId).emit('gameOver', result);
    } else {
      room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
    }

    io.to(roomId).emit('state', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      gameOver: room.gameOver
    });
  });

  socket.on('reset', roomId => {
    const room = rooms[roomId];
    if (!room) return;

    room.board = Array(9).fill(null);
    room.currentPlayer = 'X';
    room.gameOver = false;

    io.to(roomId).emit('state', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      gameOver: false
    });
  });

  socket.on('disconnect', () => {
    for (const id in rooms) {
      const room = rooms[id];
      delete room.players[socket.id];
      if (Object.keys(room.players).length === 0) {
        delete rooms[id];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('🎮 Caro Online running on port', PORT);
});