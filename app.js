import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
  remove,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvf9xYTO4jrH_KZ2vaVUWf_Rp4RzjKNAM",
  authDomain: "fremantle-syukuran-95973.firebaseapp.com",
  databaseURL:
    "https://fremantle-syukuran-95973-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fremantle-syukuran-95973",
  storageBucket: "fremantle-syukuran-95973.firebasestorage.app",
  messagingSenderId: "892900409139",
  appId: "1:892900409139:web:46e72f8fc25a80e6c28846",
  measurementId: "G-CL7BRQTQ1N",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

let secondaryApp = null;
let secondaryAuth = null;

const EMAIL_DOMAIN = "fremantle-syukuran.local";
const ADMIN_EMAIL = `admin@${EMAIL_DOMAIN}`;

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

const app = document.getElementById("app");

const state = {
  authUser: null,
  currentUser: null,
  users: {},
  carts: {},
  claims: {},
  scanner: null,
  scanning: false,
  participantTab: "home",
  adminTab: "dashboard",
  loading: true,
  setupMessage: "",
  unsubs: [],
};

const DEFAULT_CARTS = [
  { id: "G01", name: "Booth 01", menu: "Bakso" },
  { id: "G02", name: "Booth 02", menu: "Sate Ayam" },
  { id: "G03", name: "Booth 03", menu: "Gultik" },
  { id: "G04", name: "Booth 04", menu: "Crepes" },
  { id: "G05", name: "Booth 05", menu: "Es Podeng" },
  { id: "G06", name: "Booth 06", menu: "Es Teh" },
  { id: "G07", name: "Booth 07", menu: "Kopi Jago" },
  { id: "G08", name: "Booth 08", menu: "Telur Gulung" },
];

const PARTICIPANTS = [
  { name: "Sakti Parantean", username: "sakti" },
  { name: "Victor Ariesza", username: "victor" },
  { name: "Marisa Intan", username: "marisa" },
  { name: "Ricci Lestari", username: "ricci" },
  { name: "Arief Soeliscane Affandi", username: "arief" },
  { name: "Moch Ariandi", username: "ariandi" },
  { name: "Rino Azhari", username: "rino" },
  { name: "Rosalia Kusumowati", username: "rosalia" },
  { name: "Rivo Yudhistira", username: "rivo" },
  { name: "Hilda Curnilla Sari", username: "hilda" },
  { name: "Siti Marlinah", username: "siti" },
  { name: "Haris Marjuki", username: "haris" },
  { name: "Aditya Amarullah", username: "aditya" },
  { name: "Indah Uli Sidabutar", username: "indah" },
  { name: "Beben Hanoko", username: "beben" },
  { name: "Halida Chairunnisa", username: "halida" },
  { name: "Rehanita Wibisono", username: "rehanita" },
  { name: "Raka Purwana", username: "raka" },
  { name: "Felina Arni Dwi Kana", username: "felina" },
  { name: "Saras Choirunnisa", username: "saras" },
  { name: "Winda Fajriyatul Arifah", username: "winda" },
  { name: "Kezia Audi Sappetaw", username: "kezia" },
  { name: "Keisha Ananditya", username: "keisha" },
  { name: "Angie Ardhana Reswari", username: "angie" },
  { name: "Muhammad Yusuf Alfajri", username: "yusuf" },
  { name: "Morgano Arthur Harimu", username: "morgano" },
  { name: "Raihanah Naja Atthaya", username: "raihanah" },
  { name: "Intania Ayuning Sugandi", username: "intania" },
  { name: "Rasim Suhendar", username: "rasim" },
  { name: "Pak Agus", username: "agus" },
  { name: "Fauzi Kamali", username: "fauzi" },
  { name: "Ari Kurniawan Hideyuki", username: "ari" },
  { name: "Riska Nur Wulandani", username: "riska" },
  { name: "Moch. Rizky Setiawan", username: "rizky" },
  { name: "Chirstian Linggar Pratama", username: "chirstian" },
  { name: "Tiara Widianti Puteri", username: "tiara" },
  { name: "Aulia Okta Ramadhian", username: "aulia" },
  { name: "SYAFWAN HADY", username: "syafwan" },
  { name: "YUDITH ARI PRASETYO", username: "yudith" },
  { name: "RICKY FAJAR", username: "ricky" },
  { name: "IPTHY AKSARA GATI", username: "ipthy" },
  { name: "KURNIA DWI SAPUTRI", username: "kurnia" },
  { name: "NURCAHYA HANDAYANI", username: "nurcahya" },
  { name: "NOVI TRI WAHYUNI", username: "novi" },
  { name: "RIVALDY O PASARIBU", username: "rivaldy" },
  { name: "FATHIA AZZAHRA", username: "fathia" },
  { name: "ANGGA ADITYA", username: "angga" },
  { name: "DIMAS WIJANARKO", username: "dimas" },
  { name: "YOSEFFINA DHE ANCHITA", username: "yoseffina" },
  { name: "FIFI FIONITA", username: "fifi" },
  { name: "IRAWAN FIKA WIBISONO", username: "irawan" },
  { name: "SAJID BIMA NUR YASIN", username: "sajid" },
  { name: "ISNAN ZAKARIA", username: "isnan" },
  { name: "ENY NOER HALINNA", username: "eny" },
  { name: "GUNTUR SUPRIYANTO", username: "guntur" },
  { name: "M. REVAN HASIBUAN", username: "revan" },
  { name: "AFIFAH TARA", username: "afifah" },
  { name: "IVANKA DWI GUSTI ADINDA", username: "ivanka" },
  { name: "ERWIN JEFRY HOTTY", username: "erwin" },
  { name: "ESA APRIA CHANDRA", username: "esa" },
  { name: "RYAN RIZAL PRATAMA", username: "ryan" },
  { name: "ANJAR DWI KUNCORO", username: "anjar" },
  { name: "A JUANDA", username: "juanda" },
  { name: "AHMAD HASANUDIN", username: "ahmad" },
  { name: "ARDI ARHAM PRAMONO", username: "ardi" },
  { name: "EPRILIYANTO", username: "epriliyanto" },
];

