const PALETTE = {
  background: "#101827",
  card: "#172235",
  cell: "#1f3048",
  text: "#f3f6fb",
  muted: "#9baac0",
  mint: "#82e6c2",
  coral: "#ff9b86",
  yellow: "#f6d58a",
};

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawMark(ctx, mark, centerX, centerY, size) {
  ctx.save();
  ctx.lineWidth = 17;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = mark === "X" ? PALETTE.mint : PALETTE.coral;

  if (mark === "X") {
    const half = size * 0.29;
    ctx.beginPath();
    ctx.moveTo(centerX - half, centerY - half);
    ctx.lineTo(centerX + half, centerY + half);
    ctx.moveTo(centerX + half, centerY - half);
    ctx.lineTo(centerX - half, centerY + half);
    ctx.stroke();
  } else if (mark === "O") {
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.29, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export async function createShareImage({ board, resultText, modeText, difficultyText, winner }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pembuatan gambar.");

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#142a36");
  gradient.addColorStop(0.55, PALETTE.background);
  gradient.addColorStop(1, "#20213a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(130, 230, 194, 0.08)";
  ctx.beginPath();
  ctx.arc(930, 120, 250, 0, Math.PI * 2);
  ctx.fill();

  roundedRect(ctx, 66, 68, 948, 1214, 34);
  ctx.fillStyle = PALETTE.card;
  ctx.fill();
  ctx.strokeStyle = "rgba(205, 221, 242, 0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.mint;
  ctx.font = "800 25px Arial, sans-serif";
  ctx.fillText("GRIDPLAY  /  TIC TAC TOE", 120, 155);

  ctx.fillStyle = PALETTE.text;
  ctx.font = "700 58px Arial, sans-serif";
  ctx.fillText("HASIL PERTANDINGAN", 120, 265);

  ctx.fillStyle = winner === "draw" ? PALETTE.yellow : (winner === "O" ? PALETTE.coral : PALETTE.mint);
  ctx.font = "700 42px Arial, sans-serif";
  ctx.fillText(resultText, 120, 345, 840);

  ctx.fillStyle = PALETTE.muted;
  ctx.font = "500 25px Arial, sans-serif";
  ctx.fillText(modeText, 120, 405);
  if (difficultyText) ctx.fillText(`Kesulitan: ${difficultyText}`, 120, 445);

  const boardSize = 690;
  const boardX = (canvas.width - boardSize) / 2;
  const boardY = 505;
  const gap = 14;
  const cellSize = (boardSize - gap * 2) / 3;

  roundedRect(ctx, boardX - 15, boardY - 15, boardSize + 30, boardSize + 30, 28);
  ctx.fillStyle = "#101a2a";
  ctx.fill();

  for (let index = 0; index < 9; index += 1) {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const x = boardX + column * (cellSize + gap);
    const y = boardY + row * (cellSize + gap);
    roundedRect(ctx, x, y, cellSize, cellSize, 20);
    ctx.fillStyle = PALETTE.cell;
    ctx.fill();
    drawMark(ctx, board[index], x + cellSize / 2, y + cellSize / 2, cellSize);
  }

  ctx.fillStyle = PALETTE.muted;
  ctx.font = "500 21px Arial, sans-serif";
  ctx.textAlign = "center";
  const dateText = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());
  ctx.fillText(dateText, canvas.width / 2, 1210);
  ctx.fillStyle = PALETTE.mint;
  ctx.font = "700 22px Arial, sans-serif";
  ctx.fillText("MAIN LAGI DI GRIDPLAY", canvas.width / 2, 1250);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Gambar gagal dibuat.")), "image/png");
  });
  return {
    blob,
    dataUrl: canvas.toDataURL("image/png"),
    file: new File([blob], "gridplay-hasil-pertandingan.png", { type: "image/png" }),
  };
}
