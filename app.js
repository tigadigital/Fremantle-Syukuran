console.info("Syukuran Voucher App v5.6 loaded - participant scan audio feedback");

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
  apiKey: "AIzaSyBvf9xYTO4jrH_KZ2vaVUWF_Rp4RzjKNAM",
  authDomain: "fremantle-syukuran-95973.firebaseapp.com",
  projectId: "fremantle-syukuran-95973",
  storageBucket: "fremantle-syukuran-95973.firebasestorage.app",
  messagingSenderId: "892900409139",
  appId: "1:892900409139:web:46e72f8fc25a80e6c28846",
  measurementId: "G-CL7BRQTQ1N",
  databaseURL: "https://fremantle-syukuran-95973-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp, firebaseConfig.databaseURL);

let secondaryApp = null;
let secondaryAuth = null;

const EMAIL_DOMAIN = "fremantle-syukuran.local";
const ADMIN_EMAIL = `admin@${EMAIL_DOMAIN}`;
const CONNECT_TIMEOUT_MS = 12000;

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

const DEFAULT_CARTS = [
  { id: "G01", name: "Booth 01", menu: "Bakso" },
  { id: "G02", name: "Booth 02", menu: "Sate Ayam" },
  { id: "G03", name: "Booth 03", menu: "Gultik" },
  { id: "G04", name: "Booth 04", menu: "Crepes" },
  { id: "G05", name: "Booth 05", menu: "Ice Cream" },
  { id: "G06", name: "Booth 06", menu: "Es Teh" },
  { id: "G07", name: "Booth 07", menu: "Kopi Jago" },
];

const REMOVED_CART_IDS = ["G08"];
const REMOVED_CART_ID_SET = new Set(REMOVED_CART_IDS);

const PARTICIPANTS = [
  { name: "Sakti Parantean", username: "sakti" },
  { name: "Victor Ariesza", username: "victor" },
  { name: "Marisa Intan", username: "marisa" },
  { name: "Dandy", username: "dandy" },
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
  { name: "Mul", username: "mul" },
  { name: "Keisha Ananditya", username: "keisha" },
  { name: "Angie Ardhana Reswari", username: "angie" },
  { name: "Muhammad Yusuf Alfajri", username: "yusuf" },
  { name: "Morgano Arthur Harimu", username: "morgano" },
  { name: "Raihanah Naja Atthaya", username: "raihanah" },
  { name: "Intania Ayuning Sugandi", username: "intania" },
  { name: "Agung", username: "agung" },
  { name: "Pak Agus", username: "agus" },
  { name: "Dewi", username: "dewi" },
  { name: "Muhtasor", username: "muhtasor" },
  { name: "Riska Nur Wulandani", username: "riska" },
  { name: "Afif", username: "afif" },
  { name: "Prisca", username: "prisca" },
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
  { name: "Bambang", username: "bambang" },
  { name: "ESA APRIA CHANDRA", username: "esa" },
  { name: "RYAN RIZAL PRATAMA", username: "ryan" },
  { name: "ANJAR DWI KUNCORO", username: "anjar" },
  { name: "A JUANDA", username: "juanda" },
  { name: "AHMAD HASANUDIN", username: "ahmad" },
  { name: "ARDI ARHAM PRAMONO", username: "ardi" },
  { name: "EPRILIYANTO", username: "epriliyanto" },
];

const PARTICIPANT_REPLACEMENTS = [
  { participantCode: "P004", oldName: "Ricci Lestari", oldUsername: "ricci", newName: "Dandy", newUsername: "dandy" },
  { participantCode: "P022", oldName: "Kezia Audi Sappetaw", oldUsername: "kezia", newName: "Mul", newUsername: "mul" },
  { participantCode: "P029", oldName: "Rasim Suhendar", oldUsername: "rasim", newName: "Agung", newUsername: "agung" },
  { participantCode: "P031", oldName: "Fauzi Kamali", oldUsername: "fauzi", newName: "Dewi", newUsername: "dewi" },
  { participantCode: "P032", oldName: "Ari Kurniawan Hideyuki", oldUsername: "ari", newName: "Muhtasor", newUsername: "muhtasor" },
  { participantCode: "P034", oldName: "Moch. Rizky Setiawan", oldUsername: "rizky", newName: "Afif", newUsername: "afif" },
  { participantCode: "P035", oldName: "Chirstian Linggar Pratama", oldUsername: "chirstian", newName: "Prisca", newUsername: "prisca" },
  { participantCode: "P059", oldName: "ERWIN JEFRY HOTTY", oldUsername: "erwin", newName: "Bambang", newUsername: "bambang" },
];

const OLD_RENAMED_USERNAMES = new Set(
  PARTICIPANT_REPLACEMENTS.map((item) => item.oldUsername.toLowerCase())
);


const app = document.getElementById("app");

const state = {
  authUser: null,
  currentUser: null,
  users: {},
  carts: {},
  claims: {},
  scanner: null,
  scanning: false,
  audioContext: null,
  participantTab: "home",
  adminTab: "dashboard",
  loading: true,
  busy: false,
  setupMessage: "",
  historyFilter: "",
  missingFilter: "",
  missingCartId: "all",
  unsubs: [],
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!state.audioContext) {
    state.audioContext = new AudioContextClass();
  }

  return state.audioContext;
}

async function unlockScanAudio() {
  try {
    const context = getAudioContext();

    if (!context) return false;

    if (context.state === "suspended") {
      await context.resume();
    }

    return true;
  } catch (error) {
    console.warn("Audio unlock failed:", error);
    return false;
  }
}

function playTone(context, frequency, offset, duration, gainValue = 0.08, type = "sine") {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + offset;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(end + 0.025);
}

function playScanAudio(type) {
  try {
    const context = getAudioContext();

    if (!context || context.state === "suspended") return;

    if (type === "success") {
      playTone(context, 659.25, 0, 0.11, 0.075);
      playTone(context, 880, 0.105, 0.12, 0.075);
      playTone(context, 1174.66, 0.22, 0.16, 0.07);
      return;
    }

    if (type === "warning") {
      playTone(context, 392, 0, 0.13, 0.07, "triangle");
      playTone(context, 261.63, 0.18, 0.2, 0.075, "triangle");
      return;
    }

    if (type === "danger") {
      playTone(context, 196, 0, 0.18, 0.075, "sawtooth");
      playTone(context, 146.83, 0.2, 0.2, 0.065, "sawtooth");
    }
  } catch (error) {
    console.warn("Audio feedback failed:", error);
  }
}