function usernameToEmail(username) {
  return `${String(username).trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

function generatePassword(index) {
  return `FM-${3000 + index * 17}`;
}

function cartsArray() {
  return Object.values(state.carts || {}).sort((a, b) =>
    String(a.id).localeCompare(String(b.id))
  );
}

function usersArray() {
  return Object.entries(state.users || {})
    .map(([uid, value]) => ({ uid, ...value }))
    .sort((a, b) => String(a.participantCode || "").localeCompare(String(b.participantCode || "")));
}

function claimsArray() {
  const output = [];

  Object.entries(state.claims || {}).forEach(([uid, userClaims]) => {
    Object.values(userClaims || {}).forEach((claim) => {
      output.push({ uid, ...claim });
    });
  });

  return output.sort((a, b) => Number(b.claimedAt || 0) - Number(a.claimedAt || 0));
}

function participantClaimsArray(uid) {
  return Object.values((state.claims || {})[uid] || {}).sort(
    (a, b) => Number(b.claimedAt || 0) - Number(a.claimedAt || 0)
  );
}

function getSecondaryAuth() {
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "secondary");
    secondaryAuth = getAuth(secondaryApp);
  }

  return secondaryAuth;
}

function stopScannerIfNeeded() {
  if (state.scanner && state.scanning) {
    state.scanner.stop().catch(() => {});
    state.scanning = false;
  }
}

function detachRealtimeListeners() {
  state.unsubs.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch {}
  });

  state.unsubs = [];
}

function formatTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function logoStrip() {
  return `
    <div class="program-logos">
      <img class="program-logo idol" src="${EVENT.logos.idol}" alt="Indonesian Idol" />
      <img class="program-logo fam" src="${EVENT.logos.fam}" alt="New Family 100" />
    </div>
  `;
}

function renderLoading(text = "Memuat aplikasi...") {
  app.innerHTML = `
    <main class="login-wrap">
      <section class="card app-card" style="text-align:center; max-width:520px; width:100%;">
        <img class="fm-mark" src="${EVENT.logos.fremantle}" alt="Fremantle" style="margin:0 auto 22px;" />
        <div class="event-pill">Loading</div>
        <h1 class="app-title">${EVENT.name}</h1>
        <p>${text}</p>
      </section>
    </main>
  `;
}

function renderError(title, message) {
  app.innerHTML = `
    <main class="login-wrap">
      <section class="card app-card" style="max-width:560px; width:100%;">
        <div class="event-pill">Error</div>
        <h1 class="app-title">${title}</h1>
        <p>${message}</p>
        <div class="btn-row" style="margin-top:18px;">
          <button class="btn btn-outline" id="backToLoginBtn">Kembali</button>
        </div>
      </section>
    </main>
  `;

  document.getElementById("backToLoginBtn")?.addEventListener("click", async () => {
    await signOut(auth).catch(() => {});
    state.authUser = null;
    state.currentUser = null;
    renderLogin();
  });
}

function render() {
  stopScannerIfNeeded();

  if (state.loading) {
    renderLoading();
    return;
  }

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

async function ensureAdminProfile(user) {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }

  if (user.email !== ADMIN_EMAIL) {
    throw new Error("Akun belum terdaftar sebagai peserta acara.");
  }

  const adminProfile = {
    uid: user.uid,
    name: "Admin Panitia",
    username: "admin",
    email: ADMIN_EMAIL,
    role: "admin",
    participantCode: "ADMIN",
    createdAt: Date.now(),
  };

  await set(userRef, adminProfile);
  return adminProfile;
}

async function loadInitialData(profile) {
  const reads = [
    get(ref(db, "carts")),
    get(ref(db, "claims")),
  ];

  if (profile.role === "admin") {
    reads.push(get(ref(db, "users")));
  }

  const snapshots = await Promise.all(reads);

  state.carts = snapshots[0].val() || {};
  state.claims = snapshots[1].val() || {};

  if (profile.role === "admin") {
    state.users = snapshots[2].val() || {};
  } else {
    state.users = {
      [state.authUser.uid]: profile,
    };
  }
}

function subscribeRealtimeData(profile) {
  detachRealtimeListeners();

  state.unsubs.push(
    onValue(ref(db, "carts"), (snapshot) => {
      state.carts = snapshot.val() || {};
      if (state.currentUser) render();
    })
  );

  state.unsubs.push(
    onValue(ref(db, "claims"), (snapshot) => {
      state.claims = snapshot.val() || {};
      if (state.currentUser) render();
    })
  );

  if (profile.role === "admin") {
    state.unsubs.push(
      onValue(ref(db, "users"), (snapshot) => {
        state.users = snapshot.val() || {};
        if (state.currentUser?.role === "admin") render();
      })
    );
  }
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
              Masukkan username dan password sesuai voucher peserta.
            </p>
          </div>

          <form class="form" id="loginForm">
            <div class="field">
              <label for="username">Username</label>
              <input id="username" autocomplete="username" placeholder="Username voucher" required />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" autocomplete="current-password" placeholder="Password voucher" required />
            </div>

            <button class="btn btn-primary" type="submit" id="loginBtn">Masuk</button>
          </form>

          <div id="loginMessage"></div>
        </div>

        <div class="login-art">
          <div class="login-art-inner">
            ${logoStrip()}
            <div class="notice success" style="max-width: 420px;">
              <b>Voucher digital acara.</b><br/>
              Setiap peserta hanya bisa mengambil 1 kali di setiap booth makanan.
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const loginBtn = document.getElementById("loginBtn");
    const messageEl = document.getElementById("loginMessage");

    loginBtn.disabled = true;
    loginBtn.textContent = "Memproses...";

    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    } catch (error) {
      messageEl.innerHTML = `
        <div class="notice danger">
          Username atau password tidak sesuai.
        </div>
      `;

      loginBtn.disabled = false;
      loginBtn.textContent = "Masuk";
    }
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
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    stopScannerIfNeeded();
    closeResultPopup();
    detachRealtimeListeners();

    state.authUser = null;
    state.currentUser = null;
    state.users = {};
    state.carts = {};
    state.claims = {};

    await signOut(auth);
    renderLogin();
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

function getParticipantStats() {
  const carts = cartsArray();
  const userClaims = participantClaimsArray(state.authUser.uid);

  return {
    carts,
    userClaims,
    claimedCount: userClaims.length,
    remainingCount: carts.length - userClaims.length,
  };
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
    getParticipantStats();

  const progressPercent = carts.length
    ? Math.round((claimedCount / carts.length) * 100)
    : 0;

  const recentClaims = userClaims
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
              Belum ada menu yang diambil.
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
          <h1 class="app-title">Scan QR booth makanan.</h1>
          <p class="app-desc">
            Arahkan kamera ke QR yang tersedia di booth.
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
        <button class="btn btn-outline" id="stopScanBtn">Tutup Kamera</button>
      </div>

      <div id="scanMessage"></div>
    </section>
  `;
}

