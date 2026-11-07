import { createGameState, makeMove } from "./game.js";
import { getBotMove } from "./ai.js";
import { createShareImage } from "./share.js";

const elements = {
  modeLocal: document.querySelector("#mode-local"),
  modeBot: document.querySelector("#mode-bot"),
  difficultyWrap: document.querySelector("#difficulty-wrap"),
  difficultySelect: document.querySelector("#difficulty-select"),
  board: document.querySelector("#board"),
  cells: [...document.querySelectorAll(".cell")],
  turnMessage: document.querySelector("#turn-message"),
  turnIndicator: document.querySelector("#turn-indicator"),
  xPlayerName: document.querySelector("#x-player-name"),
  oPlayerName: document.querySelector("#o-player-name"),
  xScore: document.querySelector("#x-score"),
  oScore: document.querySelector("#o-score"),
  drawScore: document.querySelector("#draw-score"),
  resetButton: document.querySelector("#reset-button"),
  clearStatsButton: document.querySelector("#clear-stats-button"),
  resultPanel: document.querySelector("#result-panel"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),
  resultBadge: document.querySelector("#result-badge"),
  sharePreview: document.querySelector("#share-preview"),
  shareButton: document.querySelector("#share-button"),
  downloadButton: document.querySelector("#download-button"),
  copyResultButton: document.querySelector("#copy-result-button"),
  shareFeedback: document.querySelector("#share-feedback"),
};

const STORAGE_KEY = "gridplay-tic-tac-toe-stats-v1";
const DEFAULT_STATS = {
  local: { x: 0, o: 0, draws: 0 },
  bot: { wins: 0, losses: 0, draws: 0 },
};

let mode = "bot";
let state = createGameState();
let stats = loadStats();
let botThinking = false;
let shareAsset = null;
let resultSummary = "";
let shareRequestId = 0;

function loadStats() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return structuredClone(DEFAULT_STATS);
    return {
      local: { ...DEFAULT_STATS.local, ...(stored.local || {}) },
      bot: { ...DEFAULT_STATS.bot, ...(stored.bot || {}) },
    };
  } catch {
    return structuredClone(DEFAULT_STATS);
  }
}

function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Permainan tetap berjalan jika penyimpanan browser tidak tersedia.
  }
}

function getDifficultyLabel() {
  return {
    easy: "Mudah",
    medium: "Menengah",
    hard: "Sulit",
  }[elements.difficultySelect.value];
}

function getModeLabel() {
  return mode === "bot" ? "Melawan bot" : "Dua pemain lokal";
}

function getPlayerName(mark) {
  if (mark === "X") return mode === "bot" ? "Kamu" : "Pemain 1";
  return mode === "bot" ? "Bot" : "Pemain 2";
}

function updateModeControls() {
  const isBotMode = mode === "bot";
  elements.modeLocal.classList.toggle("is-active", !isBotMode);
  elements.modeBot.classList.toggle("is-active", isBotMode);
  elements.modeLocal.setAttribute("aria-pressed", String(!isBotMode));
  elements.modeBot.setAttribute("aria-pressed", String(isBotMode));
  elements.difficultyWrap.hidden = !isBotMode;
  elements.xPlayerName.textContent = mode === "bot" ? "Kamu" : "Pemain 1";
  elements.oPlayerName.textContent = mode === "bot" ? "Bot" : "Pemain 2";
}

function updateScoreboard() {
  const currentStats = stats[mode];
  elements.xScore.textContent = mode === "bot" ? currentStats.wins : currentStats.x;
  elements.oScore.textContent = mode === "bot" ? currentStats.losses : currentStats.o;
  elements.drawScore.textContent = currentStats.draws;
}

function updateTurnDisplay() {
  if (state.isOver) {
    elements.turnMessage.textContent = state.isDraw ? "Pertandingan berakhir seri" : `${getPlayerName(state.winner)} menang!`;
    elements.turnIndicator.innerHTML = '<span class="indicator-symbol">✓</span> SELESAI';
    elements.turnIndicator.classList.remove("is-o");
    return;
  }

  const isBotTurn = mode === "bot" && state.currentPlayer === "O";
  elements.turnMessage.textContent = botThinking ? "Bot sedang berpikir..." : (isBotTurn ? "Giliran bot" : `Giliran ${getPlayerName(state.currentPlayer)}`);
  elements.turnIndicator.innerHTML = `<span class="indicator-symbol">${state.currentPlayer === "X" ? "×" : "○"}</span> GILIRAN ${state.currentPlayer}`;
  elements.turnIndicator.classList.toggle("is-o", state.currentPlayer === "O");
}

function renderBoard() {
  elements.cells.forEach((cell, index) => {
    const mark = state.board[index];
    cell.textContent = mark === "X" ? "×" : mark === "O" ? "○" : "";
    cell.classList.toggle("mark-x", mark === "X");
    cell.classList.toggle("mark-o", mark === "O");
    cell.classList.toggle("winning-cell", Boolean(state.winningLine?.includes(index)));
    cell.disabled = Boolean(mark) || state.isOver || botThinking || (mode === "bot" && state.currentPlayer === "O");
    cell.setAttribute("aria-label", `Kotak ${index + 1}, ${mark ? (mark === "X" ? "X" : "O") : "kosong"}`);
  });
  updateTurnDisplay();
}

function render() {
  updateModeControls();
  updateScoreboard();
  renderBoard();
}

function resetSharePanel() {
  shareRequestId += 1;
  shareAsset = null;
  resultSummary = "";
  elements.resultPanel.hidden = true;
  elements.sharePreview.removeAttribute("src");
  elements.shareFeedback.textContent = "";
}