function withTimeout(promise, message, timeoutMs = CONNECT_TIMEOUT_MS) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

async function readDb(path, label) {
  try {
    return await withTimeout(
      get(ref(db, path)),
      `Koneksi ke Firebase terlalu lama saat membaca ${label}. Path: /${path}. Cek koneksi internet, URL Realtime Database, dan Firebase Database Rules.`
    );
  } catch (error) {
    error.dbPath = `/${path}`;
    error.dbAction = `membaca ${label}`;
    throw error;
  }
}

async function writeDb(path, value, label) {
  try {
    return await withTimeout(
      set(ref(db, path), value),
      `Koneksi ke Firebase terlalu lama saat menyimpan ${label}. Path: /${path}. Cek koneksi internet, URL Realtime Database, dan Firebase Database Rules.`
    );
  } catch (error) {
    error.dbPath = `/${path}`;
    error.dbAction = `menyimpan ${label}`;
    throw error;
  }
}

async function deleteDb(path, label) {
  try {
    return await withTimeout(
      remove(ref(db, path)),
      `Koneksi ke Firebase terlalu lama saat menghapus ${label}. Path: /${path}.`
    );
  } catch (error) {
    error.dbPath = `/${path}`;
    error.dbAction = `menghapus ${label}`;
    throw error;
  }
}

function friendlyFirebaseError(error) {
  const code = error?.code || "";
  const message = String(error?.message || "");

  if (code.includes("permission-denied") || message.toLowerCase().includes("permission denied")) {
    const pathInfo = error?.dbPath ? ` Path yang ditolak: ${error.dbPath}.` : "";
    const actionInfo = error?.dbAction ? ` Saat: ${error.dbAction}.` : "";
    return `Firebase Realtime Database Rules masih menolak akses akun ini.${pathInfo}${actionInfo} Ini bukan masalah password. Untuk admin, rules harus mengizinkan baca /users, bukan hanya /users/{uid}. Pastikan rules dipasang di Realtime Database instance asia-southeast1, bukan Firestore.`;
  }

  if (code.includes("network-request-failed") || code.includes("unavailable")) {
    return "Koneksi internet atau server Firebase sedang bermasalah. Coba refresh halaman.";
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Username atau password tidak sesuai.";
  }

  if (code.includes("too-many-requests")) {
    return "Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.";
  }

  return message || "Terjadi kesalahan yang belum diketahui.";
}

function usernameToEmail(username) {
  const value = String(username).trim().toLowerCase();

  if (value.includes("@")) {
    return value;
  }

  return `${value}@${EMAIL_DOMAIN}`;
}

function generatePassword(index) {
  return `FM-${3000 + index * 17}`;
}