function renderParticipantStatus() {
  const { carts, userClaims, claimedCount, remainingCount } =
    getParticipantStats();

  const claimMap = {};
  userClaims.forEach((claim) => {
    claimMap[claim.cartId] = claim;
  });

  const menuHtml = carts
    .map((cart) => {
      const claim = claimMap[cart.id];

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
  document.getElementById("goScanBtn")?.addEventListener("click", () => {
    state.participantTab = "scan";
    renderParticipant();
  });

  document.getElementById("goStatusBtn")?.addEventListener("click", () => {
    state.participantTab = "status";
    renderParticipant();
  });

  document.getElementById("startScanBtn")?.addEventListener("click", startScanner);
  document.getElementById("stopScanBtn")?.addEventListener("click", stopScannerIfNeeded);
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
      "Silakan coba lagi atau hubungi panitia."
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
      "Arahkan kamera ke QR booth makanan."
    );
  } catch (error) {
    setScanMessage(
      "danger",
      "Kamera tidak dapat dibuka.",
      "Izinkan akses kamera untuk melanjutkan."
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
  } catch {}

  return value.toUpperCase();
}

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

  popup.querySelector("#resultPrimaryBtn")?.addEventListener("click", () => {
    closeResultPopup();

    if (typeof onPrimary === "function") {
      onPrimary();
    }
  });
}

