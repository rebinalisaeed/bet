import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import { getFirestore, doc, getDoc, collection, query, orderBy, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    let currentUser = null;
    let allArchives = [];
    let selectedStartDate = null;
    let selectedEndDate = null;
    let calendarMonth = new Date();
    const monthNamesKu = ["کانوونی دووەم","شوبات","ئازار","نیسان","ئایار","حوزەیران","تەمموز","ئاب","ئەیلوول","تشرینی یەکەم","تشرینی دووەم","کانوونی یەکەم"];

    function two(n) { return String(n).padStart(2, "0"); }
    function formatPoint(value) { return value === undefined || value === null || value === "" ? "0.00" : Number(value).toFixed(2); }
    function formatDateOnly(date) { return `${two(date.getDate())}/${two(date.getMonth() + 1)}/${date.getFullYear()}`; }
    function formatTime(date) { return `${two(date.getHours())}:${two(date.getMinutes())}`; }

    function formatDate(timestamp) {
      if (!timestamp || !timestamp.toDate) return "بەروار نەزانراوە";
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("ku-IQ", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }).format(date);
    }

    function getStartOfDay(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
    function getEndOfDay(date) { const d = new Date(date); d.setHours(23,59,59,999); return d; }

    function setDefaultRange() {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      selectedStartDate = getStartOfDay(start);
      selectedEndDate = getEndOfDay(new Date());
      calendarMonth = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), 1);
      setRangeDisplay();
    }

    function setRangeDisplay() {
      document.getElementById("rangeDisplay").innerHTML = `<strong>${formatDateOnly(selectedStartDate)} ${formatTime(selectedStartDate)}</strong> - <strong>${formatDateOnly(selectedEndDate)} ${formatTime(selectedEndDate)}</strong>`;
    }

    function updateRangePreview() {
      const sTime = document.getElementById("startTimeInput").value || "00:00";
      const eTime = document.getElementById("endTimeInput").value || "23:59";
      document.getElementById("rangePreview").textContent = `${formatDateOnly(selectedStartDate)} ${sTime} - ${formatDateOnly(selectedEndDate)} ${eTime}`;
    }

    window.openRangeModal = function() {
      document.getElementById("rangeModal").classList.add("show");
      document.body.classList.add("no-scroll");
      document.getElementById("startTimeInput").value = formatTime(selectedStartDate);
      document.getElementById("endTimeInput").value = formatTime(selectedEndDate);
      renderCalendar();
      updateRangePreview();
    };

    window.closeRangeByOverlay = function(event) {
      if (event.target.id === "rangeModal") closeRangeModal();
    };

    function closeRangeModal() {
      document.getElementById("rangeModal").classList.remove("show");
      document.body.classList.remove("no-scroll");
    }

    window.setQuickActive = function(type) {
      ["qToday","qYesterday","q7","q30","qMonth","qCustom"].forEach(id => document.getElementById(id).classList.remove("active"));
      const map = { today:"qToday", yesterday:"qYesterday", last7:"q7", last30:"q30", thisMonth:"qMonth", custom:"qCustom" };
      if (map[type]) document.getElementById(map[type]).classList.add("active");
    };

    window.setQuickRange = function(type) {
      setQuickActive(type);
      const now = new Date();
      if (type === "today") { selectedStartDate = getStartOfDay(now); selectedEndDate = getEndOfDay(now); }
      if (type === "yesterday") { const y = new Date(); y.setDate(y.getDate() - 1); selectedStartDate = getStartOfDay(y); selectedEndDate = getEndOfDay(y); }
      if (type === "last7") { const s = new Date(); s.setDate(s.getDate() - 6); selectedStartDate = getStartOfDay(s); selectedEndDate = getEndOfDay(now); }
      if (type === "last30") { const s = new Date(); s.setDate(s.getDate() - 29); selectedStartDate = getStartOfDay(s); selectedEndDate = getEndOfDay(now); }
      if (type === "thisMonth") { selectedStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0); selectedEndDate = getEndOfDay(now); }
      calendarMonth = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), 1);
      document.getElementById("startTimeInput").value = formatTime(selectedStartDate);
      document.getElementById("endTimeInput").value = formatTime(selectedEndDate);
      renderCalendar();
      updateRangePreview();
    };

    window.changeMonth = function(amount) {
      calendarMonth.setMonth(calendarMonth.getMonth() + amount);
      renderCalendar();
    };

    function sameDay(a,b) { return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
    function stripTime(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }

    function renderCalendar() {
      document.getElementById("monthTitle").textContent = `${monthNamesKu[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
      const grid = document.getElementById("daysGrid");
      const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
      const start = new Date(first);
      start.setDate(first.getDate() - first.getDay());
      let html = "";
      const sDay = stripTime(selectedStartDate);
      const eDay = stripTime(selectedEndDate);

      for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const other = d.getMonth() !== calendarMonth.getMonth() ? "other" : "";
        const selectedStart = sameDay(d, selectedStartDate) ? "selected-start" : "";
        const selectedEnd = sameDay(d, selectedEndDate) ? "selected-end" : "";
        const inRange = stripTime(d) >= sDay && stripTime(d) <= eDay ? "in-range" : "";
        html += `<div class="day-cell ${other} ${inRange} ${selectedStart} ${selectedEnd}" onclick="pickDate('${d.toISOString()}')">${d.getDate()}</div>`;
      }
      grid.innerHTML = html;
    }

    window.pickDate = function(iso) {
      setQuickActive("custom");
      const d = new Date(iso);
      const startDay = stripTime(selectedStartDate);
      const endDay = stripTime(selectedEndDate);

      if (!selectedStartDate || (startDay.getTime() !== endDay.getTime() && stripTime(d).getTime() !== startDay.getTime())) {
        selectedStartDate = getStartOfDay(d);
        selectedEndDate = getEndOfDay(d);
      } else if (stripTime(d) < startDay) {
        selectedEndDate = getEndOfDay(selectedStartDate);
        selectedStartDate = getStartOfDay(d);
      } else {
        selectedEndDate = getEndOfDay(d);
      }

      document.getElementById("startTimeInput").value = "00:00";
      document.getElementById("endTimeInput").value = "23:59";
      renderCalendar();
      updateRangePreview();
    };

    window.resetRangeModal = function() {
      setDefaultRange();
      setQuickActive("custom");
      document.getElementById("startTimeInput").value = "00:00";
      document.getElementById("endTimeInput").value = "23:59";
      renderCalendar();
      updateRangePreview();
    };

    window.applyRangeFromModal = function() {
      const sTime = (document.getElementById("startTimeInput").value || "00:00").split(":");
      const eTime = (document.getElementById("endTimeInput").value || "23:59").split(":");
      selectedStartDate.setHours(Number(sTime[0]), Number(sTime[1]), 0, 0);
      selectedEndDate.setHours(Number(eTime[0]), Number(eTime[1]), 59, 999);
      if (selectedStartDate > selectedEndDate) {
        const temp = selectedStartDate;
        selectedStartDate = selectedEndDate;
        selectedEndDate = temp;
      }
      setRangeDisplay();
      closeRangeModal();
      if (currentUser) loadArchive(currentUser);
    };

    function getGameStatus(item) {
      if (item.gameStatus === "win" || item.status === "win" || item.isWin === true) return "win";
      if (item.gameStatus === "lost" || item.status === "lost" || item.isWin === false) return "lost";
      return "pending";
    }

    function getGameStatusText(status) { if (status === "win") return "براوە"; if (status === "lost") return "دۆڕاو"; return "چاوەڕێ"; }
    function getSlipStatus(items) { if (!items || items.length === 0) return "pending"; const statuses = items.map(getGameStatus); if (statuses.includes("pending")) return "pending"; if (statuses.every(s => s === "win")) return "win"; return "lost"; }
    function getSlipStatusText(status) { if (status === "win") return "باری پسولە: براوە"; if (status === "lost") return "باری پسولە: سوتاوە"; return "باری پسولە: چاوەڕێ"; }
    function getStatusClass(status) { if (status === "win") return "win"; if (status === "lost") return "lost"; return ""; }

    window.toggleCard = function(id) { document.getElementById(id).classList.toggle("open"); };

    window.applyFilters = function() {
      const betNo = document.getElementById("betNoInput").value.trim().replace("#", "").toLowerCase();
      let filtered = allArchives;
      if (betNo) filtered = filtered.filter(item => String(item.betNo || item.id || "").toLowerCase().includes(betNo));
      renderArchive(filtered);
    };

    async function loadUserInfo(user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const data = userSnap.data();
      document.getElementById("coinsText").textContent = data.coins || 0;
      document.getElementById("diamondsText").textContent = data.diamonds || 0;
    }

    async function loadArchive(user) {
      const archiveList = document.getElementById("archiveList");
      archiveList.innerHTML = `<div class="empty-box">چاوەڕێ بکە...</div>`;

      try {
        const archiveRef = collection(db, "users", user.uid, "predictionArchive");
        const q = query(
          archiveRef,
          where("createdAt", ">=", Timestamp.fromDate(selectedStartDate)),
          where("createdAt", "<=", Timestamp.fromDate(selectedEndDate)),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        allArchives = [];
        snap.forEach(docSnap => allArchives.push({ id: docSnap.id, ...docSnap.data() }));
        renderArchive(allArchives);
      } catch (error) {
        archiveList.innerHTML = `<div class="empty-box">هەڵە ڕوویدا: ${error.code || ""}<br>${error.message || ""}</div>`;
      }
    }

    function renderArchive(list) {
      const archiveList = document.getElementById("archiveList");
      if (!list || list.length === 0) {
        archiveList.innerHTML = `<div class="empty-box">هیچ پسولەیەک لەم ماوەیەدا نەدۆزرایەوە.</div>`;
        return;
      }

      archiveList.innerHTML = "";
      list.forEach((data) => {
        const items = data.items || [];
        const slipStatus = getSlipStatus(items);
        const cardId = "archiveCard_" + data.id;
        const betNo = data.betNo || data.id.slice(0, 8);
        const matchesHtml = items.map(item => {
          const gameStatus = getGameStatus(item);
          return `<div class="match-item"><div><div class="match-name">${item.matchName || ""}</div><div class="pick-line">${item.pickTitle || ""} | پۆینت: <b>${formatPoint(item.point)}</b></div></div><span class="game-status ${getStatusClass(gameStatus)}">${getGameStatusText(gameStatus)}</span></div>`;
        }).join("");

        archiveList.innerHTML += `
          <div class="archive-card" id="${cardId}">
            <div class="archive-summary" onclick="toggleCard('${cardId}')">
              <div class="archive-top"><span class="status ${getStatusClass(slipStatus)}">${getSlipStatusText(slipStatus)}</span><span class="date-text">${formatDate(data.createdAt)}</span></div>
              <div class="summary-title">پسولە #${betNo}</div>
              <div class="summary-sub">${items.length} یاری | کۆین: ${data.stake || 0} | تۆتال: ${formatPoint(data.totalPoint)}</div>
            </div>
            <div class="archive-content">
              <div class="info-grid">
                <div class="info-box"><span>کۆین</span><b>${data.stake || 0}</b></div>
                <div class="info-box"><span>تۆتال پۆینت</span><b>${formatPoint(data.totalPoint)}</b></div>
                <div class="info-box"><span>بردنەوەی پێشبینی</span><b>${data.possibleWin || 0}</b></div>
              </div>
              ${matchesHtml}
            </div>
          </div>`;
      });
    }

    setDefaultRange();

    onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "login.html"; return; }
      currentUser = user;
      await loadUserInfo(user);
      await loadArchive(user);
    });
