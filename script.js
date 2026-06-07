// Data structure
let userPoints = 1000.000;
let selectedBets = [];
let currentUser = null;  // { username, points }
let matches = [
    { id: 1, teamA: "بەڕازیل", teamB: "ئەرجەنتین", oddsA: 1.85, oddsB: 2.10, status: "live" },
    { id: 2, teamA: "فەڕەنسا", teamB: "ئینگلتەرا", oddsA: 2.00, oddsB: 1.95, status: "upcoming" },
    { id: 3, teamA: "پورتوگال", teamB: "ئیسپانیا", oddsA: 2.40, oddsB: 1.70, status: "upcoming" },
];

// ========== فەنکشنی کۆین بە شێوەی currency ==========
function formatPoints(points) {
    let rounded = Math.round(points * 1000) / 1000;
    let parts = rounded.toFixed(3).split('.');
    let integerPart = parseInt(parts[0]).toLocaleString('en-US');
    let decimalPart = parts[1];
    return `${integerPart}.${decimalPart}`;
}

function updatePointsDisplay(newPoints) {
    userPoints = newPoints;
    if(currentUser) {
        currentUser.points = userPoints;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    const formatted = formatPoints(userPoints);
    const pointsElements = document.querySelectorAll('.points-value');
    pointsElements.forEach(el => {
        if (el) el.innerText = formatted;
    });
}

function addWinnings(amount) {
    let newPoints = userPoints + amount;
    newPoints = Math.round(newPoints * 1000) / 1000;
    updatePointsDisplay(newPoints);
    return newPoints;
}

// ========== سیستەمی چوونەژوورەوە ==========
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    if(!authSection) return;
    
    if(currentUser) {
        // نمایش کۆین + ناوی یوزەر
        authSection.innerHTML = `
            <div class="user-info">
                <div class="coin-icon-nav">
                    <img src="images/coinicon.png" alt="Coin" class="coin-img-nav" onerror="this.src='https://placehold.co/28x28?text=🪙'">
                    <span class="points-value" id="userPointsNav">${formatPoints(currentUser.points)}</span>
                </div>
                <span class="username-display">👤 ${currentUser.username}</span>
            </div>
        `;
    } else {
        // نمایش دوگمەی چوونەژوورەوە
        authSection.innerHTML = `
            <button class="login-btn-nav" id="showLoginBtn">🔑 چوونەژوورەوە</button>
        `;
        const loginBtn = document.getElementById('showLoginBtn');
        if(loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    userPoints = 1000.000;
    selectedBets = [];
    updateAuthUI();
    updateMultibar();
    renderMatches();
    alert('سەرکەوتوو دەرچوویت!');
}

function loadUserFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            userPoints = currentUser.points || 1000.000;
        } catch(e) {
            currentUser = null;
        }
    }
    updateAuthUI();
}

