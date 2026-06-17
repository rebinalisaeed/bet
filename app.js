import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2ENjViKDRHwwBUGTjrDJMrnrQePGhDqY",
  authDomain: "kurdliga1.firebaseapp.com",
  databaseURL: "https://kurdliga1-default-rtdb.firebaseio.com",
  projectId: "kurdliga1",
  storageBucket: "kurdliga1.firebasestorage.app",
  messagingSenderId: "799164130957",
  appId: "1:799164130957:web:a3ff5ec1ccb026ca59a4c4",
  measurementId: "G-8TCVRT6GNK"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
await setPersistence(auth, browserLocalPersistence);

const page = detectPage();

function detectPage() {
  const bodyPage = document.body?.dataset?.page;
  if (bodyPage) return bodyPage;

  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file === "" || file === "index.html") return "index";
  if (file.includes("login")) return "login";
  if (file.includes("register")) return "register";
  if (file.includes("forgot")) return "forgot-password";
  if (file.includes("my-predictions")) return "my-predictions";
  if (file.includes("market")) return "market";
  if (file.includes("leaderboard")) return "leaderboard";
  if (file.includes("exchange")) return "exchange";
  if (file.includes("home")) return "home";
  return file.replace(".html", "");
}

function $(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function showFieldError(id, message) {
  const wrap = $("wrap-" + id);
  const box = $(id + "Box");
  const error = $(id + "Error");
  wrap?.classList.add("show-error");
  box?.classList.add("error");
  if (error) error.textContent = message;
}

function clearFieldError(id) {
  const wrap = $("wrap-" + id);
  const box = $(id + "Box");
  const error = $(id + "Error");
  wrap?.classList.remove("show-error");
  box?.classList.remove("error");
  if (error) error.textContent = "";
}

function togglePasswordField(id = "password") {
  const password = $(id);
  if (!password) return;
  password.type = password.type === "password" ? "text" : "password";
}

window.togglePassword = togglePasswordField;
window.showError = showFieldError;
window.clearError = clearFieldError;

window.logoutUser = async function() {
  await signOut(auth);
  localStorage.removeItem("kurdligaLoggedIn");
  window.location.href = "login.html";
};

window.toggleSideMenu = function() {
  $("sideMenu")?.classList.toggle("show");
  $("sideOverlay")?.classList.toggle("show");
  $("menuBtn")?.classList.toggle("active");
  $("headerLogo")?.classList.toggle("menu-open");
};

window.closeSideMenu = function() {
  $("sideMenu")?.classList.remove("show");
  $("sideOverlay")?.classList.remove("show");
  $("menuBtn")?.classList.remove("active");
  $("headerLogo")?.classList.remove("menu-open");
};

function initFastTaskbar() {
  document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
    item.style.touchAction = "manipulation";
    item.style.cursor = "pointer";
  });
}

function getBaghdadDateInfo() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);

  const data = {};
  parts.forEach(part => data[part.type] = part.value);

  return {
    dateKey: `${data.year}-${data.month}-${data.day}`,
    hour: Number(data.hour)
  };
}

async function checkDailyReward(userRef, userData) {
  const info = getBaghdadDateInfo();
  if (info.hour < 6) return userData;
  if (userData.lastDailyReward === info.dateKey) return userData;

  const currentCoins = Number(userData.coins || 0);
  const newCoins = currentCoins + 100;

  await updateDoc(userRef, {
    coins: newCoins,
    lastDailyReward: info.dateKey
  });

  const modalTitle = $("modalTitle");
  const rewardModalText = $("rewardModalText");
  const rewardModal = $("rewardModal");
  if (modalTitle && rewardModalText && rewardModal) {
    modalTitle.textContent = "کۆینی ڕۆژانە";
    rewardModalText.textContent = "١٠٠ کۆینی ڕۆژانەت زیادکرا";
    rewardModal.classList.add("show");
  }

  return { ...userData, coins: newCoins, lastDailyReward: info.dateKey };
}

async function loadWallet(user, withDailyReward = false) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;

  let data = userSnap.data();
  if (withDailyReward) data = await checkDailyReward(userRef, data);

  setText("coinsText", data.coins || 0);
  setText("diamondsText", data.diamonds || 0);
  return data;
}

function requireAuth(options = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    await loadWallet(user, options.dailyReward === true);
    if (typeof options.after === "function") options.after(user);
  });
}

function initIndex() {
  setTimeout(() => {
    window.location.href = "login.html";
  }, 6000);
}

function initLogin() {
  document.addEventListener("input", function(e) {
    if (e.target.id === "email") clearFieldError("email");
    if (e.target.id === "password") clearFieldError("password");
  });

  window.login = async function(event) {
    event.preventDefault();
    clearFieldError("email");
    clearFieldError("password");

    const email = $("email")?.value.trim().toLowerCase() || "";
    const password = $("password")?.value || "";
    const loginBtn = $("loginBtn");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return showFieldError("email", "تکایە ئیمەیڵ بنووسە");
    if (!emailPattern.test(email)) return showFieldError("email", "ئیمەیڵەکە دروست نییە");
    if (!password) return showFieldError("password", "تکایە وشەی نهێنی بنووسە");

    try {
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = "تکایە چاوەڕێ بکە...";
      }
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("kurdligaLoggedIn", "true");
      window.location.href = "home.html";
    } catch (error) {
      if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)) {
        showFieldError("password", "ئیمەیڵ یان وشەی نهێنی هەڵەیە");
      } else if (error.code === "auth/invalid-email") {
        showFieldError("email", "ئیمەیڵەکە دروست نییە");
      } else if (error.code === "auth/too-many-requests") {
        showFieldError("password", "هەوڵی زۆرت داوە، تکایە دواتر هەوڵ بدەوە");
      } else {
        showFieldError("password", "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە");
      }
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "چوونەژوورەوە";
      }
    }
  };
}

function initForgotPassword() {
  $("email")?.addEventListener("input", () => clearFieldError("email"));

  window.resetPassword = async function(event) {
    event.preventDefault();
    clearFieldError("email");

    const email = $("email")?.value.trim().toLowerCase() || "";
    const sendBtn = $("sendBtn");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return showFieldError("email", "تکایە ئیمەیڵ بنووسە");
    if (!emailPattern.test(email)) return showFieldError("email", "ئیمەیڵەکە دروست نییە");

    try {
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = "تکایە چاوەڕێ بکە...";
      }
      await sendPasswordResetEmail(auth, email);
      $("successModal")?.classList.add("show");
      setTimeout(() => { window.location.href = "login.html"; }, 2500);
    } catch (error) {
      if (error.code === "auth/user-not-found") showFieldError("email", "هیچ هەژمارێک بەم ئیمەیڵە نەدۆزرایەوە");
      else if (error.code === "auth/invalid-email") showFieldError("email", "ئیمەیڵەکە دروست نییە");
      else showFieldError("email", "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە");
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "ناردنی لینکی گەڕاندنەوە";
      }
    }
  };
}

