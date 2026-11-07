export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function createGameState() {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    winningLine: null,
    isDraw: false,
    isOver: false,
    moveCount: 0,
  };
}

export function getWinningLine(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

export function getAvailableMoves(board) {
  return board.reduce((moves, cell, index) => {
    if (cell === null) moves.push(index);
    return moves;
  }, []);
}

export function makeMove(state, index) {
  if (state.isOver || state.board[index] !== null || index < 0 || index > 8) return false;

  state.board[index] = state.currentPlayer;
  state.moveCount += 1;

  const winningLine = getWinningLine(state.board);
  if (winningLine) {
    state.winner = state.currentPlayer;
    state.winningLine = winningLine;
    state.isOver = true;
  } else if (state.moveCount === 9) {
    state.isDraw = true;
    state.isOver = true;
  } else {
    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
  }

  return true;
}