// ========== ڕێنمایی یارییەکان ==========
function renderMatches() {
    const container = document.getElementById('matchesList');
    if (!container) return;
    container.innerHTML = '';
    
    matches.forEach(match => {
        const isSelected = selectedBets.some(s => s.matchId === match.id);
        const selectedPick = selectedBets.find(s => s.matchId === match.id)?.pick;
        
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-teams">
                <span>${match.teamA}</span>
                <span style="color:#f5b042;">vs</span>
                <span>${match.teamB}</span>
            </div>
            <div class="odds-row">
                <div class="odd-box ${isSelected && selectedPick === match.teamA ? 'selected' : ''}" data-match="${match.id}" data-pick="${match.teamA}" data-odds="${match.oddsA}">
                    <div class="team-name">${match.teamA}</div>
                    <div class="odd-value">${match.oddsA}</div>
                </div>
                <div class="odd-box ${isSelected && selectedPick === match.teamB ? 'selected' : ''}" data-match="${match.id}" data-pick="${match.teamB}" data-odds="${match.oddsB}">
                    <div class="team-name">${match.teamB}</div>
                    <div class="odd-value">${match.oddsB}</div>
                </div>
            </div>
            <div class="bet-check">
                <label>🔘 زیاد بکە بۆ مولتی‌بێت</label>
                <input type="checkbox" class="multicheck" data-match="${match.id}" ${isSelected ? 'checked' : ''}>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.odd-box').forEach(box => {
        box.addEventListener('click', (e) => {
            e.stopPropagation();
            if(!currentUser) {
                alert('تکایە یەکەمجار چوونەژوورەوە بکە!');
                return;
            }
            const matchId = parseInt(box.dataset.match);
            const pick = box.dataset.pick;
            const odds = parseFloat(box.dataset.odds);
            
            const existing = selectedBets.find(s => s.matchId === matchId);
            if (existing) {
                existing.pick = pick;
                existing.odds = odds;
            } else {
                selectedBets.push({ matchId, pick, odds });
            }
            
            const chk = document.querySelector(`.multicheck[data-match='${matchId}']`);
            if (chk) chk.checked = true;
            
            updateMultibar();
            renderMatches();
        });
    });

    document.querySelectorAll('.multicheck').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const matchId = parseInt(chk.dataset.match);
            if (!chk.checked) {
                selectedBets = selectedBets.filter(s => s.matchId !== matchId);
            } else {
                if(!currentUser) {
                    alert('تکایە یەکەمجار چوونەژوورەوە بکە!');
                    chk.checked = false;
                    return;
                }
                const already = selectedBets.find(s => s.matchId === matchId);
                if (!already) {
                    const match = matches.find(m => m.id === matchId);
                    if (match) {
                        selectedBets.push({ matchId, pick: match.teamA, odds: match.oddsA });
                    }
                }
            }
            updateMultibar();
            renderMatches();
        });
    });
}

function updateMultibar() {
    const count = selectedBets.length;
    document.getElementById('selectedCount').innerHTML = count + " یاری هەڵبژێردراوە";
    
    let totalOddsProduct = 1;
    selectedBets.forEach(b => totalOddsProduct *= b.odds);
    document.getElementById('totalOdds').innerHTML = `کۆی ئۆدەس: ${totalOddsProduct.toFixed(2)}x`;
}

function placeMultibet() {
    if(!currentUser) {
        alert('تکایە یەکەمجار چوونەژوورەوە بکە!');
        window.location.href = 'login.html';
        return;
    }
    
    if (selectedBets.length === 0) {
        alert("هیچ یاریەکت هەڵنەبژاردووە بۆ پێشبینی!");
        return;
    }
    
    let stake = 100;
    if (userPoints < stake) {
        alert(`پۆینتەکەت کەمە! ${formatPoints(userPoints)} پۆینت هەیە، 100 پۆینت پێویستە`);
        return;
    }
    
    let totalOdds = 1;
    selectedBets.forEach(b => totalOdds *= b.odds);
    let potentialWin = (stake * totalOdds);
    potentialWin = Math.round(potentialWin * 1000) / 1000;
    
    if (confirm(`پێشبینی بکەیت بە ${stake} پۆینت؟\nئەگەر هەموو هەڵبژێردراوەکان دروست بن، ${formatPoints(potentialWin)} پۆینت دەبەیتەوە.`)) {
        userPoints = Math.round((userPoints - stake) * 1000) / 1000;
        updatePointsDisplay(userPoints);
        alert(`✅ پێشبینی تۆمارکرا! دوای یارییەکان ئەنجام دەردەکەوێت.\nئێستا پۆینتەکان: ${formatPoints(userPoints)}`);
        
        selectedBets = [];
        updateMultibar();
        renderMatches();
    }
}

