const EVENT = {
  name: "Syukuran Idol dan FAM 100",
  organizer: "Fremantle Indonesia",
  subtitle: "Voucher UMKM • Scan QR Booth",
  logos: {
    fremantle: "assets/logos/logo-fm.svg",
    idol: "assets/logos/logo-idol.png",
    fam: "assets/logos/logo-fam.png",
  },
};

const STORAGE_KEYS = {
  USERS: "syukuran_idol_fam_users_v2",
  CARTS: "syukuran_idol_fam_carts_v2",
  CLAIMS: "syukuran_idol_fam_claims_v2",
  SESSION: "syukuran_idol_fam_session_v2",
};

const app = document.getElementById("app");

const state = {
  currentUser: null,
  scanner: null,
  scanning: false,
};

const DEFAULT_CARTS = [
  { id: "G01", name: "Booth 01", menu: "Bakso Spesial" },
  { id: "G02", name: "Booth 02", menu: "Sate Ayam" },
  { id: "G03", name: "Booth 03", menu: "Nasi Goreng" },
  { id: "G04", name: "Booth 04", menu: "Mie Ayam" },
  { id: "G05", name: "Booth 05", menu: "Dimsum / Siomay" },
  { id: "G06", name: "Booth 06", menu: "Es Teh / Es Jeruk" },
  { id: "G07", name: "Booth 07", menu: "Dessert" },
  { id: "G08", name: "Booth 08", menu: "Kopi Susu" },
];

function generatePassword(index) {
  return `FM-${3000 + index * 17}`;
}

function seedData() {
  const usersExist = localStorage.getItem(STORAGE_KEYS.USERS);
  const cartsExist = localStorage.getItem(STORAGE_KEYS.CARTS);
  const claimsExist = localStorage.getItem(STORAGE_KEYS.CLAIMS);

  if (!usersExist) {
    const users = [
      {
        id: "ADMIN",
        name: "Admin Panitia",
        username: "admin",
        password: "admin123",
        role: "admin",
      },
    ];

    for (let i = 1; i <= 66; i++) {
      const number = String(i).padStart(2, "0");
      const participantId = `P${String(i).padStart(3, "0")}`;

      users.push({
        id: participantId,
        name: `Peserta ${number}`,
        username: `peserta${number}`,
        password: generatePassword(i),
        role: "participant",
      });
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  if (!cartsExist) {
    localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(DEFAULT_CARTS));
  }

  if (!claimsExist) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
}

function getCarts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CARTS) || "[]");
}

function getClaims() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || "[]");
}

function saveClaims(claims) {
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
}

function saveSession(user) {
  localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({ userId: user.id })
  );
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

function restoreSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    const user = getUsers().find((item) => item.id === session.userId);
    return user || null;
  } catch {
    return null;
  }
}

function logoStrip() {
  return `
    <div class="program-logos">
      <img class="program-logo idol" src="${EVENT.logos.idol}" alt="Indonesian Idol" />
      <img class="program-logo fam" src="${EVENT.logos.fam}" alt="New Family 100" />
    </div>
  `;
}

function stopScannerIfNeeded() {
  if (state.scanner && state.scanning) {
    state.scanner.stop().catch(() => {});
    state.scanning = false;
  }
}

function render() {
  stopScannerIfNeeded();

  if (!state.currentUser) {
    renderLogin();
    return;
  }

  if (state.currentUser.role === "admin") {
    renderAdmin();
    return;
  }

  renderParticipant();
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-wrap">
      <section class="card login-card">
        <div class="login-panel">
          <img class="fm-mark" src="${EVENT.logos.fremantle}" alt="Fremantle" />

          <div style="margin-top: 34px;">
            <div class="event-pill">Voucher Access</div>
            <h1>${EVENT.name}</h1>
            <p>
              Login menggunakan username dan password yang tertulis di voucher.
              Setelah masuk, peserta bisa membuka kamera dan scan QR di booth makanan.
            </p>
          </div>

          <form class="form" id="loginForm">
            <div class="field">
              <label for="username">Username Voucher</label>
              <input id="username" autocomplete="username" placeholder="contoh: peserta01" required />
            </div>

            <div class="field">
              <label for="password">Password Voucher</label>
              <input id="password" type="password" autocomplete="current-password" placeholder="contoh: FM-3017" required />
            </div>

            <button class="btn btn-primary" type="submit">Masuk ke Acara</button>
          </form>

          <div class="notice warning">
            Demo peserta: <b>peserta01</b> / <b>FM-3017</b><br/>
            Demo admin: <b>admin</b> / <b>admin123</b>
          </div>

          <div id="loginMessage"></div>
        </div>

        <div class="login-art">
          <div class="login-art-inner">
            ${logoStrip()}
            <div class="notice success" style="max-width: 420px;">
              <b>Sistem voucher digital.</b><br/>
              1 peserta hanya bisa mengambil 1 kali di setiap booth makanan.
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const user = getUsers().find(
      (item) => item.username === username && item.password === password
    );

    if (!user) {
      document.getElementById("loginMessage").innerHTML = `
        <div class="notice danger">
          Username atau password salah. Cek lagi voucher peserta.
        </div>
      `;
      return;
    }

    state.currentUser = user;
    saveSession(user);
    render();
  });
}