function cartsArray() {
  return Object.values(state.carts || {})
    .filter((cart) => cart?.id && !REMOVED_CART_ID_SET.has(String(cart.id).trim().toUpperCase()))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function activeCartIdSet() {
  return new Set(cartsArray().map((cart) => String(cart.id).trim().toUpperCase()));
}

function isRemovedCartId(cartId) {
  return REMOVED_CART_ID_SET.has(String(cartId || "").trim().toUpperCase());
}

function usersArray() {
  return Object.entries(state.users || {})
    .map(([uid, value]) => ({ uid, ...safeObject(value) }))
    .sort((a, b) => String(a.participantCode || "").localeCompare(String(b.participantCode || "")));
}

function claimsArray() {
  const output = [];
  const validCartIds = activeCartIdSet();

  Object.entries(state.claims || {}).forEach(([uid, userClaims]) => {
    Object.values(userClaims || {}).forEach((claim) => {
      const safeClaim = safeObject(claim);
      const cartId = String(safeClaim.cartId || "").trim().toUpperCase();

      if (!validCartIds.has(cartId)) return;

      output.push({ ...safeClaim, uid });
    });
  });

  return output.sort((a, b) => Number(b.claimedAt || 0) - Number(a.claimedAt || 0));
}

function participantClaimsArray(uid) {
  const validCartIds = activeCartIdSet();

  return Object.values((state.claims || {})[uid] || {})
    .filter((claim) => validCartIds.has(String(claim?.cartId || "").trim().toUpperCase()))
    .sort((a, b) => Number(b.claimedAt || 0) - Number(a.claimedAt || 0));
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
  }

  state.scanning = false;
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
      <img class="program-logo idol" src="${escapeAttr(EVENT.logos.idol)}" alt="Indonesian Idol" />
      <img class="program-logo fam" src="${escapeAttr(EVENT.logos.fam)}" alt="New Family 100" />
    </div>
  `;
}

function renderLoading(text = "Memuat aplikasi...") {
  app.innerHTML = `
    <main class="login-wrap">
      <section class="card app-card" style="text-align:center; max-width:520px; width:100%;">
        <img class="fm-mark" src="${escapeAttr(EVENT.logos.fremantle)}" alt="Fremantle" style="margin:0 auto 22px;" />
        <div class="event-pill">Loading</div>
        <h1 class="app-title">${escapeHtml(EVENT.name)}</h1>
        <p>${escapeHtml(text)}</p>
      </section>
    </main>
  `;
}

function renderError(title, message) {
  app.innerHTML = `
    <main class="login-wrap">
      <section class="card app-card" style="max-width:560px; width:100%;">
        <div class="event-pill">Error</div>
        <h1 class="app-title">${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
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
  const snapshot = await readDb(`users/${user.uid}`, "profil akun");

  if (snapshot.exists()) {
    return snapshot.val();
  }

  if (user.email !== ADMIN_EMAIL) {
    throw new Error("Akun belum terdaftar sebagai peserta acara. Data profil user belum ada di Realtime Database.");
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

  await writeDb(`users/${user.uid}`, adminProfile, "profil admin");
  return adminProfile;
}

async function loadInitialData(profile) {
  const cartsSnapshot = await readDb("carts", "data booth");

  state.carts = cartsSnapshot.val() || {};

  if (profile.role === "admin") {
    const [claimsSnapshot, usersSnapshot] = await Promise.all([
      readDb("claims", "data pengambilan"),
      readDb("users", "data peserta"),
    ]);

    state.claims = claimsSnapshot.val() || {};
    state.users = usersSnapshot.val() || {};
    return;
  }

  const ownClaimsSnapshot = await readDb(
    `claims/${state.authUser.uid}`,
    "status voucher akun ini"
  );

  state.claims = {
    [state.authUser.uid]: ownClaimsSnapshot.val() || {},
  };

  state.users = {
    [state.authUser.uid]: profile,
  };
}

function subscribeRealtimeData(profile) {
  detachRealtimeListeners();

  state.unsubs.push(
    onValue(
      ref(db, "carts"),
      (snapshot) => {
        state.carts = snapshot.val() || {};
        if (state.currentUser) render();
      },
      (error) => console.error("Realtime carts error:", error)
    )
  );

  if (profile.role === "admin") {
    state.unsubs.push(
      onValue(
        ref(db, "claims"),
        (snapshot) => {
          state.claims = snapshot.val() || {};
          if (state.currentUser?.role === "admin") render();
        },
        (error) => console.error("Realtime claims error:", error)
      )
    );

    state.unsubs.push(
      onValue(
        ref(db, "users"),
        (snapshot) => {
          state.users = snapshot.val() || {};
          if (state.currentUser?.role === "admin") render();
        },
        (error) => console.error("Realtime users error:", error)
      )
    );

    return;
  }

  state.unsubs.push(
    onValue(
      ref(db, `claims/${state.authUser.uid}`),
      (snapshot) => {
        state.claims = {
          [state.authUser.uid]: snapshot.val() || {},
        };

        if (state.currentUser?.role !== "admin") render();
      },
      (error) => console.error("Realtime own claims error:", error)
    )
  );
}

function renderLogin() {
  closeResultPopup();
  stopScannerIfNeeded();

  app.innerHTML = `
    <main class="login-wrap">
      <section class="card login-card">
        <div class="login-panel">
          <img class="fm-mark" src="${escapeAttr(EVENT.logos.fremantle)}" alt="Fremantle" />

          <div style="margin-top: 34px;">
            <div class="event-pill">Voucher Access</div>
            <h1>${escapeHtml(EVENT.name)}</h1>
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

  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    await unlockScanAudio();

    if (state.busy) return;

    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const loginBtn = document.getElementById("loginBtn");
    const messageEl = document.getElementById("loginMessage");

    state.busy = true;
    loginBtn.disabled = true;
    loginBtn.textContent = "Memproses...";
    messageEl.innerHTML = "";

    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    } catch (error) {
      console.error("Login error:", error);

      messageEl.innerHTML = `
        <div class="notice danger">
          ${escapeHtml(friendlyFirebaseError(error))}<br/>
          <small>${escapeHtml(error.code || error.message)}</small>
        </div>
      `;

      loginBtn.disabled = false;
      loginBtn.textContent = "Masuk";
      state.busy = false;
    }
  });
}

function renderTopbar() {
  const user = state.currentUser || {};

  return `
    <header class="topbar no-print">
      <div class="brand">
        <img class="fm-mark" src="${escapeAttr(EVENT.logos.fremantle)}" alt="Fremantle" />
        <div class="brand-copy">
          <div class="brand-title">${escapeHtml(EVENT.name)}</div>
          <div class="brand-subtitle">${escapeHtml(EVENT.organizer)} · ${escapeHtml(EVENT.subtitle)}</div>
        </div>
      </div>

      <div class="user-pill">
        <div>
          <strong>${escapeHtml(user.name || "User")}</strong>
          <small>${escapeHtml(user.username || "-")} · ${escapeHtml(user.role || "-")}</small>
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
    state.busy = false;

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
          { id: "missing", label: "Belum", icon: "!" },
          { id: "history", label: "Riwayat", icon: "≡" },
        ];

  const activeTab =
    type === "participant" ? state.participantTab : state.adminTab;

  return `
    <nav class="app-tabs no-print" data-tab-type="${escapeAttr(type)}">
      ${tabs
        .map(
          (tab) => `
            <button class="app-tab ${activeTab === tab.id ? "active" : ""}" data-tab="${escapeAttr(tab.id)}">
              <span class="tab-icon">${escapeHtml(tab.icon)}</span>
              <span>${escapeHtml(tab.label)}</span>
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
    remainingCount: Math.max(carts.length - userClaims.length, 0),
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
            <b>${escapeHtml(claim.menu || "-")}</b>
            <small>${escapeHtml(claim.cartName || "-")} · ${escapeHtml(formatTime(claim.claimedAt))}</small>
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
        Halo, <span class="gold-text">${escapeHtml(state.currentUser.name || "Peserta")}</span>
      </h1>

      <p class="app-desc">
        Gunakan menu bawah untuk scan QR booth dan cek status menu kamu.
      </p>

      <div class="progress-card">
        <div class="progress-top">
          <div>
            <strong>${escapeHtml(claimedCount)} dari ${escapeHtml(carts.length)} menu</strong>
            <small>Sudah kamu ambil</small>
          </div>
          <b>${escapeHtml(progressPercent)}%</b>
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
          <b>${escapeHtml(remainingCount)} belum diambil</b>
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
            Arahkan kamera ke QR yang tersedia di booth. Kalau kamera bermasalah, pakai input manual.
            Aktifkan volume device untuk mendengar notifikasi scan berhasil atau sudah digunakan.
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

      <details class="manual-details">
        <summary>Input kode booth manual</summary>
        <form class="manual-box" id="manualClaimForm">
          <div class="field">
            <label for="manualCode">Kode booth / isi QR</label>
            <input id="manualCode" placeholder="Contoh: G01 atau SYUKURAN_CART:G01" autocomplete="off" required />
          </div>
          <button class="btn btn-gold" type="submit" id="manualClaimBtn">Claim Manual</button>
        </form>
      </details>

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
            <div class="menu-title">${escapeHtml(cart.menu || "-")}</div>
            <div class="menu-meta">${escapeHtml(meta)}</div>
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
            ${escapeHtml(claimedCount)} sudah diambil, ${escapeHtml(remainingCount)} belum diambil.
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

  document.getElementById("startScanBtn")?.addEventListener("click", async () => {
    await unlockScanAudio();
    await startScanner();
  });
  document.getElementById("stopScanBtn")?.addEventListener("click", stopScannerIfNeeded);

  document.getElementById("manualClaimForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    await unlockScanAudio();

    if (state.busy) return;

    const input = document.getElementById("manualCode");
    const button = document.getElementById("manualClaimBtn");
    const code = input?.value || "";

    state.busy = true;
    button.disabled = true;
    button.textContent = "Memproses...";

    try {
      await handleQrResult(code);
      input.value = "";
    } finally {
      state.busy = false;
      button.disabled = false;
      button.textContent = "Claim Manual";
    }
  });
}