function addMatch() {
    const teamA = document.getElementById('teamA').value;
    const teamB = document.getElementById('teamB').value;
    const oddsA = parseFloat(document.getElementById('oddsA').value);
    const oddsB = parseFloat(document.getElementById('oddsB').value);
    
    if (!teamA || !teamB || isNaN(oddsA) || isNaN(oddsB)) {
        alert("تکایە هەموو خانەکان پڕبکەوە");
        return;
    }
    
    const newId = matches.length + 1;
    matches.push({
        id: newId,
        teamA, teamB, oddsA, oddsB,
        status: "upcoming"
    });
    
    renderMatches();
    
    document.getElementById('teamA').value = '';
    document.getElementById('teamB').value = '';
    document.getElementById('oddsA').value = '';
    document.getElementById('oddsB').value = '';
    
    alert(`✅ یاری ${teamA} vs ${teamB} زیادکرا`);
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    
    if (msg) {
        const chatDiv = document.getElementById('chatMessages');
        const newMsg = document.createElement('div');
        newMsg.innerHTML = `<strong>تۆ:</strong> ${msg}`;
        chatDiv.appendChild(newMsg);
        input.value = '';
        
        setTimeout(() => {
            const reply = document.createElement('div');
            reply.innerHTML = `<span class="admin-badge">پشتگیری</span> سوپاس، بەم زوانە وەڵامت دەدەمەوە ✨`;
            chatDiv.appendChild(reply);
            chatDiv.scrollTop = chatDiv.scrollHeight;
        }, 800);
        
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
            document.getElementById(tabId + 'Tab').style.display = 'block';
        });
    });
}

function initMenu() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    function closeMenu() {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    }
    
    if(menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }
    
    if(overlay) overlay.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && sideMenu.classList.contains('open')) {
            closeMenu();
        }
    });
    
    const logoutLink = document.getElementById('logoutLink');
    if(logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            closeMenu();
        });
    }
}

function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const navType = item.dataset.nav;
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            switch(navType) {
                case 'home':
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case 'live':
                    document.querySelector('.tab-btn[data-tab="matches"]')?.click();
                    break;
                case 'mybets':
                    alert('پێشبینیەکانم: ئێستا هیچ پێشبینیەکت نییە');
                    break;
                case 'support':
                    document.querySelector('.tab-btn[data-tab="chat"]')?.click();
                    break;
            }
        });
    });
}

function initDashboardCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            switch(page) {
                case 'sports':
                    document.querySelector('.tab-btn[data-tab="matches"]')?.click();
                    break;
                case 'live':
                    alert('ڕاستەوخۆکان: بەم زوانە بەش بەمزوانی زیاد دەکرێت');
                    break;
                case 'results':
                    alert('ئەنجامەکان: دوای کۆتایی یارییەکان نمایش دەکرێن');
                    break;
                case 'mybets':
                    alert('پێشبینیەکانم: پێشبینیەکانی تۆ لێرە دەردەکەون');
                    break;
                case 'sponsors':
                    alert('سپۆنسەرەکان: پشتگیری لە پڕۆژەکەمان دەکەن 💝');
                    break;
                case 'about':
                    alert('دەربارە: پێشبڕکێی خۆڕایی بۆ مۆندیال 2026');
                    break;
            }
        });
    });
}

// دەستپێکردن
document.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    renderMatches();
    updateMultibar();
    initTabs();
    initMenu();
    initBottomNav();
    initDashboardCards();
    
    const placeBtn = document.getElementById('placeMultibetBtn');
    if(placeBtn) placeBtn.addEventListener('click', placeMultibet);
    
    const addBtn = document.getElementById('addMatchBtnAdmin');
    if(addBtn) addBtn.addEventListener('click', addMatch);
    
    const sendBtn = document.getElementById('sendChatBtn');
    if(sendBtn) sendBtn.addEventListener('click', sendChatMessage);
    
    const chatInput = document.getElementById('chatInput');
    if(chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') sendChatMessage();
        });
    }
    
    const updateResultBtn = document.getElementById('updateResultBtn');
    if(updateResultBtn) {
        updateResultBtn.addEventListener('click', () => {
            const result = document.getElementById('matchResult').value;
            if(result) alert(`ئەنجامەکە نوێکرایەوە: ${result} (دیمۆ)`);
            else alert('تکایە ئەنجامێک بنووسە');
        });
    }
});
