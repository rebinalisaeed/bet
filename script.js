// Data structure
let userPoints = 1000;
let selectedBets = [];
let matches = [
    { id: 1, teamA: "بەڕازیل", teamB: "ئەرجەنتین", oddsA: 1.85, oddsB: 2.10, status: "live" },
    { id: 2, teamA: "فەڕەنسا", teamB: "ئینگلتەرا", oddsA: 2.00, oddsB: 1.95, status: "upcoming" },
    { id: 3, teamA: "پورتوگال", teamB: "ئیسپانیا", oddsA: 2.40, oddsB: 1.70, status: "upcoming" },
];

// ڕێنمایی یارییەکان
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

    // ئیڤێنت بۆ هەڵبژاردنی ئۆدەس
    document.querySelectorAll('.odd-box').forEach(box => {
        box.addEventListener('click', (e) => {
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

    // ئیڤێنت بۆ چێکبۆکسەکان
    document.querySelectorAll('.multicheck').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const matchId = parseInt(chk.dataset.match);
            if (!chk.checked) {
                selectedBets = selectedBets.filter(s => s.matchId !== matchId);
            } else {
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

// نوێکردنەوەی multibar
function updateMultibar() {
    const count = selectedBets.length;
    document.getElementById('selectedCount').innerHTML = count + " یاری هەڵبژێردراوە";
    
    let totalOddsProduct = 1;
    selectedBets.forEach(b => totalOddsProduct *= b.odds);
    document.getElementById('totalOdds').innerHTML = `کۆی ئۆدەس: ${totalOddsProduct.toFixed(2)}x`;
}

// پێشبینی کردن
function placeMultibet() {
    if (selectedBets.length === 0) {
        alert("هیچ یاریەکت هەڵنەبژاردووە بۆ پێشبینی!");
        return;
    }
    
    let stake = 100;
    if (userPoints < stake) {
        alert("پۆینتەکەت کەمە! 100 پۆینت پێویستە");
        return;
    }
    
    let totalOdds = 1;
    selectedBets.forEach(b => totalOdds *= b.odds);
    let potentialWin = Math.floor(stake * totalOdds);
    
    if (confirm(`پێشبینی بکەیت بە ${stake} پۆینت؟\nئەگەر هەموو هەڵبژێردراوەکان دروست بن، ${potentialWin} پۆینت دەبەیتەوە.`)) {
        userPoints -= stake;
        document.getElementById('userPointsNav').innerText = userPoints;
        alert(`پێشبینی تۆمارکرا! دوای یارییەکان ئەنجام دەردەکەوێت.\nئێستا پۆینتەکان: ${userPoints}`);
        
        // پاککردنەوەی هەڵبژاردنەکان
        selectedBets = [];
        updateMultibar();
        renderMatches();
    }
}

// زیادکردنی یاری لە ئادمین پانێل
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
    
    // پاککردنەوەی فۆرم
    document.getElementById('teamA').value = '';
    document.getElementById('teamB').value = '';
    document.getElementById('oddsA').value = '';
    document.getElementById('oddsB').value = '';
    
    alert(`یاری ${teamA} vs ${teamB} زیادکرا`);
}

// ناردنی چات
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
            reply.innerHTML = `<span class="admin-badge">پشتگیری</span> سوپاس، بەم زوانە وەڵامت دەدەمەوە`;
            chatDiv.appendChild(reply);
            chatDiv.scrollTop = chatDiv.scrollHeight;
        }, 800);
        
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
}

// Tab گۆڕین
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

// مێنوو کردن و داخستن
function initMenu() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    function closeMenu() {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    }
    
    menuBtn?.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });
    
    overlay?.addEventListener('click', closeMenu);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderMatches();
    updateMultibar();
    initTabs();
    initMenu();
    
    document.getElementById('userPointsNav').innerText = userPoints;
    document.getElementById('placeMultibetBtn').addEventListener('click', placeMultibet);
    document.getElementById('addMatchBtnAdmin')?.addEventListener('click', addMatch);
    document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
});