function setScanMessage(type, title, text) {
  const el = document.getElementById("scanMessage");
  if (!el) return;

  el.innerHTML = `
    <div class="notice ${escapeAttr(type)}">
      <b>${escapeHtml(title)}</b><br/>
      ${text}
    </div>
  `;
}

async function startScanner() {
  const reader = document.getElementById("qr-reader");
  const startButton = document.getElementById("startScanBtn");

  await unlockScanAudio();

  if (!window.Html5Qrcode) {
    setScanMessage(
      "danger",
      "Scanner belum siap.",
      "Library scanner belum ter-load. Refresh halaman atau gunakan input manual."
    );
    return;
  }

  if (state.scanning) return;

  reader.innerHTML = "";
  startButton.disabled = true;
  startButton.textContent = "Membuka...";

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
    console.error("Camera error:", error);
    reader.innerHTML = `<div class="scanner-placeholder">Kamera belum aktif.</div>`;
    setScanMessage(
      "danger",
      "Kamera tidak dapat dibuka.",
      "Izinkan akses kamera untuk melanjutkan atau gunakan input manual."
    );
  } finally {
    startButton.disabled = false;
    startButton.textContent = "Buka Kamera";
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

      <div class="result-icon ${escapeAttr(type)}">
        ${escapeHtml(iconMap[type] || "!")}
      </div>

      <div class="result-label">
        ${escapeHtml(labelMap[type] || "Status Scan")}
      </div>

      <h2>${escapeHtml(title)}</h2>

      <p>${escapeHtml(message)}</p>

      ${
        menu || booth
          ? `
            <div class="result-detail">
              ${
                menu
                  ? `
                    <div>
                      <span>Menu</span>
                      <strong>${escapeHtml(menu)}</strong>
                    </div>
                  `
                  : ""
              }

              ${
                booth
                  ? `
                    <div>
                      <span>Booth</span>
                      <strong>${escapeHtml(booth)}</strong>
                    </div>
                  `
                  : ""
              }
            </div>
          `
          : ""
      }

      <div class="result-actions">
        <button class="btn ${escapeAttr(buttonClassMap[type] || "btn-primary")}" id="resultPrimaryBtn">
          ${escapeHtml(primaryText || "Oke")}
        </button>

        ${
          secondaryText
            ? `
              <button class="btn btn-outline" id="resultSecondaryBtn">
                ${escapeHtml(secondaryText)}
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
  if (!state.authUser || !state.currentUser) return;

  const cartId = normalizeCartCode(decodedText);
  const cart = isRemovedCartId(cartId) ? null : state.carts[cartId];

  if (!cart) {
    stopScannerIfNeeded();
    playScanAudio("danger");

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
    const result = await withTimeout(
      runTransaction(
        claimRef,
        (currentData) => {
          if (currentData !== null) return;
          return claimData;
        },
        {
          applyLocally: false,
        }
      ),
      "Koneksi ke Firebase terlalu lama saat memproses voucher. Coba ulang scan."
    );

    if (!result.committed) {
      playScanAudio("warning");

      setScanMessage(
        "warning",
        "Kamu sudah mengambil menu ini.",
        `Menu <b>${escapeHtml(cart.menu)}</b> dari <b>${escapeHtml(cart.name)}</b> sudah pernah kamu ambil.`
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

    state.claims = {
      ...state.claims,
      [state.authUser.uid]: {
        ...safeObject(state.claims[state.authUser.uid]),
        [cart.id]: claimData,
      },
    };

    playScanAudio("success");

    setScanMessage(
      "success",
      "Berhasil!",
      `Silakan ambil <b>${escapeHtml(cart.menu)}</b> di <b>${escapeHtml(cart.name)}</b>.`
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
    console.error("Claim error:", error);
    playScanAudio("danger");
    setScanMessage(
      "danger",
      "Gagal memproses scan.",
      escapeHtml(friendlyFirebaseError(error))
    );

    showResultPopup({
      type: "danger",
      title: "Gagal",
      message: friendlyFirebaseError(error) || "Scan belum berhasil diproses. Silakan coba lagi.",
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
        : state.adminTab === "missing"
          ? renderAdminMissing()
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

  const completionPercent = totalPossibleClaims ? Math.round((totalClaims / totalPossibleClaims) * 100) : 0;

  const cartStatsHtml = carts
    .map((cart) => {
      const count = claims.filter((claim) => claim.cartId === cart.id).length;
      const remaining = Math.max(participants.length - count, 0);

      return `
        <div class="admin-stat-row">
          <div>
            <b>${escapeHtml(cart.menu || "-")}</b>
            <small>${escapeHtml(cart.id || "-")} · ${escapeHtml(cart.name || "-")}</small>
          </div>
          <div class="admin-numbers">
            <span>${escapeHtml(count)}</span>
            <small>sisa ${escapeHtml(remaining)}</small>
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
          <div class="stat-value">${escapeHtml(participants.length)}</div>
          <div class="stat-label">Peserta</div>
        </div>

        <div class="stat">
          <div class="stat-value">${escapeHtml(carts.length)}</div>
          <div class="stat-label">Booth</div>
        </div>

        <div class="stat">
          <div class="stat-value">${escapeHtml(totalClaims)}</div>
          <div class="stat-label">Terpakai</div>
        </div>

        <div class="stat">
          <div class="stat-value">${escapeHtml(completionPercent)}%</div>
          <div class="stat-label">Selesai</div>
        </div>
      </div>

      <div class="btn-row" style="margin-top: 18px;">
        <button class="btn btn-primary" id="setupDbBtn">Setup Data</button>
        <button class="btn btn-outline" id="fixBoothsBtn">Fix Booth 7</button>
        <button class="btn btn-gold" id="fixParticipantsBtn">Fix Peserta 66</button>
        <button class="btn btn-danger" id="resetClaimsBtn">Reset Pengambilan</button>
      </div>

      <div id="setupMessage">
        ${
          state.setupMessage
            ? `<div class="notice warning">${escapeHtml(state.setupMessage)}</div>`
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
          <div class="qr-holder" id="qr-${escapeAttr(cart.id)}"></div>
          <div class="qr-title">${escapeHtml(cart.name || "-")}</div>
          <div class="qr-subtitle">${escapeHtml(cart.id || "-")} · ${escapeHtml(cart.menu || "-")}</div>
          <div class="code" style="margin-top: 10px;">SYUKURAN_CART:${escapeHtml(cart.id || "")}</div>
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
          <strong>${escapeHtml(EVENT.name)}</strong>
          <p style="margin: 8px 0 0;">${escapeHtml(user.name || "-")} · ${escapeHtml(user.participantCode || "-")}</p>

          <div class="voucher-label">Username</div>
          <div class="code">${escapeHtml(user.username || "-")}</div>

          <div class="voucher-label">Password</div>
          <div class="code">${escapeHtml(user.password || "-")}</div>
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

function getClaimsByCartId() {
  const map = new Map();

  claimsArray().forEach((claim) => {
    const cartId = String(claim.cartId || "").trim().toUpperCase();
    if (!cartId) return;

    if (!map.has(cartId)) {
      map.set(cartId, new Map());
    }

    map.get(cartId).set(claim.uid, claim);
  });

  return map;
}

function participantMatchesKeyword(participant, keyword) {
  if (!keyword) return true;

  const haystack = [
    participant.participantCode,
    participant.name,
    participant.username,
    participant.email,
  ].join(" ").toLowerCase();

  return haystack.includes(keyword);
}

function getMissingParticipantsByBooth() {
  const { participants, carts } = getAdminStats();
  const claimsByCart = getClaimsByCartId();
  const keyword = state.missingFilter.trim().toLowerCase();
  const selectedCartId = String(state.missingCartId || "all").trim().toUpperCase();

  return carts
    .filter((cart) => selectedCartId === "ALL" || String(cart.id || "").trim().toUpperCase() === selectedCartId)
    .map((cart) => {
      const claimedByUid = claimsByCart.get(String(cart.id || "").trim().toUpperCase()) || new Map();
      const missingParticipants = participants.filter((participant) => !claimedByUid.has(participant.uid));
      const filteredMissingParticipants = missingParticipants.filter((participant) => participantMatchesKeyword(participant, keyword));

      return {
        cart,
        claimedCount: claimedByUid.size,
        totalParticipants: participants.length,
        missingParticipants,
        filteredMissingParticipants,
      };
    });
}

function renderAdminMissing() {
  const { participants, carts } = getAdminStats();
  const missingGroups = getMissingParticipantsByBooth();
  const totalMissing = missingGroups.reduce((sum, group) => sum + group.missingParticipants.length, 0);
  const filteredMissing = missingGroups.reduce((sum, group) => sum + group.filteredMissingParticipants.length, 0);

  const optionHtml = carts
    .map((cart) => {
      const selected = String(state.missingCartId || "all").toUpperCase() === String(cart.id || "").toUpperCase() ? "selected" : "";
      return `<option value="${escapeAttr(cart.id || "")}" ${selected}>${escapeHtml(cart.id || "-")} · ${escapeHtml(cart.menu || "-")}</option>`;
    })
    .join("");

  const summaryCards = missingGroups
    .map((group) => {
      const missingCount = group.missingParticipants.length;
      const filteredCount = group.filteredMissingParticipants.length;
      const percentTaken = group.totalParticipants ? Math.round((group.claimedCount / group.totalParticipants) * 100) : 0;
      const filteredText = state.missingFilter.trim() ? ` · tampil ${filteredCount}` : "";

      return `
        <div class="missing-summary-card">
          <div>
            <b>${escapeHtml(group.cart.menu || "-")}</b>
            <small>${escapeHtml(group.cart.id || "-")} · ${escapeHtml(group.cart.name || "-")}</small>
          </div>
          <div class="missing-summary-number">
            <strong>${escapeHtml(missingCount)}</strong>
            <span>belum ambil${escapeHtml(filteredText)}</span>
          </div>
          <div class="progress-track compact-progress">
            <div class="progress-fill" style="width: ${percentTaken}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const groupHtml = missingGroups
    .map((group, index) => {
      const missingRows = group.filteredMissingParticipants
        .map((participant) => `
          <div class="missing-row">
            <div>
              <b>${escapeHtml(participant.name || "-")}</b>
              <small>${escapeHtml(participant.participantCode || "-")} · ${escapeHtml(participant.username || "-")}</small>
            </div>
            <span class="status pending">Belum</span>
          </div>
        `)
        .join("");

      const openAttr = state.missingCartId !== "all" || index === 0 ? "open" : "";
      const filteredText = state.missingFilter.trim()
        ? ` · tampil ${group.filteredMissingParticipants.length}`
        : "";

      return `
        <details class="missing-panel" ${openAttr}>
          <summary>
            <div>
              <b>${escapeHtml(group.cart.menu || "-")}</b>
              <small>${escapeHtml(group.cart.id || "-")} · ${escapeHtml(group.cart.name || "-")}</small>
            </div>
            <span>${escapeHtml(group.missingParticipants.length)} belum${escapeHtml(filteredText)}</span>
          </summary>

          <div class="missing-list">
            ${missingRows || `<div class="empty-state">Tidak ada peserta yang cocok dengan filter ini.</div>`}
          </div>
        </details>
      `;
    })
    .join("");

  return `
    <section class="card app-card">
      <div class="screen-head">
        <div>
          <div class="event-pill">Belum Ambil</div>
          <h1 class="app-title">Peserta yang belum ambil</h1>
          <p class="app-desc">
            Cek siapa saja yang belum mengambil menu di tiap booth. Total peserta: ${escapeHtml(participants.length)}. Total status belum ambil: ${escapeHtml(totalMissing)}.
          </p>
        </div>
      </div>

      <div class="toolbar-row no-print">
        <input class="search-input" id="missingSearch" value="${escapeAttr(state.missingFilter)}" placeholder="Cari nama, username, kode peserta..." />
        <select class="search-input" id="missingBoothSelect" aria-label="Filter booth">
          <option value="all" ${state.missingCartId === "all" ? "selected" : ""}>Semua booth</option>
          ${optionHtml}
        </select>
        <button class="btn btn-outline" id="exportMissingBtn">Export CSV</button>
      </div>

      <div class="missing-meta">
        Menampilkan ${escapeHtml(filteredMissing)} data belum ambil${state.missingFilter.trim() ? " sesuai filter" : ""}.
      </div>

      <div class="missing-summary-grid">
        ${summaryCards || `<div class="empty-state">Data booth belum tersedia.</div>`}
      </div>
    </section>

    <section class="card app-card compact-card">
      <div class="section-heading">
        <div>
          <h2>Detail per booth</h2>
          <p>Buka panel booth untuk melihat nama peserta yang belum mengambil.</p>
        </div>
      </div>

      <div class="missing-panels">
        ${groupHtml || `<div class="empty-state">Data belum tersedia.</div>`}
      </div>
    </section>
  `;
}

function getFilteredClaims() {
  const { claims } = getAdminStats();
  const keyword = state.historyFilter.trim().toLowerCase();

  if (!keyword) return claims;

  return claims.filter((claim) => {
    const haystack = [
      claim.participantName,
      claim.participantCode,
      claim.username,
      claim.menu,
      claim.cartName,
      claim.cartId,
      formatTime(claim.claimedAt),
    ].join(" ").toLowerCase();

    return haystack.includes(keyword);
  });
}

function renderAdminHistory() {
  const claims = getFilteredClaims();

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
                  <b>${escapeHtml(claim.participantName || "-")}</b>
                  <small>${escapeHtml(claim.participantCode || "-")} · ${escapeHtml(claim.menu || "-")}</small>
                </div>
                <div>
                  <span>${escapeHtml(claim.cartName || "-")}</span>
                  <small>${escapeHtml(formatTime(claim.claimedAt))}</small>
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

      <div class="toolbar-row no-print">
        <input class="search-input" id="historySearch" value="${escapeAttr(state.historyFilter)}" placeholder="Cari peserta, menu, booth..." />
        <button class="btn btn-outline" id="exportHistoryBtn">Export CSV</button>
      </div>

      <div class="history-list" style="margin-top: 16px;">
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

  document.getElementById("fixBoothsBtn")?.addEventListener("click", fixBoothData);

  document.getElementById("fixParticipantsBtn")?.addEventListener("click", fixParticipantData);

  document.getElementById("resetClaimsBtn")?.addEventListener("click", async () => {
    const confirmed = confirm(
      "Yakin ingin menghapus semua data pengambilan makanan? Username dan password peserta tidak akan dihapus."
    );

    if (!confirmed) return;

    try {
      await deleteDb("claims", "data pengambilan");
      state.setupMessage = "Data pengambilan berhasil direset.";
      renderAdmin();
    } catch (error) {
      state.setupMessage = `Reset gagal: ${friendlyFirebaseError(error)}`;
      renderAdmin();
    }
  });

  document.getElementById("historySearch")?.addEventListener("input", (event) => {
    state.historyFilter = event.target.value;
    renderAdmin();
    const input = document.getElementById("historySearch");
    input?.focus();
    input?.setSelectionRange(state.historyFilter.length, state.historyFilter.length);
  });

  document.getElementById("exportHistoryBtn")?.addEventListener("click", exportHistoryCsv);

  document.getElementById("missingSearch")?.addEventListener("input", (event) => {
    state.missingFilter = event.target.value;
    renderAdmin();
    const input = document.getElementById("missingSearch");
    input?.focus();
    input?.setSelectionRange(state.missingFilter.length, state.missingFilter.length);
  });

  document.getElementById("missingBoothSelect")?.addEventListener("change", (event) => {
    state.missingCartId = event.target.value || "all";
    renderAdmin();
  });

  document.getElementById("exportMissingBtn")?.addEventListener("click", exportMissingCsv);
}


function canonicalCartsObject() {
  return DEFAULT_CARTS.reduce((accumulator, cart) => {
    accumulator[cart.id] = { ...cart };
    return accumulator;
  }, {});
}

async function cleanupRemovedCartClaims() {
  const claimsSnapshot = await readDb("claims", "data pengambilan untuk cleanup booth");
  const claims = safeObject(claimsSnapshot.val());
  let removedClaims = 0;

  for (const [uid, userClaims] of Object.entries(claims)) {
    for (const cartId of Object.keys(safeObject(userClaims))) {
      const normalizedCartId = String(cartId || "").trim().toUpperCase();

      if (!REMOVED_CART_ID_SET.has(normalizedCartId)) continue;

      await deleteDb(`claims/${uid}/${cartId}`, `claim booth dihapus ${cartId}`);
      removedClaims += 1;
    }
  }

  return removedClaims;
}

async function syncBoothData(progressElement = null) {
  if (progressElement) {
    progressElement.innerHTML = `
      <div class="notice warning">
        Menyinkronkan data booth menjadi ${escapeHtml(DEFAULT_CARTS.length)} booth aktif...
      </div>
    `;
  }

  await writeDb("carts", canonicalCartsObject(), "data booth aktif");
  const removedClaims = await cleanupRemovedCartClaims();

  await writeDb("meta/boothSync", {
    activeBooths: DEFAULT_CARTS.length,
    removedCartIds: REMOVED_CART_IDS,
    removedClaims,
    syncedAt: Date.now(),
    syncedBy: state.authUser.uid,
  }, "status sinkron booth");

  const cartsSnapshot = await readDb("carts", "validasi data booth");
  state.carts = cartsSnapshot.val() || {};

  return {
    activeBooths: DEFAULT_CARTS.length,
    removedCartIds: REMOVED_CART_IDS,
    removedClaims,
  };
}

async function fixBoothData() {
  const confirmed = confirm(
    "Fix booth akan mengubah data menjadi 7 booth aktif, mengganti Es Podeng menjadi Ice Cream, menghapus G08/Telur Gulung dari database, dan menghapus claim lama untuk G08. Lanjutkan?"
  );

  if (!confirmed) return;

  const fixBtn = document.getElementById("fixBoothsBtn");
  const setupMessage = document.getElementById("setupMessage");

  if (fixBtn) {
    fixBtn.disabled = true;
    fixBtn.textContent = "Memproses...";
  }

  try {
    const result = await syncBoothData(setupMessage);
    const removedIds = result.removedCartIds.length ? result.removedCartIds.join(", ") : "-";
    state.setupMessage = `Fix booth selesai. Booth aktif sekarang ${result.activeBooths}. Booth dihapus: ${removedIds}. Claim G08 yang dibersihkan: ${result.removedClaims}.`;
    renderAdmin();
  } catch (error) {
    console.error("Fix booth error:", error);
    state.setupMessage = `Fix booth gagal: ${friendlyFirebaseError(error)}`;
    renderAdmin();
  }
}

function canonicalParticipantsArray() {
  return PARTICIPANTS.map((participant, index) => {
    const participantNumber = index + 1;
    const participantCode = `P${String(participantNumber).padStart(3, "0")}`;
    const password = generatePassword(participantNumber);

    return {
      ...participant,
      participantCode,
      password,
      email: usernameToEmail(participant.username),
    };
  });
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function findUserEntryByUsername(users, username) {
  const target = normalizeUsername(username);

  return Object.entries(safeObject(users)).find(([, profile]) => {
    return normalizeUsername(profile?.username) === target;
  });
}
function findUserEntryByEmail(users, email) {
  const target = normalizeUsername(email);

  return Object.entries(safeObject(users)).find(([, profile]) => {
    return normalizeUsername(profile?.email) === target;
  });
}

function findUserEntryByParticipantCode(users, participantCode) {
  const target = String(participantCode || "").trim().toUpperCase();

  return Object.entries(safeObject(users)).find(([, profile]) => {
    return String(profile?.participantCode || "").trim().toUpperCase() === target;
  });
}

function findExistingUserEntryForCanonicalParticipant(users, participant) {
  const replacement = PARTICIPANT_REPLACEMENTS.find((item) => item.participantCode === participant.participantCode);

  const candidates = [
    findUserEntryByUsername(users, participant.username),
    findUserEntryByEmail(users, participant.email),
    findUserEntryByParticipantCode(users, participant.participantCode),
    replacement ? findUserEntryByUsername(users, replacement.oldUsername) : null,
    replacement ? findUserEntryByEmail(users, usernameToEmail(replacement.oldUsername)) : null,
  ];

  return candidates.find(Boolean) || null;
}

function buildCanonicalMaps() {
  const canonical = canonicalParticipantsArray();

  return {
    canonical,
    byCode: new Map(canonical.map((participant) => [participant.participantCode, participant])),
    byUsername: new Map(canonical.map((participant) => [normalizeUsername(participant.username), participant])),
  };
}

function getCanonicalTargetForProfile(profile, maps) {
  const participantCode = String(profile?.participantCode || "").trim();
  const username = normalizeUsername(profile?.username);

  if (participantCode && maps.byCode.has(participantCode)) {
    return maps.byCode.get(participantCode);
  }

  if (username && maps.byUsername.has(username)) {
    return maps.byUsername.get(username);
  }

  const replacement = PARTICIPANT_REPLACEMENTS.find((item) => {
    return normalizeUsername(item.oldUsername) === username;
  });

  if (replacement && maps.byCode.has(replacement.participantCode)) {
    return maps.byCode.get(replacement.participantCode);
  }

  return null;
}

async function migrateClaimsToCanonicalUser(fromUid, toUid, canonicalProfile) {
  if (!fromUid || !toUid || fromUid === toUid) return 0;

  const oldClaimsSnapshot = await readDb(`claims/${fromUid}`, `claim lama ${canonicalProfile.username}`);
  const oldClaims = safeObject(oldClaimsSnapshot.val());

  if (Object.keys(oldClaims).length === 0) return 0;

  const targetClaimsSnapshot = await readDb(`claims/${toUid}`, `claim baru ${canonicalProfile.username}`);
  const targetClaims = safeObject(targetClaimsSnapshot.val());
  let moved = 0;

  for (const [cartId, claim] of Object.entries(oldClaims)) {
    if (targetClaims[cartId]) continue;

    await writeDb(`claims/${toUid}/${cartId}`, {
      ...safeObject(claim),
      participantId: toUid,
      uid: toUid,
      participantCode: canonicalProfile.participantCode,
      participantName: canonicalProfile.name,
      username: canonicalProfile.username,
    }, `migrasi claim ${canonicalProfile.username} ${cartId}`);

    moved += 1;
  }

  await deleteDb(`claims/${fromUid}`, `claim lama ${canonicalProfile.username}`);
  return moved;
}

async function cleanupLegacyParticipantProfiles(canonicalUidByCode) {
  const maps = buildCanonicalMaps();
  const usersSnapshot = await readDb("users", "data peserta untuk cleanup");
  const users = safeObject(usersSnapshot.val());
  let removedProfiles = 0;
  let migratedClaims = 0;

  for (const [uid, profile] of Object.entries(users)) {
    const safeProfile = safeObject(profile);
    if (safeProfile.role !== "participant") continue;

    const username = normalizeUsername(safeProfile.username);
    const target = getCanonicalTargetForProfile(safeProfile, maps);
    const targetUid = target ? canonicalUidByCode.get(target.participantCode) : null;
    const isLegacyRenamedUsername = OLD_RENAMED_USERNAMES.has(username);

    if (target && targetUid && uid !== targetUid) {
      migratedClaims += await migrateClaimsToCanonicalUser(uid, targetUid, target);
      await deleteDb(`users/${uid}`, `profil peserta duplikat ${safeProfile.username || uid}`);
      removedProfiles += 1;
      continue;
    }

    if (!target && isLegacyRenamedUsername) {
      await deleteDb(`users/${uid}`, `profil peserta lama ${safeProfile.username || uid}`);
      removedProfiles += 1;
    }
  }

  return { removedProfiles, migratedClaims };
}

async function syncCanonicalParticipants(progressElement = null) {
  const maps = buildCanonicalMaps();
  const canonicalUidByCode = new Map();
  const skippedAuthUsers = [];
  const usersSnapshot = await readDb("users", "data peserta sebelum sinkron");
  const users = safeObject(usersSnapshot.val());

  for (let i = 0; i < maps.canonical.length; i++) {
    const participant = maps.canonical[i];

    if (progressElement) {
      progressElement.innerHTML = `
        <div class="notice warning">
          Sinkron peserta ${escapeHtml(i + 1)} dari ${escapeHtml(maps.canonical.length)}: ${escapeHtml(participant.name)}
        </div>
      `;
    }

    const existingEntry = findExistingUserEntryForCanonicalParticipant(users, participant);
    let uid = existingEntry?.[0] || "";
    let existingProfile = safeObject(existingEntry?.[1]);

    if (!uid) {
      const createdUid = await createAuthUserIfMissing(participant.email, participant.password);

      if (!createdUid) {
        skippedAuthUsers.push(`${participant.participantCode} ${participant.username}`);
        continue;
      }

      uid = createdUid;
      existingProfile = {};
    }

    canonicalUidByCode.set(participant.participantCode, uid);

    const updatedProfile = {
      ...existingProfile,
      uid,
      participantCode: participant.participantCode,
      name: participant.name,
      username: participant.username,
      email: participant.email,
      password: participant.password,
      role: "participant",
      createdAt: existingProfile.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await writeDb(`users/${uid}`, updatedProfile, `profil peserta ${participant.username}`);
    users[uid] = updatedProfile;
  }

  const cleanupResult = await cleanupLegacyParticipantProfiles(canonicalUidByCode);

  await writeDb("meta/participantSync", {
    expectedParticipants: maps.canonical.length,
    removedDuplicateProfiles: cleanupResult.removedProfiles,
    migratedClaims: cleanupResult.migratedClaims,
    skippedAuthUsers,
    syncedAt: Date.now(),
    syncedBy: state.authUser.uid,
  }, "status sinkron peserta");

  const finalUsersSnapshot = await readDb("users", "validasi jumlah peserta");
  const finalParticipants = Object.values(safeObject(finalUsersSnapshot.val())).filter((user) => user?.role === "participant");

  state.users = finalUsersSnapshot.val() || {};

  return {
    expectedParticipants: maps.canonical.length,
    finalParticipants: finalParticipants.length,
    removedProfiles: cleanupResult.removedProfiles,
    migratedClaims: cleanupResult.migratedClaims,
    skippedAuthUsers,
  };
}

async function fixParticipantData() {
  const confirmed = confirm(
    "Fix peserta akan menyinkronkan daftar menjadi 66 peserta, mengganti 8 nama/username sesuai update, mempertahankan password berdasarkan nomor peserta lama, dan menghapus profil duplikat di Realtime Database. Lanjutkan?"
  );

  if (!confirmed) return;

  const fixBtn = document.getElementById("fixParticipantsBtn");
  const setupMessage = document.getElementById("setupMessage");

  if (fixBtn) {
    fixBtn.disabled = true;
    fixBtn.textContent = "Memproses...";
  }

  try {
    const result = await syncCanonicalParticipants(setupMessage);
    const skippedText = result.skippedAuthUsers.length
      ? ` Ada ${result.skippedAuthUsers.length} akun Auth yang sudah ada tetapi profil /users tidak ditemukan: ${result.skippedAuthUsers.join(", ")}. Akun ini perlu dicek manual di Firebase Authentication.`
      : "";
    state.setupMessage = `Fix peserta selesai. Jumlah peserta sekarang ${result.finalParticipants}/${result.expectedParticipants}. Profil duplikat dihapus: ${result.removedProfiles}. Claim dimigrasi: ${result.migratedClaims}.${skippedText}`;
    renderAdmin();
  } catch (error) {
    console.error("Fix participant error:", error);
    state.setupMessage = `Fix peserta gagal: ${friendlyFirebaseError(error)}`;
    renderAdmin();
  }
}

async function setupDatabase() {
  const confirmed = confirm(
    "Setup data akan membuat/memperbarui akun peserta, booth, dan voucher sesuai data yang sudah ada di app.js. Lanjutkan?"
  );

  if (!confirmed) return;

  const setupBtn = document.getElementById("setupDbBtn");
  const setupMessage = document.getElementById("setupMessage");

  setupBtn.disabled = true;
  setupBtn.textContent = "Memproses...";

  try {
    const boothSyncResult = await syncBoothData(setupMessage);

    const currentAdmin = {
      uid: state.authUser.uid,
      name: "Admin Panitia",
      username: "admin",
      email: ADMIN_EMAIL,
      role: "admin",
      participantCode: "ADMIN",
      createdAt: Date.now(),
    };

    await writeDb(`users/${state.authUser.uid}`, currentAdmin, "profil admin");

    const syncResult = await syncCanonicalParticipants(setupMessage);

    await writeDb("meta/setup", {
      completed: true,
      completedAt: Date.now(),
      completedBy: state.authUser.uid,
    }, "status setup");

    const skippedText = syncResult.skippedAuthUsers.length
      ? ` Ada ${syncResult.skippedAuthUsers.length} akun Auth yang sudah ada tetapi profil /users tidak ditemukan: ${syncResult.skippedAuthUsers.join(", ")}. Akun ini perlu dicek manual di Firebase Authentication.`
      : "";
    state.setupMessage = `Setup data selesai. Booth aktif ${boothSyncResult.activeBooths}. Claim G08 dibersihkan: ${boothSyncResult.removedClaims}. Peserta aktif ${syncResult.finalParticipants}/${syncResult.expectedParticipants}. Profil duplikat dihapus: ${syncResult.removedProfiles}. Claim peserta dimigrasi: ${syncResult.migratedClaims}.${skippedText}`;
    renderAdmin();
  } catch (error) {
    console.error("Setup error:", error);
    state.setupMessage = `Setup gagal: ${friendlyFirebaseError(error)}`;
    renderAdmin();
  }
}

async function createAuthUserIfMissing(email, password) {
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
    await signOut(secondary).catch(() => {});

    if (error.code === "auth/email-already-in-use") {
      return null;
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

function exportHistoryCsv() {
  const claims = getFilteredClaims();

  if (!claims.length) {
    alert("Belum ada data riwayat untuk diexport.");
    return;
  }

  const rows = [
    ["Participant Code", "Name", "Username", "Booth ID", "Booth", "Menu", "Claimed At"],
    ...claims.map((claim) => [
      claim.participantCode || "",
      claim.participantName || "",
      claim.username || "",
      claim.cartId || "",
      claim.cartName || "",
      claim.menu || "",
      new Date(claim.claimedAt || 0).toLocaleString("id-ID"),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `riwayat-syukuran-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}


function exportMissingCsv() {
  const groups = getMissingParticipantsByBooth();
  const rows = [["Booth ID", "Booth", "Menu", "Participant Code", "Name", "Username"]];

  groups.forEach((group) => {
    group.filteredMissingParticipants.forEach((participant) => {
      rows.push([
        group.cart.id || "",
        group.cart.name || "",
        group.cart.menu || "",
        participant.participantCode || "",
        participant.name || "",
        participant.username || "",
      ]);
    });
  });

  if (rows.length === 1) {
    alert("Tidak ada data belum ambil untuk diexport.");
    return;
  }

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const suffix = state.missingCartId === "all" ? "semua-booth" : state.missingCartId.toLowerCase();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `belum-ambil-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

onAuthStateChanged(auth, async (user) => {
  state.loading = true;
  state.busy = false;
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

  renderLoading("Menghubungkan akun... Jika halaman ini terlalu lama, cek koneksi internet dan Firebase Rules.");

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
    console.error("Auth init error:", error);
    state.loading = false;
    state.authUser = null;
    state.currentUser = null;

    await signOut(auth).catch(() => {});

    const errorText = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
    const isPermissionDenied = errorText.includes("permission-denied") || errorText.includes("permission denied");

    renderError(
      isPermissionDenied ? "Rules Firebase belum benar" : "Akun belum aktif",
      friendlyFirebaseError(error) || "Silakan hubungi panitia untuk aktivasi akun."
    );
  }
});