function renderTopbar() {
  return `
    <header class="topbar no-print">
      <div class="brand">
        <img class="fm-mark" src="${EVENT.logos.fremantle}" alt="Fremantle" />
        <div class="brand-copy">
          <div class="brand-title">${EVENT.name}</div>
          <div class="brand-subtitle">${EVENT.organizer} · ${EVENT.subtitle}</div>
        </div>
      </div>

      <div class="user-pill">
        <div>
          <strong>${state.currentUser.name}</strong>
          <small>${state.currentUser.username} · ${state.currentUser.role}</small>
        </div>
        <button class="btn btn-outline" id="logoutBtn">Keluar</button>
      </div>
    </header>
  `;
}

function attachLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    stopScannerIfNeeded();
    state.currentUser = null;
    clearSession();
    render();
  });
}

function renderParticipant() {
  const carts = getCarts();
  const claims = getClaims();

  const userClaims = claims.filter(
    (claim) => claim.participantId === state.currentUser.id
  );

  const claimedCount = userClaims.length;
  const remainingCount = carts.length - claimedCount;

  const menuHtml = carts
    .map((cart) => {
      const claim = userClaims.find((item) => item.cartId === cart.id);

      const status = claim
        ? `<span class="status done">Sudah diambil</span>`
        : `<span class="status pending">Belum diambil</span>`;

      return `
        <div class="menu-item">
          <div>
            <div class="menu-title">${cart.menu}</div>
            <div class="menu-meta">${cart.id} · ${cart.name}</div>
          </div>
          ${status}
        </div>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}

      <section class="card hero-card no-print">
        <div class="hero-content">
          <div>
            <div class="event-pill">Peserta Voucher</div>
            <h1>
              Scan QR booth dan ambil menu <span class="gold-text">syukuran</span>.
            </h1>
            <p>
              Halo <b>${state.currentUser.name}</b>. Setiap peserta hanya bisa mengambil
              <b>1 kali di setiap booth</b>. Jika kamu scan QR booth yang sama lagi,
              sistem akan menolak otomatis.
            </p>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${carts.length}</div>
                <div class="stat-label">Total Booth</div>
              </div>

              <div class="stat">
                <div class="stat-value">${claimedCount}</div>
                <div class="stat-label">Sudah Diambil</div>
              </div>

              <div class="stat">
                <div class="stat-value">${remainingCount}</div>
                <div class="stat-label">Belum Diambil</div>
              </div>

              <div class="stat">
                <div class="stat-value">${state.currentUser.id}</div>
                <div class="stat-label">ID Peserta</div>
              </div>
            </div>
          </div>

          <div class="hero-logos">
            ${logoStrip()}
          </div>
        </div>
      </section>

      <div class="grid grid-2 no-print" style="margin-top: 18px;">
        <section class="card">
          <h2>Scan QR Booth</h2>
          <p>
            Tekan tombol <b>Buka Kamera</b>, lalu arahkan kamera ke QR yang ditempel
            di booth makanan.
          </p>

          <div class="scanner-box">
            <div id="qr-reader">
              <div style="padding: 24px; text-align:center;">
                Kamera belum aktif.
              </div>
            </div>
          </div>

          <div class="btn-row" style="margin-top: 14px;">
            <button class="btn btn-primary" id="startScanBtn">Buka Kamera</button>
            <button class="btn btn-outline" id="stopScanBtn">Tutup Kamera</button>
          </div>

          <div class="manual-box">
            <div class="field">
              <label for="manualQr">Input manual untuk simulasi</label>
              <input id="manualQr" placeholder="contoh: SYUKURAN_CART:G01" />
            </div>
            <button class="btn btn-gold" id="manualSubmitBtn">Validasi Manual</button>
          </div>

          <div id="scanMessage"></div>
        </section>

        <section class="card">
          <h2>Status Menu Kamu</h2>
          <p>
            Daftar ini akan berubah setelah kamu berhasil scan QR booth.
          </p>

          <div class="menu-list">
            ${menuHtml}
          </div>
        </section>
      </div>
    </div>
  `;

  attachLogout();

  document.getElementById("startScanBtn").addEventListener("click", startScanner);
  document.getElementById("stopScanBtn").addEventListener("click", stopScannerIfNeeded);

  document.getElementById("manualSubmitBtn").addEventListener("click", () => {
    const value = document.getElementById("manualQr").value.trim();
    handleQrResult(value);
  });
}

function setScanMessage(type, title, text) {
  const el = document.getElementById("scanMessage");
  if (!el) return;

  el.innerHTML = `
    <div class="notice ${type}">
      <b>${title}</b><br/>
      ${text}
    </div>
  `;
}

async function startScanner() {
  const reader = document.getElementById("qr-reader");

  if (!window.Html5Qrcode) {
    setScanMessage(
      "danger",
      "Scanner belum siap.",
      "Pastikan koneksi internet aktif karena scanner memakai library online."
    );
    return;
  }

  if (state.scanning) return;

  reader.innerHTML = "";

  try {
    state.scanner = new Html5Qrcode("qr-reader");

    await state.scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
      },
      (decodedText) => {
        handleQrResult(decodedText);
      },
      () => {}
    );

    state.scanning = true;

    setScanMessage(
      "success",
      "Kamera aktif.",
      "Arahkan kamera ke QR yang ditempel di booth makanan."
    );
  } catch (error) {
    setScanMessage(
      "danger",
      "Kamera gagal dibuka.",
      "Pastikan halaman dibuka lewat HTTPS atau localhost, dan izinkan akses kamera."
    );
  }
}