function initRegister() {
  const southCities = ["هەولێر", "سلێمانی", "دهۆک", "هەڵەبجە", "کەرکوک", "موسڵ"];

  window.loadCities = function() {
    const country = $("country")?.value;
    const city = $("city");
    if (!city) return;
    city.innerHTML = `<option value="">شار هەڵبژێرە</option>`;
    const cities = country === "باشوری کوردستان" || country === "باشور" ? southCities : [];
    cities.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      city.appendChild(opt);
    });
  };

  window.togglePassword = togglePasswordField;

  document.addEventListener("input", function(e) {
    if (e.target?.id) clearFieldError(e.target.id);
  });
  document.addEventListener("change", function(e) {
    if (e.target?.id) clearFieldError(e.target.id);
  });

  window.register = async function(event) {
    event.preventDefault();

    const fields = ["firstName", "secondName", "username", "password", "confirmPassword", "phone", "email", "country", "city", "nationalId"];
    fields.forEach(clearFieldError);
    clearFieldError("terms");

    const data = Object.fromEntries(fields.map(id => [id, $(id)?.value.trim() || ""]));
    data.email = data.email.toLowerCase();
    const terms = $("terms")?.checked;
    const registerBtn = $("registerBtn");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const id of fields) {
      if (!data[id]) {
        showFieldError(id, "ئەم خانەیە پێویستە");
        return;
      }
    }
    if (!emailPattern.test(data.email)) return showFieldError("email", "ئیمەیڵەکە دروست نییە");
    if (data.password.length < 6) return showFieldError("password", "وشەی نهێنی پێویستە لانی کەم ٦ پیت بێت");
    if (data.password !== data.confirmPassword) return showFieldError("confirmPassword", "وشەی نهێنی یەک ناگرێتەوە");
    if (!/^\d+$/.test(data.nationalId)) return showFieldError("nationalId", "ژمارەی پێناس پێویستە تەنها ژمارە بێت");
    if (!terms) return showFieldError("terms", "پێویستە مەرجەکان پەسەند بکەیت");

    try {
      if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.textContent = "تکایە چاوەڕێ بکە...";
      }

      const usernameSnap = await getDocs(query(collection(db, "users"), where("username", "==", data.username)));
      if (!usernameSnap.empty) return showFieldError("username", "ئەم یوزەرناوە پێشتر بەکارهاتووە");

      const nationalSnap = await getDocs(query(collection(db, "users"), where("nationalId", "==", data.nationalId)));
      if (!nationalSnap.empty) return showFieldError("nationalId", "ئەم ژمارەی پێناسە پێشتر بەکارهاتووە");

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: data.firstName,
        secondName: data.secondName,
        username: data.username,
        phone: data.phone,
        email: data.email,
        country: data.country,
        city: data.city,
        nationalId: data.nationalId,
        coins: 1000,
        diamonds: 0,
        createdAt: serverTimestamp()
      });

      $("successModal")?.classList.add("show");
      setTimeout(() => { window.location.href = "login.html"; }, 1800);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") showFieldError("email", "ئەم ئیمەیڵە پێشتر بەکارهاتووە");
      else if (error.code === "auth/invalid-email") showFieldError("email", "ئیمەیڵەکە دروست نییە");
      else if (error.code === "auth/weak-password") showFieldError("password", "وشەی نهێنی لاوازە");
      else showFieldError("email", "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە");
    } finally {
      if (registerBtn) {
        registerBtn.disabled = false;
        registerBtn.textContent = "خۆتۆمارکردن";
      }
    }
  };
}

function initProtectedSimple() {
  initFastTaskbar();
  requireAuth();
}

function initExchange() {
  initProtectedSimple();
  window.calcExchange = function() {
    const v = Number($("coinAmount")?.value || 0);
    setText("diamondResult", "💎 " + Math.floor(v / 100));
  };
}

