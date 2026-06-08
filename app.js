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
  USERS: "syukuran_idol_fam_users_v3",
  CARTS: "syukuran_idol_fam_carts_v3",
  CLAIMS: "syukuran_idol_fam_claims_v3",
  SESSION: "syukuran_idol_fam_session_v3",
};

const app = document.getElementById("app");

const state = {
  currentUser: null,
  scanner: null,
  scanning: false,
  participantTab: "home",
  adminTab: "dashboard",
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

function formatTime(dateString) {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getParticipantStats(user) {
  const carts = getCarts();
  const claims = getClaims();
  const userClaims = claims.filter((claim) => claim.participantId === user.id);

  return {
    carts,
    claims,
    userClaims,
    claimedCount: userClaims.length,
    remainingCount: carts.length - userClaims.length,
  };
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
    closeResultPopup();
    state.currentUser = null;
    clearSession();
    render();
  });
}

function renderTabs(type) {
  const tabs =
    type === "participant"
      ? [
          { id: "home", label: "Beranda", icon: "⌂" },
          { id: "scan", label: "Scan", icon: "□" },
          { id: "status", label: "Menu", icon: "✓" },
        ]
      : [
          { id: "dashboard", label: "Rekap", icon: "⌂" },
          { id: "qr", label: "QR", icon: "□" },
          { id: "vouchers", label: "Voucher", icon: "◎" },
          { id: "history", label: "Riwayat", icon: "≡" },
        ];

  const activeTab =
    type === "participant" ? state.participantTab : state.adminTab;

  return `
    <nav class="app-tabs no-print" data-tab-type="${type}">
      ${tabs
        .map(
          (tab) => `
            <button class="app-tab ${activeTab === tab.id ? "active" : ""}" data-tab="${tab.id}">
              <span class="tab-icon">${tab.icon}</span>
              <span>${tab.label}</span>
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function attachTabs(type) {
  document.querySelectorAll(".app-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;

      closeResultPopup();

      if (type === "participant") {
        if (state.participantTab === "scan" && tab !== "scan") {
          stopScannerIfNeeded();
        }

        state.participantTab = tab;
        renderParticipant();
      } else {
        state.adminTab = tab;
        renderAdmin();
      }
    });
  });
}

function renderParticipant() {
  const content =
    state.participantTab === "scan"
      ? renderParticipantScan()
      : state.participantTab === "status"
        ? renderParticipantStatus()
        : renderParticipantHome();

  app.innerHTML = `
    <div class="app-shell app-mode">
      ${renderTopbar()}
      ${renderTabs("participant")}

      <main class="app-page">
        ${content}
      </main>
    </div>
  `;

  attachLogout();
  attachTabs("participant");
  attachParticipantActions();
}

function renderParticipantHome() {
  const { carts, userClaims, claimedCount, remainingCount } =
    getParticipantStats(state.currentUser);

  const progressPercent = Math.round((claimedCount / carts.length) * 100);

  const recentClaims = userClaims
    .slice()
    .reverse()
    .slice(0, 3)
    .map(
      (claim) => `
        <div class="mini-row">
          <div>
            <b>${claim.menu}</b>
            <small>${claim.cartName} · ${formatTime(claim.claimedAt)}</small>
          </div>
          <span class="status done">Done</span>
        </div>
      `
    )
    .join("");

  return `
    <section class="card app-card home-screen">
      <div class="mobile-hero-logos">
        ${logoStrip()}
      </div>

      <div class="event-pill">Peserta Voucher</div>

      <h1 class="app-title">
        Halo, <span class="gold-text">${state.currentUser.name}</span>
      </h1>

      <p class="app-desc">
        Gunakan menu bawah untuk scan QR booth dan cek status menu kamu.
      </p>

      <div class="progress-card">
        <div class="progress-top">
          <div>
            <strong>${claimedCount} dari ${carts.length} menu</strong>
            <small>Sudah kamu ambil</small>
          </div>
          <b>${progressPercent}%</b>
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="quick-action primary" id="goScanBtn">
          <span>Scan QR</span>
          <b>Buka Kamera</b>
        </button>

        <button class="quick-action" id="goStatusBtn">
          <span>Status Menu</span>
          <b>${remainingCount} belum diambil</b>
        </button>
      </div>
    </section>

    <section class="card app-card compact-card">
      <div class="section-heading">
        <div>
          <h2>Aktivitas Terakhir</h2>
          <p>Menu yang baru kamu ambil.</p>
        </div>
      </div>

      <div class="mini-list">
        ${
          recentClaims ||
          `
            <div class="empty-state">
              Belum ada menu yang diambil. Tekan <b>Scan QR</b> untuk mulai.
            </div>
          `
        }
      </div>
    </section>
  `;
}