function normalizeCartCode(rawValue) {
  if (!rawValue) return "";

  const value = rawValue.trim();

  const acceptedPrefixes = ["SYUKURAN_CART:", "FREMANTLE_CART:", "UMKM_CART:"];

  for (const prefix of acceptedPrefixes) {
    if (value.toUpperCase().startsWith(prefix)) {
      return value.split(":")[1].trim().toUpperCase();
    }
  }

  try {
    const url = new URL(value);
    const params = ["cart", "gerobak", "booth", "cart_id"];

    for (const key of params) {
      const paramValue = url.searchParams.get(key);
      if (paramValue) return paramValue.trim().toUpperCase();
    }
  } catch {
    // Bukan URL. Lanjut cek sebagai kode biasa.
  }

  return value.toUpperCase();
}

function handleQrResult(decodedText) {
  const cartId = normalizeCartCode(decodedText);
  const carts = getCarts();
  const cart = carts.find((item) => item.id === cartId);

  if (!cart) {
    setScanMessage(
      "danger",
      "QR tidak valid.",
      `Kode yang terbaca: <span class="code">${decodedText || "-"}</span>`
    );
    return;
  }

  stopScannerIfNeeded();

  const claims = getClaims();

  const alreadyClaimed = claims.find(
    (claim) =>
      claim.participantId === state.currentUser.id && claim.cartId === cart.id
  );

  if (alreadyClaimed) {
    setScanMessage(
      "warning",
      "Kamu sudah mengambil menu ini.",
      `Menu <b>${cart.menu}</b> dari <b>${cart.name}</b> sudah pernah kamu ambil.`
    );
    return;
  }

  const newClaim = {
    id: `CLAIM-${Date.now()}`,
    participantId: state.currentUser.id,
    participantName: state.currentUser.name,
    cartId: cart.id,
    cartName: cart.name,
    menu: cart.menu,
    claimedAt: new Date().toISOString(),
  };

  claims.push(newClaim);
  saveClaims(claims);

  renderParticipant();

  setScanMessage(
    "success",
    "Berhasil!",
    `Silakan ambil <b>${cart.menu}</b> di <b>${cart.name}</b>.`
  );
}

