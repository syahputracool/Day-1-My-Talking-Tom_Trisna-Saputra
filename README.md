# Gridplay — Tic Tac Toe

Website Tic Tac Toe berbasis HTML, CSS, dan JavaScript murni. Proyek ini tidak membutuhkan Node.js, database, API, atau proses build sehingga dapat langsung di-host melalui **GitHub Pages**.

## Fitur

- Dua mode: dua pemain lokal dan melawan bot.
- Tiga tingkat kesulitan bot:
  - **Mudah:** memilih kotak kosong secara acak.
  - **Menengah:** mengambil peluang menang langsung, memblokir kemenangan lawan, lalu memprioritaskan tengah dan sudut.
  - **Sulit:** menggunakan algoritma **Minimax**. Bot bermain optimal dan tidak dapat dikalahkan jika algoritmanya berjalan sebagaimana mestinya.
- Deteksi kemenangan, hasil seri, dan penanda tiga kotak pemenang.
- Statistik kemenangan dan kekalahan disimpan di `localStorage` browser.
- Panel hasil pertandingan dengan gambar papan yang dibuat melalui Canvas API.
- Berbagi gambar melalui Web Share API pada browser/perangkat yang mendukung; tersedia opsi unduh PNG sebagai fallback.
- Layout responsif untuk desktop dan perangkat mobile.

## Struktur proyek

```text
tic-tac-toe-github-pages/
├── index.html
├── styles.css
├── README.md
└── js/
    ├── main.js    # Pengendali UI, alur permainan, dan penyimpanan statistik
    ├── game.js    # State permainan, validasi langkah, dan deteksi kemenangan
    ├── ai.js      # Strategi bot mudah, menengah, dan sulit (Minimax)
    └── share.js   # Pembuatan gambar hasil pertandingan menggunakan Canvas
```

## Menjalankan di komputer lokal

Karena proyek menggunakan JavaScript ES Modules, jalankan melalui server lokal (jangan membuka `index.html` langsung dengan skema `file://`).

**Dengan Python:**

```bash
python -m http.server 8000
```

Buka `http://localhost:8000` di browser.

## Push ke GitHub

Buka terminal di folder proyek, lalu jalankan:

```bash
git init
git add .
git commit -m "Initial commit: Gridplay Tic Tac Toe"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Ganti `USERNAME` dan `NAMA-REPOSITORY` sesuai akun serta repository GitHub kamu. Jika repository sudah memiliki remote, tidak perlu menjalankan `git remote add origin` lagi.

## Mengaktifkan GitHub Pages

1. Buka repository di GitHub.
2. Masuk ke **Settings → Pages**.
3. Pada bagian **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
5. Setelah deployment selesai, alamat website akan tersedia pada bagian GitHub Pages di halaman tersebut.

Pastikan `index.html`, `styles.css`, dan folder `js/` berada di root repository seperti struktur di atas.

## Catatan teknis

- Seluruh logika permainan berjalan di browser. Tidak ada server back-end terpisah karena kebutuhan Tic Tac Toe ini tidak memerlukan komunikasi server atau database.
- Modul `game.js` dan `ai.js` memisahkan logika inti permainan dari antarmuka. Pemisahan ini menjaga kode lebih mudah diuji dan dikembangkan.
- Statistik tersimpan secara lokal pada browser/perangkat yang digunakan. Statistik tidak disinkronkan antarpengguna atau antarperangkat.
- Fitur berbagi langsung bergantung pada dukungan Web Share API browser. Pada browser yang tidak mendukung berbagi file, tombol **Bagikan** akan mengunduh gambar PNG sebagai alternatif.
- Font DM Sans dan Space Grotesk dimuat dari Google Fonts. Jika layanan font tidak tersedia, browser menggunakan font sans-serif sistem.