function initMyPredictions() {
  initProtectedSimple();

  let currentUser = null;
  let allArchives = [];
  let rangeStart = new Date();
  let rangeEnd = new Date();
  let calendarMonth = new Date();
  let selectedStartDate = null;
  let selectedEndDate = null;

  function pad(n) { return String(n).padStart(2, "0"); }
  function startOfDay(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
  function endOfDay(date) { const d = new Date(date); d.setHours(23,59,59,999); return d; }
  function formatDateOnly(date) { return `${pad(date.getDate())}/${pad(date.getMonth()+1)}/${date.getFullYear()}`; }
  function formatDateTime(ts) {
    if (!ts?.toDate) return "بەروار نەزانراوە";
    return new Intl.DateTimeFormat("ku-IQ", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }).format(ts.toDate());
  }
  function formatPoint(value) { return Number(value || 0).toFixed(2); }

  function setRange(start, end) {
    rangeStart = start;
    rangeEnd = end;
    const display = $("rangeDisplay");
    if (display) display.textContent = `${formatDateOnly(start)} 00:00 - ${formatDateOnly(end)} 23:59`;
    updateRangePreview();
  }

  window.openRangeModal = function() { $("rangeModal")?.classList.add("show"); renderCalendar(); updateRangePreview(); };
  window.closeRangeByOverlay = function(event) { if (event.target?.id === "rangeModal") $("rangeModal")?.classList.remove("show"); };
  window.setQuickActive = function() {};
  window.setQuickRange = function(type) {
    const today = new Date();
    let start = startOfDay(today);
    let end = endOfDay(today);
    if (type === "yesterday") { start.setDate(start.getDate()-1); end = endOfDay(start); }
    if (type === "last7") { start.setDate(start.getDate()-6); }
    if (type === "last30") { start.setDate(start.getDate()-29); }
    if (type === "thisMonth") { start = new Date(today.getFullYear(), today.getMonth(), 1); end = endOfDay(today); }
    selectedStartDate = start;
    selectedEndDate = end;
    setRange(start, end);
    renderCalendar();
  };
  window.changeMonth = function(dir) { calendarMonth.setMonth(calendarMonth.getMonth()+dir); renderCalendar(); };

  function renderCalendar() {
    const monthTitle = $("monthTitle");
    const daysGrid = $("daysGrid");
    if (!monthTitle || !daysGrid) return;
    monthTitle.textContent = new Intl.DateTimeFormat("ku-IQ", { month:"long", year:"numeric" }).format(calendarMonth);
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0).getDate();
    let html = "";
    for (let i=0; i<first.getDay(); i++) html += `<span></span>`;
    for (let d=1; d<=last; d++) {
      const date = new Date(y, m, d);
      const active = selectedStartDate && selectedEndDate && date >= startOfDay(selectedStartDate) && date <= endOfDay(selectedEndDate);
      html += `<button class="day-cell ${active ? "active" : ""}" onclick="selectCalendarDate(${y},${m},${d})">${d}</button>`;
    }
    daysGrid.innerHTML = html;
  }

  window.selectCalendarDate = function(y, m, d) {
    const date = new Date(y, m, d);
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      selectedStartDate = startOfDay(date);
      selectedEndDate = null;
    } else {
      selectedEndDate = endOfDay(date);
      if (selectedEndDate < selectedStartDate) [selectedStartDate, selectedEndDate] = [startOfDay(date), endOfDay(selectedStartDate)];
      setRange(selectedStartDate, selectedEndDate);
    }
    renderCalendar();
    updateRangePreview();
  };

  window.updateRangePreview = updateRangePreview;
  function updateRangePreview() {
    const preview = $("rangePreview");
    if (!preview) return;
    const st = $("startTimeInput")?.value || "00:00";
    const et = $("endTimeInput")?.value || "23:59";
    preview.textContent = `${formatDateOnly(rangeStart)} ${st} - ${formatDateOnly(rangeEnd)} ${et}`;
  }

  window.applyRangeFromModal = function() {
    if (selectedStartDate && selectedEndDate) setRange(selectedStartDate, selectedEndDate);
    $("rangeModal")?.classList.remove("show");
    loadArchive();
  };
  window.resetRangeModal = function() {
    const start = startOfDay(new Date()); start.setDate(start.getDate()-1);
    const end = endOfDay(new Date());
    selectedStartDate = start; selectedEndDate = end;
    setRange(start, end); renderCalendar();
  };

  window.applyFilters = function() { renderArchive(filterArchives()); };
  window.toggleCard = function(id) { $(id)?.classList.toggle("open"); };

  function getGameStatus(item) {
    if (item.gameStatus === "win" || item.status === "win" || item.isWin === true) return "win";
    if (item.gameStatus === "lost" || item.status === "lost" || item.isWin === false) return "lost";
    return "pending";
  }
  function statusText(s) { return s === "win" ? "براوە" : s === "lost" ? "دۆڕاو" : "چاوەڕێ"; }
  function slipStatus(items) {
    if (!items?.length) return "pending";
    const statuses = items.map(getGameStatus);
    if (statuses.includes("pending")) return "pending";
    if (statuses.every(s => s === "win")) return "win";
    return "lost";
  }
  function slipStatusText(s) { return s === "win" ? "باری پسولە: براوە" : s === "lost" ? "باری پسولە: سوتاوە" : "باری پسولە: چاوەڕێ"; }
  function statusClass(s) { return s === "win" ? "win" : s === "lost" ? "lost" : ""; }

  function filterArchives() {
    const betNo = $("betNoInput")?.value.trim().replace("#", "").toLowerCase() || "";
    if (!betNo) return allArchives;
    return allArchives.filter(item => String(item.betNo || item.id || "").toLowerCase().includes(betNo));
  }

  async function loadArchive() {
    const archiveList = $("archiveList");
    if (!currentUser || !archiveList) return;
    archiveList.innerHTML = `<div class="empty-box">چاوەڕێ بکە...</div>`;
    try {
      const st = $("startTimeInput")?.value || "00:00";
      const et = $("endTimeInput")?.value || "23:59";
      const [sh, sm] = st.split(":").map(Number);
      const [eh, em] = et.split(":").map(Number);
      const start = new Date(rangeStart); start.setHours(sh||0, sm||0, 0, 0);
      const end = new Date(rangeEnd); end.setHours(eh||23, em||59, 59, 999);

      const archiveRef = collection(db, "users", currentUser.uid, "predictionArchive");
      const q = query(archiveRef, where("createdAt", ">=", Timestamp.fromDate(start)), where("createdAt", "<=", Timestamp.fromDate(end)), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      allArchives = [];
      snap.forEach(d => allArchives.push({ id: d.id, ...d.data() }));
      renderArchive(filterArchives());
    } catch (error) {
      archiveList.innerHTML = `<div class="empty-box">هەڵە ڕوویدا: ${error.code || ""}<br>${error.message || ""}</div>`;
    }
  }

  function renderArchive(list) {
    const archiveList = $("archiveList");
    if (!archiveList) return;
    if (!list?.length) {
      archiveList.innerHTML = `<div class="empty-box">هیچ پسولەیەک لەم ماوەیەدا نەدۆزرایەوە.</div>`;
      return;
    }
    archiveList.innerHTML = list.map((data) => {
      const items = data.items || [];
      const s = slipStatus(items);
      const cardId = "archiveCard_" + data.id;
      const betNo = data.betNo || String(data.id).slice(0, 8);
      const matchesHtml = items.map(item => {
        const gs = getGameStatus(item);
        return `<div class="match-item"><div><div class="match-name">${item.matchName || ""}</div><div class="pick-line">${item.pickTitle || ""} | پۆینت: <b>${formatPoint(item.point)}</b></div></div><span class="game-status ${statusClass(gs)}">${statusText(gs)}</span></div>`;
      }).join("");
      return `<div class="archive-card" id="${cardId}"><div class="archive-summary" onclick="toggleCard('${cardId}')"><div class="archive-top"><span class="status ${statusClass(s)}">${slipStatusText(s)}</span><span class="date-text">${formatDateTime(data.createdAt)}</span></div><div class="summary-title">پسولە #${betNo}</div><div class="summary-sub">${items.length} یاری | کۆین: ${data.stake || 0} | تۆتال: ${formatPoint(data.totalPoint)}</div></div><div class="archive-content"><div class="info-grid"><div class="info-box"><span>کۆین</span><b>${data.stake || 0}</b></div><div class="info-box"><span>تۆتال پۆینت</span><b>${formatPoint(data.totalPoint)}</b></div><div class="info-box"><span>بردنەوەی پێشبینی</span><b>${data.possibleWin || 0}</b></div></div>${matchesHtml}</div></div>`;
    }).join("");
  }

  const start = startOfDay(new Date()); start.setDate(start.getDate()-1);
  const end = endOfDay(new Date());
  selectedStartDate = start; selectedEndDate = end; setRange(start, end);
  renderCalendar();

  onAuthStateChanged(auth, async (user) => {
    if (!user) return window.location.href = "login.html";
    currentUser = user;
    await loadWallet(user);
    await loadArchive();
  });
}