function renderAdmin() {
  const users = getUsers();
  const participants = users.filter((user) => user.role === "participant");
  const carts = getCarts();
  const claims = getClaims();

  const totalPossibleClaims = participants.length * carts.length;
  const totalClaims = claims.length;

  const cartStatsHtml = carts
    .map((cart) => {
      const count = claims.filter((claim) => claim.cartId === cart.id).length;
      const remaining = participants.length - count;

      return `
        <tr>
          <td><b>${cart.id}</b></td>
          <td>${cart.name}</td>
          <td>${cart.menu}</td>
          <td>${count}</td>
          <td>${remaining}</td>
        </tr>
      `;
    })
    .join("");

  const voucherRows = participants
    .map((user) => {
      return `
        <tr>
          <td><b>${user.id}</b></td>
          <td>${user.name}</td>
          <td><span class="code">${user.username}</span></td>
          <td><span class="code">${user.password}</span></td>
        </tr>
      `;
    })
    .join("");

  const voucherCards = participants
    .map((user) => {
      return `
        <div class="voucher-card">
          <div class="event-pill" style="margin-bottom: 12px;">Voucher</div>
          <strong>${EVENT.name}</strong>
          <p style="margin: 8px 0 0;">${user.name} · ${user.id}</p>

          <div class="voucher-label">Username</div>
          <div class="code">${user.username}</div>

          <div class="voucher-label">Password</div>
          <div class="code">${user.password}</div>
        </div>
      `;
    })
    .join("");

  const claimRows =
    claims.length === 0
      ? `
        <tr>
          <td colspan="5">Belum ada pengambilan makanan.</td>
        </tr>
      `
      : claims
          .slice()
          .reverse()
          .map((claim) => {
            const time = new Date(claim.claimedAt).toLocaleString("id-ID");

            return `
              <tr>
                <td>${time}</td>
                <td>${claim.participantName}</td>
                <td>${claim.participantId}</td>
                <td>${claim.cartName}</td>
                <td>${claim.menu}</td>
              </tr>
            `;
          })
          .join("");

  const qrCards = carts
    .map((cart) => {
      return `
        <div class="qr-card">
          <div class="qr-holder" id="qr-${cart.id}"></div>
          <div class="qr-title">${cart.name}</div>
          <div class="qr-subtitle">${cart.id} · ${cart.menu}</div>
          <div class="code" style="margin-top: 10px;">SYUKURAN_CART:${cart.id}</div>
        </div>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}

      <section class="card hero-card no-print">
        <div class="hero-content">
          <div>
            <div class="event-pill">Dashboard Admin</div>
            <h1>
              Kelola voucher, QR booth, dan rekap <span class="blue-text">pengambilan</span>.
            </h1>
            <p>
              Dashboard ini dipakai panitia untuk mencetak QR booth,
              melihat username/password voucher peserta, dan memantau rekap makanan.
            </p>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${participants.length}</div>
                <div class="stat-label">Peserta</div>
              </div>

              <div class="stat">
                <div class="stat-value">${carts.length}</div>
                <div class="stat-label">Booth</div>
              </div>

              <div class="stat">
                <div class="stat-value">${totalClaims}</div>
                <div class="stat-label">Sudah Diambil</div>
              </div>

              <div class="stat">
                <div class="stat-value">${totalPossibleClaims}</div>
                <div class="stat-label">Maksimal Scan</div>
              </div>
            </div>

            <div class="btn-row" style="margin-top: 20px;">
              <button class="btn btn-primary" id="printBtn">Print Halaman</button>
              <button class="btn btn-danger" id="resetClaimsBtn">Reset Pengambilan</button>
            </div>
          </div>

          <div class="hero-logos">
            ${logoStrip()}
          </div>
        </div>
      </section>

      <section class="card admin-section">
        <h2>Rekap Per Booth</h2>
        <p class="no-print">
          Jumlah peserta yang sudah mengambil menu di setiap booth.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Booth</th>
                <th>Menu</th>
                <th>Sudah Ambil</th>
                <th>Sisa</th>
              </tr>
            </thead>
            <tbody>
              ${cartStatsHtml}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card admin-section">
        <h2>QR Booth</h2>
        <p class="no-print">
          Print QR ini, lalu tempel di masing-masing booth makanan.
          Peserta login dahulu, lalu scan QR booth dari akun mereka.
        </p>

        <div class="qr-grid">
          ${qrCards}
        </div>
      </section>

      <section class="card admin-section">
        <h2>Voucher Peserta</h2>
        <p class="no-print">
          Berikan username dan password ini kepada peserta. Bisa dicetak sebagai voucher.
        </p>

        <div class="voucher-card-grid">
          ${voucherCards}
        </div>
      </section>

      <section class="card admin-section no-print">
        <h2>Data Voucher Peserta</h2>
        <p>
          Versi tabel untuk panitia.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID Peserta</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              ${voucherRows}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card admin-section no-print">
        <h2>Riwayat Pengambilan</h2>
        <p>
          Data scan yang sudah berhasil.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Peserta</th>
                <th>ID</th>
                <th>Booth</th>
                <th>Menu</th>
              </tr>
            </thead>
            <tbody>
              ${claimRows}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  attachLogout();

  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("resetClaimsBtn").addEventListener("click", () => {
    const confirmed = confirm(
      "Yakin ingin menghapus semua data pengambilan makanan?"
    );

    if (!confirmed) return;

    saveClaims([]);
    renderAdmin();
  });

  drawQrCodes();
}

function drawQrCodes() {
  const carts = getCarts();

  carts.forEach((cart) => {
    const holder = document.getElementById(`qr-${cart.id}`);
    if (!holder) return;

    holder.innerHTML = "";

    if (!window.QRCode) {
      holder.innerHTML = `
        <div class="notice warning">
          QR library belum termuat.
        </div>
      `;
      return;
    }

    new QRCode(holder, {
      text: `SYUKURAN_CART:${cart.id}`,
      width: 128,
      height: 128,
      correctLevel: QRCode.CorrectLevel.H,
    });
  });
}

function init() {
  seedData();
  state.currentUser = restoreSession();
  render();
}

init();