function renderParticipantScan() {
  return `
    <section class="card app-card scan-screen">
      <div class="screen-head">
        <div>
          <div class="event-pill">Scan Booth</div>
          <h1 class="app-title">Arahkan kamera ke QR booth.</h1>
          <p class="app-desc">
            Setelah QR terbaca, sistem langsung validasi voucher kamu.
          </p>
        </div>
      </div>

      <div class="scanner-box app-scanner">
        <div id="qr-reader">
          <div class="scanner-placeholder">
            Kamera belum aktif.
          </div>
        </div>
      </div>

      <div class="btn-row scan-actions">
        <button class="btn btn-primary" id="startScanBtn">Buka Kamera</button>
        <button class="btn btn-outline" id="stopScanBtn">Tutup</button>
      </div>

      <div id="scanMessage"></div>

      <details class="manual-details">
        <summary>Input manual untuk simulasi</summary>

        <div class="manual-box">
          <div class="field">
            <label for="manualQr">Kode QR</label>
            <input id="manualQr" placeholder="contoh: SYUKURAN_CART:G01" />
          </div>
          <button class="btn btn-gold" id="manualSubmitBtn">Validasi Manual</button>
        </div>
      </details>
    </section>
  `;
}

function renderParticipantStatus() {
  const { carts, userClaims, claimedCount, remainingCount } =
    getParticipantStats(state.currentUser);

  const menuHtml = carts
    .map((cart) => {
      const claim = userClaims.find((item) => item.cartId === cart.id);

      const status = claim
        ? `<span class="status done">Sudah</span>`
        : `<span class="status pending">Belum</span>`;

      const meta = claim
        ? `${cart.id} · ${cart.name} · ${formatTime(claim.claimedAt)}`
        : `${cart.id} · ${cart.name}`;

      return `
        <div class="menu-item app-menu-item">
          <div>
            <div class="menu-title">${cart.menu}</div>
            <div class="menu-meta">${meta}</div>
          </div>
          ${status}
        </div>
      `;
    })
    .join("");

  return `
    <section class="card app-card">
      <div class="screen-head">
        <div>
          <div class="event-pill">Status Menu</div>
          <h1 class="app-title">Menu kamu</h1>
          <p class="app-desc">
            ${claimedCount} sudah diambil, ${remainingCount} belum diambil.
          </p>
        </div>
      </div>

      <div class="menu-list app-list">
        ${menuHtml}
      </div>
    </section>
  `;
}

function attachParticipantActions() {
  const goScanBtn = document.getElementById("goScanBtn");
  const goStatusBtn = document.getElementById("goStatusBtn");

  if (goScanBtn) {
    goScanBtn.addEventListener("click", () => {
      state.participantTab = "scan";
      renderParticipant();
    });
  }

  if (goStatusBtn) {
    goStatusBtn.addEventListener("click", () => {
      state.participantTab = "status";
      renderParticipant();
    });
  }

  const startScanBtn = document.getElementById("startScanBtn");
  const stopScanBtn = document.getElementById("stopScanBtn");
  const manualSubmitBtn = document.getElementById("manualSubmitBtn");

  if (startScanBtn) {
    startScanBtn.addEventListener("click", startScanner);
  }

  if (stopScanBtn) {
    stopScanBtn.addEventListener("click", stopScannerIfNeeded);
  }

  if (manualSubmitBtn) {
    manualSubmitBtn.addEventListener("click", () => {
      const value = document.getElementById("manualQr").value.trim();
      handleQrResult(value);
    });
  }
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
    // Bukan URL.
  }

  return value.toUpperCase();
}

/* =========================
   POPUP HASIL SCAN
   ========================= */

function closeResultPopup() {
  const existing = document.querySelector(".result-popup-backdrop");
  if (existing) existing.remove();
}