async function handleQrResult(decodedText) {
  const cartId = normalizeCartCode(decodedText);
  const cart = state.carts[cartId];

  if (!cart) {
    stopScannerIfNeeded();

    setScanMessage(
      "danger",
      "QR tidak valid.",
      "QR ini tidak terdaftar sebagai booth makanan acara."
    );

    showResultPopup({
      type: "danger",
      title: "QR tidak valid",
      message: "QR ini tidak terdaftar sebagai booth makanan acara.",
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

  const claimRef = ref(db, `claims/${state.authUser.uid}/${cart.id}`);

  const claimData = {
    participantId: state.authUser.uid,
    participantCode: state.currentUser.participantCode,
    participantName: state.currentUser.name,
    username: state.currentUser.username,
    cartId: cart.id,
    cartName: cart.name,
    menu: cart.menu,
    claimedAt: Date.now(),
  };

  try {
    const result = await runTransaction(
      claimRef,
      (currentData) => {
        if (currentData !== null) return;
        return claimData;
      },
      {
        applyLocally: false,
      }
    );

    if (!result.committed) {
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
  } catch (error) {
    setScanMessage(
      "danger",
      "Gagal memproses scan.",
      "Silakan coba lagi atau hubungi panitia."
    );

    showResultPopup({
      type: "danger",
      title: "Gagal",
      message: "Scan belum berhasil diproses. Silakan coba lagi.",
      primaryText: "Oke",
    });
  }
}

function getAdminStats() {
  const participants = usersArray().filter((user) => user.role === "participant");
  const carts = cartsArray();
  const claims = claimsArray();

  return {
    participants,
    carts,
    claims,
    totalPossibleClaims: participants.length * carts.length,
    totalClaims: claims.length,
  };
}

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
        <button class="btn btn-primary" id="setupDbBtn">Setup Data</button>
        <button class="btn btn-danger" id="resetClaimsBtn">Reset Pengambilan</button>
      </div>

      <div id="setupMessage">
        ${
          state.setupMessage
            ? `<div class="notice warning">${state.setupMessage}</div>`
            : ""
        }
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
        ${
          cartStatsHtml ||
          `<div class="empty-state">Data booth belum tersedia. Klik <b>Setup Data</b>.</div>`
        }
      </div>
    </section>
  `;
}

function renderAdminQr() {
  const carts = cartsArray();

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
        ${qrCards || `<div class="empty-state">Data booth belum tersedia.</div>`}
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
          <p style="margin: 8px 0 0;">${user.name} · ${user.participantCode}</p>

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
        ${voucherCards || `<div class="empty-state">Data peserta belum tersedia.</div>`}
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
          .map((claim) => {
            return `
              <div class="history-row">
                <div>
                  <b>${claim.participantName}</b>
                  <small>${claim.participantCode} · ${claim.menu}</small>
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
  document.getElementById("printBtn")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("setupDbBtn")?.addEventListener("click", setupDatabase);

  document.getElementById("resetClaimsBtn")?.addEventListener("click", async () => {
    const confirmed = confirm(
      "Yakin ingin menghapus semua data pengambilan makanan?"
    );

    if (!confirmed) return;

    await remove(ref(db, "claims"));
    state.setupMessage = "Data pengambilan berhasil direset.";
    renderAdmin();
  });
}

async function setupDatabase() {
  const confirmed = confirm(
    "Setup data akan membuat/memperbarui akun peserta, booth, dan voucher. Lanjutkan?"
  );

  if (!confirmed) return;

  const setupBtn = document.getElementById("setupDbBtn");
  const setupMessage = document.getElementById("setupMessage");

  setupBtn.disabled = true;
  setupBtn.textContent = "Memproses...";

  try {
    const cartsObject = {};
    DEFAULT_CARTS.forEach((cart) => {
      cartsObject[cart.id] = cart;
    });

    await set(ref(db, "carts"), cartsObject);

    const currentAdmin = {
      uid: state.authUser.uid,
      name: "Admin Panitia",
      username: "admin",
      email: ADMIN_EMAIL,
      role: "admin",
      participantCode: "ADMIN",
      createdAt: Date.now(),
    };

    await set(ref(db, `users/${state.authUser.uid}`), currentAdmin);

    for (let i = 0; i < PARTICIPANTS.length; i++) {
      const participant = PARTICIPANTS[i];
      const number = String(i + 1).padStart(3, "0");
      const password = generatePassword(i + 1);
      const email = usernameToEmail(participant.username);

      setupMessage.innerHTML = `
        <div class="notice warning">
          Membuat peserta ${i + 1} dari ${PARTICIPANTS.length}: ${participant.name}
        </div>
      `;

      const uid = await createOrGetAuthUser(email, password);

      await set(ref(db, `users/${uid}`), {
        uid,
        participantCode: `P${number}`,
        name: participant.name,
        username: participant.username,
        email,
        password,
        role: "participant",
        createdAt: Date.now(),
      });
    }

    await set(ref(db, "meta/setup"), {
      completed: true,
      completedAt: Date.now(),
      completedBy: state.authUser.uid,
    });

    state.setupMessage = "Setup data selesai. Peserta, booth, dan voucher sudah aktif.";
    renderAdmin();
  } catch (error) {
    state.setupMessage = `Setup gagal: ${error.message}`;
    renderAdmin();
  }
}

async function createOrGetAuthUser(email, password) {
  const secondary = getSecondaryAuth();

  try {
    const credential = await createUserWithEmailAndPassword(
      secondary,
      email,
      password
    );

    const uid = credential.user.uid;
    await signOut(secondary).catch(() => {});
    return uid;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      const credential = await signInWithEmailAndPassword(
        secondary,
        email,
        password
      );

      const uid = credential.user.uid;
      await signOut(secondary).catch(() => {});
      return uid;
    }

    throw error;
  }
}

function drawQrCodes() {
  const carts = cartsArray();

  carts.forEach((cart) => {
    const holder = document.getElementById(`qr-${cart.id}`);
    if (!holder) return;

    holder.innerHTML = "";

    if (!window.QRCode) {
      holder.innerHTML = `
        <div class="notice warning">
          QR belum dapat dibuat.
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

onAuthStateChanged(auth, async (user) => {
  state.loading = true;
  detachRealtimeListeners();

  if (!user) {
    state.authUser = null;
    state.currentUser = null;
    state.users = {};
    state.carts = {};
    state.claims = {};
    state.loading = false;
    renderLogin();
    return;
  }

  renderLoading("Menghubungkan akun...");

  try {
    state.authUser = user;

    const profile = await ensureAdminProfile(user);

    state.currentUser = {
      uid: user.uid,
      ...profile,
    };

    await loadInitialData(profile);

    state.loading = false;
    subscribeRealtimeData(profile);
    render();
  } catch (error) {
    state.loading = false;
    state.authUser = null;
    state.currentUser = null;

    await signOut(auth).catch(() => {});

    renderError(
      "Akun belum aktif",
      error.message || "Silakan hubungi panitia untuk aktivasi akun."
    );
  }
});