function resetGame() {
  state = createGameState();
  botThinking = false;
  resetSharePanel();
  render();
}

function registerResult() {
  if (mode === "bot") {
    if (state.isDraw) stats.bot.draws += 1;
    else if (state.winner === "X") stats.bot.wins += 1;
    else stats.bot.losses += 1;
  } else {
    if (state.isDraw) stats.local.draws += 1;
    else if (state.winner === "X") stats.local.x += 1;
    else stats.local.o += 1;
  }
  saveStats();
  updateScoreboard();
}

async function showResult() {
  registerResult();
  const winnerText = state.isDraw ? "Pertandingan berakhir seri." : `${getPlayerName(state.winner)} memenangkan pertandingan.`;
  const modeText = mode === "bot" ? `Melawan bot · ${getDifficultyLabel()}` : "Dua pemain lokal";
  resultSummary = `Gridplay — ${winnerText} Mode: ${modeText}.`;

  elements.resultTitle.textContent = state.isDraw ? "Hasil imbang!" : `${getPlayerName(state.winner)} menang!`;
  elements.resultDescription.textContent = `${modeText} · ${state.moveCount} langkah dimainkan`;
  elements.resultBadge.textContent = state.isDraw ? "SERI" : mode === "local" ? "PEMENANG" : state.winner === "X" ? "MENANG" : "KALAH";
  elements.resultPanel.hidden = false;
  elements.shareFeedback.textContent = "Menyiapkan gambar hasil pertandingan...";

  const requestId = ++shareRequestId;
  try {
    const generated = await createShareImage({
      board: [...state.board],
      resultText: state.isDraw ? "PERTANDINGAN SERI" : `${getPlayerName(state.winner).toUpperCase()} MENANG`,
      modeText,
      difficultyText: mode === "bot" ? getDifficultyLabel() : "",
      winner: state.isDraw ? "draw" : state.winner,
    });
    if (requestId !== shareRequestId) return;
    shareAsset = generated;
    elements.sharePreview.src = generated.dataUrl;
    elements.shareFeedback.textContent = "Gambar hasil pertandingan siap dibagikan.";
  } catch (error) {
    if (requestId !== shareRequestId) return;
    elements.shareFeedback.textContent = error.message || "Gambar gagal dibuat. Coba muat ulang halaman.";
  }
}

function playMove(index) {
  if (state.isOver || botThinking || (mode === "bot" && state.currentPlayer !== "X")) return;
  if (!makeMove(state, index)) return;

  renderBoard();
  if (state.isOver) {
    void showResult();
    return;
  }

  if (mode === "bot" && state.currentPlayer === "O") {
    scheduleBotMove();
  }
}

function scheduleBotMove() {
  botThinking = true;
  renderBoard();
  window.setTimeout(() => {
    if (mode !== "bot" || state.isOver || state.currentPlayer !== "O") {
      botThinking = false;
      renderBoard();
      return;
    }
    const move = getBotMove(state.board, elements.difficultySelect.value);
    botThinking = false;
    if (move !== null) makeMove(state, move);
    renderBoard();
    if (state.isOver) void showResult();
  }, 420);
}

function setMode(nextMode) {
  if (mode === nextMode) return;
  mode = nextMode;
  resetGame();
}

function downloadImage() {
  if (!shareAsset) return;
  const url = URL.createObjectURL(shareAsset.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gridplay-hasil-pertandingan.png";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  elements.shareFeedback.textContent = "Gambar berhasil diunduh.";
}

async function shareImage() {
  if (!shareAsset) {
    elements.shareFeedback.textContent = "Gambar hasil belum siap.";
    return;
  }

  try {
    if (navigator.share && navigator.canShare?.({ files: [shareAsset.file] })) {
      await navigator.share({
        title: "Hasil pertandingan Gridplay",
        text: resultSummary,
        files: [shareAsset.file],
      });
      elements.shareFeedback.textContent = "Menu berbagi berhasil dibuka.";
      return;
    }

    downloadImage();
    elements.shareFeedback.textContent = "Browser ini belum mendukung berbagi gambar langsung. Gambar diunduh agar bisa kamu bagikan.";
  } catch (error) {
    if (error.name === "AbortError") {
      elements.shareFeedback.textContent = "Berbagi dibatalkan.";
      return;
    }
    elements.shareFeedback.textContent = "Gagal membuka fitur berbagi. Coba unduh gambarnya.";
  }
}

async function copyResult() {
  if (!resultSummary) return;
  try {
    await navigator.clipboard.writeText(resultSummary);
    elements.shareFeedback.textContent = "Ringkasan pertandingan berhasil disalin.";
  } catch {
    elements.shareFeedback.textContent = "Clipboard tidak tersedia. Kamu bisa mengunduh gambar hasil pertandingan.";
  }
}

elements.modeLocal.addEventListener("click", () => setMode("local"));
elements.modeBot.addEventListener("click", () => setMode("bot"));
elements.difficultySelect.addEventListener("change", resetGame);
elements.cells.forEach((cell) => cell.addEventListener("click", () => playMove(Number(cell.dataset.index))));
elements.resetButton.addEventListener("click", resetGame);
elements.clearStatsButton.addEventListener("click", () => {
  stats = structuredClone(DEFAULT_STATS);
  saveStats();
  updateScoreboard();
});
elements.shareButton.addEventListener("click", shareImage);
elements.downloadButton.addEventListener("click", downloadImage);
elements.copyResultButton.addEventListener("click", copyResult);

render();