function initHome() {
  const API_KEY = "e2340a5855ed7305d99931d0614b59c1";
      const API_BASE = "https://v3.football.api-sports.io";
      const WORLD_CUP_LEAGUE_ID = 1;
      const WORLD_CUP_SEASON = 2026;
      const LIVE_REFRESH_MS = 10000;
  
      let matchesByOffset = {};
      let liveRefreshTimer = null;
  
      const teamTranslations = {
        "Mexico": "مەکسیک",
        "South Africa": "ئەفریقای باشوور",
        "South Korea": "کۆریای باشوور",
        "Czechia": "چیکیا",
        "Canada": "کەنەدا",
        "Bosnia and Herzegovina": "بۆسنە و هەرسەک",
        "Qatar": "قەتەر",
        "Switzerland": "سویسرا",
        "United States": "ویلایەتە یەکگرتووەکان",
        "USA": "ویلایەتە یەکگرتووەکان",
        "Paraguay": "پاراگوای",
        "Brazil": "بەرازیل",
        "Morocco": "مەغریب",
        "Haiti": "هایتی",
        "Scotland": "سکۆتلەندا",
        "Australia": "ئوسترالیا",
        "Turkey": "تورکیا",
        "Germany": "ئەڵمانیا",
        "Curacao": "کوراساو",
        "Ivory Coast": "کۆت دیڤوار",
        "Côte d'Ivoire": "کۆت دیڤوار",
        "Ecuador": "ئیکوادۆر",
        "Netherlands": "هۆڵەندا",
        "Japan": "ژاپۆن",
        "Sweden": "سوید",
        "Tunisia": "تونس",
        "Spain": "ئیسپانیا",
        "Cape Verde": "کەیپ ڤێرد",
        "Saudi Arabia": "سعودیە",
        "Uruguay": "ئوروگوای",
        "Belgium": "بەلجیکا",
        "Egypt": "میسر",
        "Iran": "ئێران",
        "New Zealand": "نیوزیلەندا",
        "France": "فەرەنسا",
        "Senegal": "سینیگال",
        "Iraq": "عێراق",
        "Norway": "نەرویج",
        "Argentina": "ئەرجەنتین",
        "Algeria": "جەزائیر",
        "Austria": "نەمسا",
        "Jordan": "ئوردن",
        "Portugal": "پورتوگال",
        "DR Congo": "کۆنگۆی دیموکراتی",
        "Congo DR": "کۆنگۆی دیموکراتی",
        "Uzbekistan": "ئوزبەکستان",
        "Colombia": "کۆلۆمبیا",
        "England": "ئینگلتەرا",
        "Croatia": "کرواتیا",
        "Ghana": "غەنا",
        "Panama": "پاناما"
      };
  
      const teamGroups = {
        "Mexico": "A", "South Africa": "A", "South Korea": "A", "Czechia": "A",
        "Canada": "B", "Bosnia and Herzegovina": "B", "Qatar": "B", "Switzerland": "B",
        "Brazil": "C", "Morocco": "C", "Haiti": "C", "Scotland": "C",
        "United States": "D", "USA": "D", "Paraguay": "D", "Australia": "D", "Turkey": "D",
        "Germany": "E", "Curacao": "E", "Ivory Coast": "E", "Côte d'Ivoire": "E", "Ecuador": "E",
        "Netherlands": "F", "Japan": "F", "Sweden": "F", "Tunisia": "F",
        "Belgium": "G", "Egypt": "G", "Iran": "G", "New Zealand": "G",
        "Spain": "H", "Cape Verde": "H", "Saudi Arabia": "H", "Uruguay": "H",
        "France": "I", "Senegal": "I", "Iraq": "I", "Norway": "I",
        "Argentina": "J", "Algeria": "J", "Austria": "J", "Jordan": "J",
        "Portugal": "K", "DR Congo": "K", "Congo DR": "K", "Uzbekistan": "K", "Colombia": "K",
        "England": "L", "Croatia": "L", "Ghana": "L", "Panama": "L"
      };
  
      const weekDaysKu = ["یەکشەممە","دووشەممە","سێشەممە","چوارشەممە","پێنجشەممە","هەینی","شەممە"];
      const monthNamesKu = ["کانوونی دووەم","شوبات","ئازار","نیسان","ئایار","حوزەیران","تەمموز","ئاب","ئەیلوول","تشرینی یەکەم","تشرینی دووەم","کانوونی یەکەم"];
  
      let selectedOffset = 0;
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartY = 0;
      let dateScrollTimer = null;
      let dateBannerDragging = false;
      let dateBannerMoved = false;
      let dateBannerStartX = 0;
      let adIndex = 0;
      let adTouchStartX = 0;
      let adTouchEndX = 0;
      let slip = [];
      const SLIP_STORAGE_KEY = "kurdliga_saved_bet_slip_v1";
      let pendingTimer = null;
      let pendingCountdown = 6;
      let liveOnlyMode = false;
  
      function formatPoint(value) {
        if (value === undefined || value === null || value === "") return "--";
        return Number(value).toFixed(2);
      }
  
      function getSlipTotalPoint() {
        if (slip.length === 0) return 0;
        return slip.reduce((total, item) => total * Number(item.point), 1);
      }
  
      function saveSlipToStorage() {
        try {
          const stakeInput = document.getElementById("stakeInput");
          const savedData = {
            slip,
            stake: stakeInput ? stakeInput.value : "",
            savedAt: Date.now()
          };
          localStorage.setItem(SLIP_STORAGE_KEY, JSON.stringify(savedData));
        } catch (error) {
          console.warn("Could not save slip:", error);
        }
      }
  
      function loadSlipFromStorage() {
        try {
          const raw = localStorage.getItem(SLIP_STORAGE_KEY);
          if (!raw) return;
  
          const savedData = JSON.parse(raw);
          if (Array.isArray(savedData.slip)) {
            slip = savedData.slip;
          }
  
          const stakeInput = document.getElementById("stakeInput");
          if (stakeInput && savedData.stake !== undefined) {
            stakeInput.value = savedData.stake;
          }
        } catch (error) {
          console.warn("Could not load slip:", error);
          localStorage.removeItem(SLIP_STORAGE_KEY);
        }
      }
  
      function clearSlipStorage() {
        try {
          localStorage.removeItem(SLIP_STORAGE_KEY);
        } catch (error) {
          console.warn("Could not clear slip:", error);
        }
      }
  
      function toggleSideMenu() {
        const menu = document.getElementById("sideMenu");
        const overlay = document.getElementById("sideOverlay");
        const btn = document.getElementById("menuBtn");
        const logo = document.getElementById("headerLogo");
  
        menu.classList.toggle("show");
        overlay.classList.toggle("show");
        btn.classList.toggle("active");
        logo.classList.toggle("menu-open");
      }
  
      function closeSideMenu() {
        document.getElementById("sideMenu").classList.remove("show");
        document.getElementById("sideOverlay").classList.remove("show");
        document.getElementById("menuBtn").classList.remove("active");
        document.getElementById("headerLogo").classList.remove("menu-open");
      }
  
      function getDateByOffset(offset) {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return date;
      }
  
      function getDateLabel(offset) {
        if (offset === 0) return "ئەمڕۆ";
        if (offset === 1) return "سبەی";
        if (offset === -1) return "دوێنێ";
        const date = getDateByOffset(offset);
        return `${date.getDate()} ${monthNamesKu[date.getMonth()]}`;
      }
  
      function getDateSub(offset) {
        return weekDaysKu[getDateByOffset(offset).getDay()];
      }
  
      function renderDateBanner() {
        const banner = document.getElementById("dateBanner");
        let html = "";
  
        for (let i = -10; i <= 10; i++) {
          html += `
            <div class="date-item ${i === 0 ? "active" : ""}" data-offset="${i}">
              <div class="date-title">${getDateLabel(i)}</div>
              <div class="date-sub">${getDateSub(i)}</div>
            </div>
          `;
        }
  
        banner.innerHTML = html;
  
        document.querySelectorAll(".date-item").forEach(item => {
          item.addEventListener("click", () => {
            if (dateBannerMoved) return;
            selectDay(Number(item.dataset.offset), true);
          });
        });
  
        enableDateBannerSmoothScroll();
  
        setTimeout(() => {
          centerDateItem(0, "auto");
        }, 200);
      }
  
      function centerDateItem(offset, behavior = "smooth") {
        const item = document.querySelector(`.date-item[data-offset="${offset}"]`);
        const banner = document.getElementById("dateBanner");
        if (!item || !banner) return;
  
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const target = itemCenter - banner.clientWidth / 2;
        banner.scrollTo({ left: target, behavior });
      }
  
      function getCenteredDateOffset() {
        const banner = document.getElementById("dateBanner");
        const items = Array.from(document.querySelectorAll(".date-item"));
        if (!banner || !items.length) return selectedOffset;
  
        const bannerRect = banner.getBoundingClientRect();
        const bannerCenter = bannerRect.left + bannerRect.width / 2;
  
        let closest = items[0];
        let closestDistance = Infinity;
  
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const distance = Math.abs(itemCenter - bannerCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = item;
          }
        });
  
        return Number(closest.dataset.offset || selectedOffset);
      }
  
      function syncDateBannerAfterScroll() {
        const offset = getCenteredDateOffset();
        if (offset === selectedOffset) {
          centerDateItem(offset, "smooth");
          return;
        }
        selectDay(offset, false);
        setTimeout(() => centerDateItem(offset, "smooth"), 30);
      }
  
      function enableDateBannerSmoothScroll() {
        const banner = document.getElementById("dateBanner");
        if (!banner || banner.dataset.ready === "1") return;
        banner.dataset.ready = "1";
  
        banner.addEventListener("touchstart", e => {
          dateBannerDragging = true;
          dateBannerMoved = false;
          dateBannerStartX = e.changedTouches[0].screenX;
          banner.classList.add("dragging");
        }, { passive: true });
  
        banner.addEventListener("touchmove", e => {
          if (Math.abs(e.changedTouches[0].screenX - dateBannerStartX) > 8) {
            dateBannerMoved = true;
          }
        }, { passive: true });
  
        banner.addEventListener("touchend", () => {
          dateBannerDragging = false;
          banner.classList.remove("dragging");
          clearTimeout(dateScrollTimer);
          dateScrollTimer = setTimeout(syncDateBannerAfterScroll, 90);
          setTimeout(() => { dateBannerMoved = false; }, 180);
        }, { passive: true });
  
        banner.addEventListener("scroll", () => {
          if (dateBannerDragging) return;
          clearTimeout(dateScrollTimer);
          dateScrollTimer = setTimeout(syncDateBannerAfterScroll, 130);
        }, { passive: true });
      }
  
      function getApiDateByOffset(offset) {
        const date = getDateByOffset(offset);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
  
      function getKurdishTeamName(team) {
        if (!team) return "";
        return teamTranslations[team.name] || team.name;
      }
  
      function getWorldCupGroup(homeTeam, awayTeam) {
        const homeGroup = teamGroups[homeTeam?.name] || teamGroups[homeTeam?.code];
        const awayGroup = teamGroups[awayTeam?.name] || teamGroups[awayTeam?.code];
        return homeGroup || awayGroup || "";
      }
  
      function getKurdishLeagueName(league, homeTeam, awayTeam) {
        const group = getWorldCupGroup(homeTeam, awayTeam);
  
        if (group) {
          return `جامی جیهان - گرووپ ${group}`;
        }
  
        const round = String(league?.round || "");
        const groupLetter = round.match(/Group\s+([A-L])/i)?.[1];
  
        if (groupLetter) {
          return `جامی جیهان - گرووپ ${groupLetter.toUpperCase()}`;
        }
  
        if (round) {
          return `جامی جیهان - ${round}`;
        }
  
        return "جامی جیهان";
      }
  
      function isLiveStatus(shortStatus) {
        return ["1H", "HT", "2H", "ET", "P", "BT", "INT", "LIVE"].includes(shortStatus);
      }
  
      function isFinishedStatus(shortStatus) {
        return ["FT", "AET", "PEN"].includes(shortStatus);
      }
  
      function makeDemoPoints(homeId, awayId) {
        const hSeed = Number(homeId || 11) % 9;
        const aSeed = Number(awayId || 17) % 9;
        const homePoint = 1.55 + (aSeed * 0.12);
        const awayPoint = 1.65 + (hSeed * 0.12);
        const drawPoint = 2.80 + (((hSeed + aSeed) % 6) * 0.15);
        return {
          homePoint: Number(homePoint.toFixed(2)),
          drawPoint: Number(drawPoint.toFixed(2)),
          awayPoint: Number(awayPoint.toFixed(2))
        };
      }
  
  
      function getDemoFixtures(offset) {
        const demo = {
          "-1": [
            {
              id:"demo_y_1", league:"Group J", time:"21:00", home:"ئەرجەنتین", away:"جەزائیر",
              homeLogo:"", awayLogo:"", homeScore:3, awayScore:0, isFinished:true, isLive:false,
              homePoint:1.55, drawPoint:3.20, awayPoint:2.70
            },
            {
              id:"demo_y_2", league:"Group I", time:"18:00", home:"عێراق", away:"نەرویج",
              homeLogo:"", awayLogo:"", homeScore:1, awayScore:4, isFinished:true, isLive:false,
              homePoint:2.40, drawPoint:3.10, awayPoint:1.85
            }
          ],
          "0": [
            {
              id:"demo_live_30", league:"Group J", time:"30'", home:"نەمسا", away:"ئوردن",
              homeLogo:"", awayLogo:"", homeScore:1, awayScore:0, isFinished:false, isLive:true, statusShort:"1H", statusText:"30'",
              homePoint:1.70, drawPoint:3.25, awayPoint:2.35
            },
            {
              id:"demo_t_1", league:"Group K", time:"20:00", home:"پورتوگال", away:"کۆنگۆی دیموکراتی",
              homeLogo:"", awayLogo:"", isFinished:false, isLive:false,
              homePoint:1.50, drawPoint:3.40, awayPoint:2.90
            },
            {
              id:"demo_t_2", league:"Group L", time:"23:00", home:"ئینگلتەرا", away:"کرواتیا",
              homeLogo:"", awayLogo:"", isFinished:false, isLive:false,
              homePoint:1.85, drawPoint:3.10, awayPoint:2.15
            }
          ],
          "1": [
            {
              id:"demo_tm_1", league:"Group A", time:"19:00", home:"چیکیا", away:"ئەفریقای باشوور",
              homeLogo:"", awayLogo:"", isFinished:false, isLive:false,
              homePoint:1.95, drawPoint:3.05, awayPoint:2.10
            },
            {
              id:"demo_tm_2", league:"Group B", time:"22:00", home:"سویسرا", away:"بۆسنە و هەرسەک",
              homeLogo:"", awayLogo:"", isFinished:false, isLive:false,
              homePoint:1.75, drawPoint:3.30, awayPoint:2.30
            }
          ]
        };
        return demo[String(offset)] || [];
      }
  
      function mergeDemoLiveIfNeeded(offset, list) {
        const demo = getDemoFixtures(offset);
        if (offset === 0) {
          const liveDemo = demo.find(m => m.isLive);
          if (liveDemo && !list.some(m => m.id === liveDemo.id)) {
            return [liveDemo, ...list];
          }
        }
        return list;
      }
  
      function getMatchGroup(match) {
        const raw = String(match.league || "");
        const m = raw.match(/Group\s+([A-L])/i) || raw.match(/گرووپ\s+([A-L])/i);
        return m ? `Group ${m[1].toUpperCase()}` : "Group";
      }
  
      function getGroupOrder(groupName) {
        const m = String(groupName || "").match(/([A-L])/i);
        return m ? m[1].toUpperCase().charCodeAt(0) : 999;
      }
  
      function toggleCompetitionCard() {
        document.getElementById("worldCupCard")?.classList.toggle("closed");
      }
  
      function scrollDateBannerUnderHeader() {
        const dateBanner = document.getElementById("dateBanner");
        if (!dateBanner) return;
  
        const targetTop = Math.max(0, dateBanner.offsetTop - 76);
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
  
      function toggleLiveOnlyMode() {
        liveOnlyMode = !liveOnlyMode;
        document.getElementById("liveFilterBtn")?.classList.toggle("active", liveOnlyMode);
        document.getElementById("dateBanner")?.classList.toggle("live-hidden", liveOnlyMode);
        renderMatches(selectedOffset);
      }
  
      function renderLogo(src, name) {
        if (src) return `<img class="team-logo" src="${src}" alt="${name || ''}">`;
        return `<span class="team-logo" style="display:inline-flex;align-items:center;justify-content:center;font-size:17px;">⚽</span>`;
      }
  
      function normalizeApiFixture(item) {
        const shortStatus = item.fixture?.status?.short || "NS";
        const live = isLiveStatus(shortStatus);
        const finished = isFinishedStatus(shortStatus);
        const points = makeDemoPoints(item.teams?.home?.id, item.teams?.away?.id);
        const kickoff = item.fixture?.date ? new Date(item.fixture.date) : null;
        const time = kickoff
          ? kickoff.toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit", hour12: false })
          : "--:--";
  
        return {
          id: "api_" + item.fixture.id,
          apiFixtureId: item.fixture.id,
          league: getKurdishLeagueName(item.league, item.teams?.home, item.teams?.away),
          time,
          home: getKurdishTeamName(item.teams.home),
          away: getKurdishTeamName(item.teams.away),
          homeLogo: item.teams?.home?.logo || "",
          awayLogo: item.teams?.away?.logo || "",
          homePoint: points.homePoint,
          drawPoint: points.drawPoint,
          awayPoint: points.awayPoint,
          homeScore: (finished || live) ? item.goals?.home : undefined,
          awayScore: (finished || live) ? item.goals?.away : undefined,
          isLive: live,
          isFinished: finished,
          statusShort: shortStatus,
          statusText: item.fixture?.status?.elapsed ? `${item.fixture.status.elapsed}'` : ""
        };
      }
  
      async function fetchApi(path) {
        const response = await fetch(`${API_BASE}${path}`, {
          method: "GET",
          headers: { "x-apisports-key": API_KEY }
        });
  
        const data = await response.json();
  
        if (!response.ok || data.errors?.token || data.errors?.requests) {
          throw new Error(JSON.stringify(data.errors || data));
        }
  
        return data.response || [];
      }
  
      async function loadWorldCupFixtures(offset, options = {}) {
        const silent = options.silent === true;
        const container = document.getElementById("matchesContainer");
        if (!silent) {
          container.innerHTML = `<div class="loading-box">یاریەکانی جامی جیهان بار دەکرێن...</div>`;
        }
  
        try {
          const date = getApiDateByOffset(offset);
          const fixtures = await fetchApi(`/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&date=${date}`);
          let normalized = fixtures.map(normalizeApiFixture);
  
          if (offset === 0) {
            try {
              const liveFixtures = await fetchApi(`/fixtures?live=all`);
              const worldCupLive = liveFixtures
                .filter(item => Number(item.league?.id) === WORLD_CUP_LEAGUE_ID && Number(item.league?.season) === WORLD_CUP_SEASON)
                .map(normalizeApiFixture);
  
              worldCupLive.forEach(liveMatch => {
                const index = normalized.findIndex(match => match.apiFixtureId === liveMatch.apiFixtureId);
                if (index >= 0) normalized[index] = liveMatch;
                else normalized.unshift(liveMatch);
              });
            } catch (liveError) {
              console.warn("Live endpoint skipped:", liveError);
            }
          }
  
          if (normalized.length === 0) {
            normalized = getDemoFixtures(offset);
          } else {
            normalized = mergeDemoLiveIfNeeded(offset, normalized);
          }
  
          matchesByOffset[offset] = normalized;
          renderMatches(offset);
        } catch (error) {
          console.error("World Cup API Error:", error);
          if (!silent) {
            matchesByOffset[offset] = getDemoFixtures(offset);
            renderMatches(offset);
          }
        }
      }
  
      function startLiveRefresh() {
        if (liveRefreshTimer) clearInterval(liveRefreshTimer);
        liveRefreshTimer = setInterval(() => {
          if (selectedOffset === 0) loadWorldCupFixtures(0, { silent: true });
        }, LIVE_REFRESH_MS);
      }
  
      function selectDay(offset, scrollToCenter = false) {
        if (offset < -10 || offset > 10) return;
  
        selectedOffset = offset;
  
        document.querySelectorAll(".date-item").forEach(item => item.classList.remove("active"));
  
        const activeItem = document.querySelector(`.date-item[data-offset="${offset}"]`);
        if (activeItem) {
          activeItem.classList.add("active");
          if (scrollToCenter) {
            centerDateItem(offset, "smooth");
          }
        }
  
        loadWorldCupFixtures(offset);
      }
  
      function escJs(value) {
        return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, " ");
      }
  
      function getLivePhaseText(match) {
        const status = String(match.statusShort || "").toUpperCase();
  
        if (status === "HT") return "پشووی نێوان گێمەکان";
        if (["2H", "ET", "P", "BT"].includes(status)) return "نیوەی دووەم";
        return "نیوەی یەکەم";
      }
  
      function getMatchTimeHtml(match) {
        if (match.isFinished) {
          return `<div class="match-time-row">ئەنجامی کۆتایی</div>`;
        }
  
        if (match.isLive) {
          const phase = getLivePhaseText(match);
  
          if (phase === "پشووی نێوان گێمەکان") {
            return `<div class="match-time-row live-time"><span class="halftime-text">پشووی نێوان گێمەکان</span></div>`;
          }
  
          return `
            <div class="match-time-row live-time">
              <span class="live-time-inner">
                <span class="live-minute">${match.statusText || "30'"}</span>
                <span class="live-phase">${phase}</span>
              </span>
            </div>
          `;
        }
  
        return `<div class="match-time-row">${match.time}</div>`;
      }
  
      function renderFinishedMatch(match) {
        const homeFinalScore = match.homeScore ?? 0;
        const awayFinalScore = match.awayScore ?? 0;
  
        return `
          <div class="final-match-line">
            <div class="final-team home-final-team">
              ${renderLogo(match.homeLogo, match.home)}
              <span class="final-team-name">${match.home}</span>
            </div>
  
            <div class="final-score" title="${match.home}: ${homeFinalScore} - ${match.away}: ${awayFinalScore}">
              <span class="home-final-score">${homeFinalScore}</span>
              <span class="score-dash">-</span>
              <span class="away-final-score">${awayFinalScore}</span>
            </div>
  
            <div class="final-team away-final-team">
              ${renderLogo(match.awayLogo, match.away)}
              <span class="final-team-name">${match.away}</span>
            </div>
          </div>
        `;
      }
  
      function renderVerticalMatch(match) {
        const hasResult = match.homeScore !== undefined && match.homeScore !== null && match.awayScore !== undefined && match.awayScore !== null;
  
        return `
          <div class="match-main-line">
            <div class="team-side home">
              <div class="team-name-wrap">
                ${renderLogo(match.homeLogo, match.home)}
                <span class="team-name-inline">${match.home} <span style="color:#BFC8D4;font-size:13px;">(ماڵ)</span></span>
              </div>
              ${hasResult ? `<div class="team-score-box">${match.homeScore}</div>` : ``}
            </div>
  
            <div class="team-side away">
              <div class="team-name-wrap">
                ${renderLogo(match.awayLogo, match.away)}
                <span class="team-name-inline">${match.away} <span style="color:#BFC8D4;font-size:13px;">(میوان)</span></span>
              </div>
              ${hasResult ? `<div class="team-score-box">${match.awayScore}</div>` : ``}
            </div>
          </div>
        `;
      }
  
      function renderMatches(offset) {
        const container = document.getElementById("matchesContainer");
        const allMatches = matchesByOffset[offset] || [];
        const matches = liveOnlyMode ? allMatches.filter(match => match.isLive) : allMatches;
  
        if (matches.length === 0) {
          container.innerHTML = `<div class="empty-box">${liveOnlyMode ? "هیچ یارییەکی ڕاستەوخۆ نییە" : "هیچ یارییەکی جامی جیهان بۆ ئەم ڕۆژە نییە"}</div>`;
          return;
        }
  
        const grouped = {};
        matches.forEach(match => {
          const group = getMatchGroup(match);
          if (!grouped[group]) grouped[group] = [];
          grouped[group].push(match);
        });
  
        const groupHtml = Object.keys(grouped)
          .sort((a, b) => getGroupOrder(a) - getGroupOrder(b))
          .map(groupName => {
            const items = grouped[groupName].map(match => {
              const selected = slip.find(item => item.matchId === match.id);
              const canPredict = !match.isFinished;
              const home = escJs(match.home);
              const away = escJs(match.away);
  
              return `
                <div class="worldcup-match-row">
                  ${getMatchTimeHtml(match)}
                  ${match.isFinished ? renderFinishedMatch(match) : renderVerticalMatch(match)}
  
                  ${canPredict ? `
                    <div class="points-row">
                      <div class="point-box ${selected?.type === "home" ? "selected" : ""}"
                        onclick="selectPrediction('${match.id}','${home}','${away}','بردنەوەی ماڵ',${match.homePoint},'home')">
                        <div class="point-title">بردنەوەی ماڵ</div>
                        <div class="point-value">${formatPoint(match.homePoint)}</div>
                      </div>
  
                      <div class="point-box draw ${selected?.type === "draw" ? "selected" : ""}"
                        onclick="selectPrediction('${match.id}','${home}','${away}','یەکسان',${match.drawPoint},'draw')">
                        <div class="point-title">یەکسان</div>
                        <div class="point-value">${formatPoint(match.drawPoint)}</div>
                      </div>
  
                      <div class="point-box ${selected?.type === "away" ? "selected" : ""}"
                        onclick="selectPrediction('${match.id}','${home}','${away}','بردنەوەی میوان',${match.awayPoint},'away')">
                        <div class="point-title">بردنەوەی میوان</div>
                        <div class="point-value">${formatPoint(match.awayPoint)}</div>
                      </div>
                    </div>
                  ` : ``}
                </div>
              `;
            }).join("");
  
            return `
              <div class="group-block">
                <div class="group-title">${groupName}</div>
                ${items}
              </div>
            `;
          }).join("");
  
        container.innerHTML = `
          <section class="competition-card" id="worldCupCard">
            <button class="competition-header" onclick="toggleCompetitionCard()">
              <span class="competition-title">🏆 FIFA World Cup</span>
              <span style="display:flex;align-items:center;gap:10px;">
                <span class="competition-count">${matches.length}</span>
                <span class="competition-arrow">⌃</span>
              </span>
            </button>
            <div class="competition-body">
              ${groupHtml}
            </div>
          </section>
        `;
      }
  
      function selectPrediction(matchId, home, away, pickTitle, point, type) {
        const existingIndex = slip.findIndex(item => item.matchId === matchId);
  
        if (existingIndex >= 0 && slip[existingIndex].type === type) {
          slip.splice(existingIndex, 1);
        } else {
          const newItem = {
            matchId,
            matchName: `${home} - ${away}`,
            pickTitle,
            point: Number(point),
            type
          };
  
          if (existingIndex >= 0) slip[existingIndex] = newItem;
          else slip.push(newItem);
        }
  
        saveSlipToStorage();
        renderMatches(selectedOffset);
        renderSlip();
      }
  
      function removeSlipItem(matchId) {
        slip = slip.filter(item => item.matchId !== matchId);
        saveSlipToStorage();
        renderMatches(selectedOffset);
        renderSlip();
      }
  
      function clearSlip() {
        slip = [];
        document.getElementById("stakeInput").value = "";
        clearSlipStorage();
        closeBetSlip();
        renderMatches(selectedOffset);
        renderSlip();
      }
  
      function renderSlip() {
        const toggle = document.getElementById("betSlipToggle");
        const count = document.getElementById("slipCount");
        const totalPoint = document.getElementById("slipTotalPoint");
        const headerTotal = document.getElementById("slipHeaderTotal");
        const body = document.getElementById("slipBody");
        const stakeInput = document.getElementById("stakeInput");
        const submitBtn = document.getElementById("submitSlipBtn");
  
        const stake = Number(stakeInput.value || 0);
        const total = getSlipTotalPoint();
  
        count.textContent = slip.length;
        totalPoint.textContent = formatPoint(total);
        headerTotal.textContent = `${slip.length} یاری | ${formatPoint(total)}`;
  
        submitBtn.disabled = !(slip.length > 0 && stake > 0);
  
        if (slip.length > 0) {
          toggle.classList.add("show");
        } else {
          toggle.classList.remove("show");
          closeBetSlip();
        }
  
        body.innerHTML = slip.length === 0
          ? `<div class="empty-box">هیچ پێشبینییەک هەڵنەبژێردراوە</div>`
          : slip.map(item => `
              <div class="slip-item">
                <div>
                  <div class="slip-match">${item.matchName}</div>
                  <div class="slip-pick">${item.pickTitle} | ${formatPoint(item.point)}</div>
                </div>
                <button class="remove-slip-item" onclick="removeSlipItem('${item.matchId}')">X</button>
              </div>
            `).join("");
  
        document.getElementById("stakeTotalLine").textContent =
          `${stake} × ${formatPoint(total)} = ${Math.floor(stake * total)}`;
  
        saveSlipToStorage();
      }
  
      function toggleBetSlip() {
        document.getElementById("betSlipPanel").classList.toggle("show");
        document.body.classList.toggle("no-scroll", document.getElementById("betSlipPanel").classList.contains("show"));
        renderSlip();
      }
  
      function closeBetSlip() {
        document.getElementById("betSlipPanel").classList.remove("show");
        document.body.classList.remove("no-scroll");
      }
  
      function submitSlip() {
        const stake = Number(document.getElementById("stakeInput").value || 0);
        if (slip.length === 0 || stake <= 0) return;
  
        closeBetSlip();
        pendingCountdown = 6;
        document.getElementById("confirmOverlay").classList.add("show");
        document.getElementById("countdownText").textContent = `${pendingCountdown} چرکە`;
  
        pendingTimer = setInterval(() => {
          pendingCountdown--;
          document.getElementById("countdownText").textContent = `${pendingCountdown} چرکە`;
  
          if (pendingCountdown <= 0) {
            clearInterval(pendingTimer);
            pendingTimer = null;
            document.getElementById("confirmOverlay").classList.remove("show");
            executeSlip();
          }
        }, 1000);
      }
  
      function cancelPendingSlip() {
        if (pendingTimer) {
          clearInterval(pendingTimer);
          pendingTimer = null;
        }
  
        document.getElementById("confirmOverlay").classList.remove("show");
        document.getElementById("betSlipPanel").classList.add("show");
        document.body.classList.add("no-scroll");
      }
  
      function showMessage(title, text) {
        document.getElementById("modalTitle").textContent = title;
        document.getElementById("rewardModalText").textContent = text;
        document.getElementById("rewardModal").classList.add("show");
      }
  
      function enableHomeSwipe() {
        document.body.addEventListener("touchstart", function(e) {
          if (document.getElementById("sideMenu").classList.contains("show")) return;
          if (document.getElementById("betSlipPanel").classList.contains("show")) return;
  
          if (
            e.target.closest(".header") ||
            e.target.closest(".bottom-nav") ||
            e.target.closest(".ad-slider") ||
            e.target.closest(".date-banner") ||
            e.target.closest(".side-menu") ||
            e.target.closest(".bet-slip-panel") ||
            e.target.closest(".bet-slip-toggle")
          ) {
            touchStartX = 0;
            touchStartY = 0;
            return;
          }
  
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
  
        document.body.addEventListener("touchend", function(e) {
          if (document.getElementById("sideMenu").classList.contains("show")) return;
          if (document.getElementById("betSlipPanel").classList.contains("show")) return;
  
          if (
            e.target.closest(".header") ||
            e.target.closest(".bottom-nav") ||
            e.target.closest(".ad-slider") ||
            e.target.closest(".date-banner") ||
            e.target.closest(".side-menu") ||
            e.target.closest(".bet-slip-panel") ||
            e.target.closest(".bet-slip-toggle")
          ) {
            touchEndX = 0;
            return;
          }
  
          touchEndX = e.changedTouches[0].screenX;
          const touchEndY = e.changedTouches[0].screenY;
          handleSwipe(touchEndY);
        }, { passive: true });
      }
  
      function handleSwipe(touchEndY = touchStartY) {
        const diff = touchEndX - touchStartX;
        const verticalDiff = Math.abs(touchEndY - touchStartY);
  
        if (Math.abs(diff) < 45) return;
        if (verticalDiff > Math.abs(diff) * 0.75) return;
  
        if (diff > 0) selectDay(selectedOffset + 1, true);
        else selectDay(selectedOffset - 1, true);
      }
  
      function showAdSlide(index) {
        const slides = document.querySelectorAll(".slide");
        const dots = document.querySelectorAll(".dot");
  
        slides[adIndex].classList.remove("active");
        dots[adIndex].classList.remove("active");
  
        adIndex = (index + slides.length) % slides.length;
  
        slides[adIndex].classList.add("active");
        dots[adIndex].classList.add("active");
      }
  
      function startSlider() {
        setInterval(() => showAdSlide(adIndex + 1), 5000);
      }
  
      function enableAdSwipe() {
        const adSlider = document.getElementById("adSlider");
  
        adSlider.addEventListener("touchstart", e => {
          adTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
  
        adSlider.addEventListener("touchend", e => {
          adTouchEndX = e.changedTouches[0].screenX;
          const diff = adTouchEndX - adTouchStartX;
  
          if (Math.abs(diff) < 45) return;
  
          if (diff > 0) showAdSlide(adIndex - 1);
          else showAdSlide(adIndex + 1);
        }, { passive: true });
      }
  
      function closeRewardModal() {
        document.getElementById("rewardModal").classList.remove("show");
      }
  
      window.addEventListener("beforeunload", saveSlipToStorage);
  
      renderDateBanner();
      loadSlipFromStorage();
      renderSlip();
      selectDay(0);
      enableHomeSwipe();
      enableAdSwipe();
      startSlider();
      startLiveRefresh();

  async function executeSlip() {
    try {
      if (!currentUser || !currentUserData) {
        showMessage("هەڵە", "تکایە دووبارە بچۆ ژوورەوە");
        return;
      }

      const stake = Number(document.getElementById("stakeInput")?.value || 0);
      const totalPoint = getSlipTotalPoint();
      const possibleWin = Math.floor(stake * totalPoint);
      const currentCoins = Number(currentUserData.coins || 0);

      if (stake <= 0 || slip.length === 0) {
        showMessage("هەڵە", "پسولەکە بەتاڵە");
        return;
      }

      if (stake > currentCoins) {
        showMessage("کۆین ناکات", "بڕی کۆینەکەت کەمترە لە بڕی پسولەکە");
        document.getElementById("betSlipPanel")?.classList.add("show");
        document.body.classList.add("no-scroll");
        return;
      }

      const archiveData = {
        userId: currentUser.uid,
        items: slip,
        stake,
        totalPoint: Number(totalPoint.toFixed(2)),
        possibleWin,
        status: "pending",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "users", currentUser.uid, "predictionArchive"), archiveData);

      const newCoins = currentCoins - stake;
      await updateDoc(doc(db, "users", currentUser.uid), { coins: newCoins });

      currentUserData.coins = newCoins;
      const coinsText = document.getElementById("coinsText");
      if (coinsText) coinsText.textContent = newCoins;

      slip = [];
      const stakeInput = document.getElementById("stakeInput");
      if (stakeInput) stakeInput.value = "";
      clearSlipStorage();
      renderSlip();
      renderMatches(selectedOffset);
      showMessage("سەرکەوتوو بوو", "پسولەکە جێبەجێ کرا و چووە بەشی ئەرشیف");
    } catch (error) {
      console.error("Slip Error:", error);
      showMessage("هەڵە", (error.code || "") + " - " + (error.message || "پسولەکە جێبەجێ نەکرا"));
    }
  }

  let currentUser = null;
  let currentUserData = null;

  window.executeSlip = executeSlip;
  window.toggleSideMenu = toggleSideMenu;
  window.closeSideMenu = closeSideMenu;
  window.toggleCompetitionCard = toggleCompetitionCard;
  window.toggleLiveOnlyMode = toggleLiveOnlyMode;
  window.selectPrediction = selectPrediction;
  window.removeSlipItem = removeSlipItem;
  window.clearSlip = clearSlip;
  window.renderSlip = renderSlip;
  window.toggleBetSlip = toggleBetSlip;
  window.closeBetSlip = closeBetSlip;
  window.submitSlip = submitSlip;
  window.cancelPendingSlip = cancelPendingSlip;
  window.closeRewardModal = closeRewardModal;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    currentUser = user;
    currentUserData = await loadWallet(user, true);
  });
}

if (page === "index") initIndex();
else if (page === "login") initLogin();
else if (page === "register") initRegister();
else if (page === "forgot-password") initForgotPassword();
else if (page === "home") initHome();
else if (page === "my-predictions") initMyPredictions();
else if (page === "exchange") initExchange();
else if (["market", "leaderboard"].includes(page)) initProtectedSimple();
else initFastTaskbar();