function showResultPopup({
  type,
  title,
  message,
  menu,
  booth,
  primaryText,
  secondaryText,
  onPrimary,
}) {
  closeResultPopup();

  const iconMap = {
    success: "✓",
    warning: "!",
    danger: "×",
  };

  const labelMap = {
    success: "Voucher Valid",
    warning: "Sudah Digunakan",
    danger: "Tidak Valid",
  };

  const buttonClassMap = {
    success: "btn-primary",
    warning: "btn-gold",
    danger: "btn-danger",
  };

  const popup = document.createElement("div");
  popup.className = `result-popup-backdrop ${type}`;

  popup.innerHTML = `
    <div class="result-popup">
      <button class="result-close" type="button" aria-label="Tutup">×</button>

      <div class="result-icon ${type}">
        ${iconMap[type] || "!"}
      </div>

      <div class="result-label">
        ${labelMap[type] || "Status Scan"}
      </div>

      <h2>${title}</h2>

      <p>${message}</p>

      ${
        menu || booth
          ? `
            <div class="result-detail">
              ${
                menu
                  ? `
                    <div>
                      <span>Menu</span>
                      <strong>${menu}</strong>
                    </div>
                  `
                  : ""
              }

              ${
                booth
                  ? `
                    <div>
                      <span>Booth</span>
                      <strong>${booth}</strong>
                    </div>
                  `
                  : ""
              }
            </div>
          `
          : ""
      }

      <div class="result-actions">
        <button class="btn ${buttonClassMap[type] || "btn-primary"}" id="resultPrimaryBtn">
          ${primaryText || "Oke"}
        </button>

        ${
          secondaryText
            ? `
              <button class="btn btn-outline" id="resultSecondaryBtn">
                ${secondaryText}
              </button>
            `
            : ""
        }
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  if (navigator.vibrate) {
    if (type === "success") navigator.vibrate([90]);
    if (type === "warning") navigator.vibrate([80, 60, 80]);
    if (type === "danger") navigator.vibrate([120, 80, 120]);
  }

  const closeButtons = [
    popup.querySelector(".result-close"),
    popup.querySelector("#resultSecondaryBtn"),
  ];

  closeButtons.forEach((button) => {
    if (!button) return;
    button.addEventListener("click", closeResultPopup);
  });

  popup.addEventListener("click", (event) => {
    if (event.target === popup) closeResultPopup();
  });

  const primaryBtn = popup.querySelector("#resultPrimaryBtn");

  if (primaryBtn) {
    primaryBtn.addEventListener("click", () => {
      closeResultPopup();

      if (typeof onPrimary === "function") {
        onPrimary();
      }
    });
  }
}

function handleQrResult(decodedText) {
  const cartId = normalizeCartCode(decodedText);
  const carts = getCarts();
  const cart = carts.find((item) => item.id === cartId);

  if (!cart) {
    stopScannerIfNeeded();

    setScanMessage(
      "danger",
      "QR tidak valid.",
      `Kode yang terbaca: <span class="code">${decodedText || "-"}</span>`
    );

    showResultPopup({
      type: "danger",
      title: "QR tidak valid",
      message: "QR yang discan tidak terdaftar sebagai booth makanan acara ini.",
      menu: decodedText || "-",
      booth: "Tidak ditemukan",
      primaryText: "Scan Ulang",
      secondaryText: "Tutup",
      onPrimary: () => {
        state.participantTab = "scan";
        renderParticipant();
      },
    });

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

    showResultPopup({
      type: "warning",
      title: "Sudah pernah diambil",
      message:
        "Voucher kamu untuk booth ini sudah digunakan sebelumnya. Silakan pilih booth lain.",
      menu: cart.menu,
      booth: cart.name,
      primaryText: "Scan Booth Lain",
      secondaryText: "Tutup",
      onPrimary: () => {
        state.participantTab = "scan";
        renderParticipant();
      },
    });

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

  state.participantTab = "scan";
  renderParticipant();

  setScanMessage(
    "success",
    "Berhasil!",
    `Silakan ambil <b>${cart.menu}</b> di <b>${cart.name}</b>.`
  );

  showResultPopup({
    type: "success",
    title: "Berhasil!",
    message: "Voucher kamu valid. Silakan ambil menu di booth ini.",
    menu: cart.menu,
    booth: cart.name,
    primaryText: "Lihat Status Menu",
    secondaryText: "Tutup",
    onPrimary: () => {
      state.participantTab = "status";
      renderParticipant();
    },
  });
}

/* =========================
   ADMIN
   ========================= */

function renderAdmin() {
  const content =
    state.adminTab === "qr"
      ? renderAdminQr()
      : state.adminTab === "vouchers"
        ? renderAdminVouchers()
        : state.adminTab === "history"
          ? renderAdminHistory()
          : renderAdminDashboard();

  app.innerHTML = `
    <div class="app-shell app-mode">
      ${renderTopbar()}
      ${renderTabs("admin")}

      <main class="app-page">
        ${content}
      </main>
    </div>
  `;

  attachLogout();
  attachTabs("admin");
  attachAdminActions();

  if (state.adminTab === "qr") {
    drawQrCodes();
  }
}

function getAdminStats() {
  const users = getUsers();
  const participants = users.filter((user) => user.role === "participant");
  const carts = getCarts();
  const claims = getClaims();

  return {
    participants,
    carts,
    claims,
    totalPossibleClaims: participants.length * carts.length,
    totalClaims: claims.length,
  };
}

function renderAdminDashboard() {
  const { participants, carts, claims, totalPossibleClaims, totalClaims } =
    getAdminStats();

  const cartStatsHtml = carts
    .map((cart) => {
      const count = claims.filter((claim) => claim.cartId === cart.id).length;
      const remaining = participants.length - count;

      return `
        <div class="admin-stat-row">
          <div>
            <b>${cart.menu}</b>
            <small>${cart.id} · ${cart.name}</small>
          </div>
          <div class="admin-numbers">
            <span>${count}</span>
            <small>sisa ${remaining}</small>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <section class="card app-card home-screen">
      <div class="mobile-hero-logos">
        ${logoStrip()}
      </div>

      <div class="event-pill">Dashboard Admin</div>

      <h1 class="app-title">
        Rekap <span class="blue-text">pengambilan</span>
      </h1>

      <p class="app-desc">
        Pantau jumlah voucher yang sudah dipakai di setiap booth makanan.
      </p>

      <div class="stats app-stats">
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
          <div class="stat-label">Terpakai</div>
        </div>

        <div class="stat">
          <div class="stat-value">${totalPossibleClaims}</div>
          <div class="stat-label">Maksimal</div>
        </div>
      </div>

      <div class="btn-row" style="margin-top: 18px;">
        <button class="btn btn-danger" id="resetClaimsBtn">Reset Pengambilan</button>
      </div>
    </section>

    <section class="card app-card compact-card">
      <div class="section-heading">
        <div>
          <h2>Per Booth</h2>
          <p>Jumlah menu yang sudah diambil.</p>
        </div>
      </div>

      <div class="mini-list">
        ${cartStatsHtml}
      </div>
    </section>
  `;
}

function renderAdminQr() {
  const carts = getCarts();

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

  return `
    <section class="card app-card">
      <div class="screen-head">
        <div>
          <div class="event-pill">QR Booth</div>
          <h1 class="app-title">Print QR booth</h1>
          <p class="app-desc">
            Tempel QR ini di masing-masing booth makanan.
          </p>
        </div>

        <button class="btn btn-primary no-print" id="printBtn">Print</button>
      </div>

      <div class="qr-grid app-qr-grid">
        ${qrCards}
      </div>
    </section>
  `;
}

function renderAdminVouchers() {
  const { participants } = getAdminStats();

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

  return `
    <section class="card app-card">
      <div class="screen-head">
        <div>
          <div class="event-pill">Voucher Peserta</div>
          <h1 class="app-title">Cetak voucher</h1>
          <p class="app-desc">
            Bagikan username dan password ini ke peserta.
          </p>
        </div>

        <button class="btn btn-primary no-print" id="printBtn">Print</button>
      </div>

      <div class="voucher-card-grid app-voucher-grid">
        ${voucherCards}
      </div>
    </section>
  `;
}

function renderAdminHistory() {
  const { claims } = getAdminStats();

  const claimRows =
    claims.length === 0
      ? `
        <div class="empty-state">
          Belum ada pengambilan makanan.
        </div>
      `
      : claims
          .slice()
          .reverse()
          .map((claim) => {
            return `
              <div class="history-row">
                <div>
                  <b>${claim.participantName}</b>
                  <small>${claim.participantId} · ${claim.menu}</small>
                </div>
                <div>
                  <span>${claim.cartName}</span>
                  <small>${formatTime(claim.claimedAt)}</small>
                </div>
              </div>
            `;
          })
          .join("");

  return `
    <section class="card app-card">
      <div class="screen-head">
        <div>
          <div class="event-pill">Riwayat</div>
          <h1 class="app-title">Scan berhasil</h1>
          <p class="app-desc">
            Data peserta yang sudah mengambil makanan.
          </p>
        </div>
      </div>

      <div class="history-list">
        ${claimRows}
      </div>
    </section>
  `;
}

function attachAdminActions() {
  const printBtn = document.getElementById("printBtn");
  const resetClaimsBtn = document.getElementById("resetClaimsBtn");

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (resetClaimsBtn) {
    resetClaimsBtn.addEventListener("click", () => {
      const confirmed = confirm(
        "Yakin ingin menghapus semua data pengambilan makanan?"
      );

      if (!confirmed) return;

      saveClaims([]);
      renderAdmin();
    });
  }
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