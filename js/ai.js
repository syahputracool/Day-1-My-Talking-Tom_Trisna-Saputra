import { WINNING_LINES, getAvailableMoves } from "./game.js";

function findImmediateMove(board, player) {
  for (const [a, b, c] of WINNING_LINES) {
    const line = [a, b, c];
    const playerCount = line.filter((index) => board[index] === player).length;
    const empty = line.find((index) => board[index] === null);
    if (playerCount === 2 && empty !== undefined) return empty;
  }
  return null;
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function chooseEasyMove(board) {
  return randomChoice(getAvailableMoves(board));
}

function chooseMediumMove(board) {
  const winningMove = findImmediateMove(board, "O");
  if (winningMove !== null) return winningMove;

  const blockingMove = findImmediateMove(board, "X");
  if (blockingMove !== null) return blockingMove;

  if (board[4] === null) return 4;

  const availableCorners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (availableCorners.length) return randomChoice(availableCorners);

  const availableEdges = [1, 3, 5, 7].filter((index) => board[index] === null);
  return randomChoice(availableEdges);
}

function minimax(board, isMaximizing, depth) {
  const winningLine = getLineForSearch(board);
  if (winningLine) {
    const winner = board[winningLine[0]];
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
  }

  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves) {
      board[move] = "O";
      bestScore = Math.max(bestScore, minimax(board, false, depth + 1));
      board[move] = null;
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const move of availableMoves) {
    board[move] = "X";
    bestScore = Math.min(bestScore, minimax(board, true, depth + 1));
    board[move] = null;
  }
  return bestScore;
}

function getLineForSearch(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return [a, b, c];
  }
  return null;
}

function chooseHardMove(board) {
  let bestScore = -Infinity;
  let bestMoves = [];

  for (const move of getAvailableMoves(board)) {
    board[move] = "O";
    const score = minimax(board, false, 1);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return randomChoice(bestMoves);
}

export function getBotMove(board, difficulty) {
  const availableMoves = getAvailableMoves(board);
  if (!availableMoves.length) return null;

  switch (difficulty) {
    case "easy": return chooseEasyMove(board);
    case "hard": return chooseHardMove([...board]);
    case "medium":
    default: return chooseMediumMove(board);
  }
}
