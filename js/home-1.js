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
