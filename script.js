// Data structure
let userPoints = 1000.000;
let userDiamonds = 0;
let currentUser = null;

// ========== فەنکشنی کۆین ==========
function formatPoints(points) {
    let rounded = Math.round(points * 1000) / 1000;
    let parts = rounded.toFixed(3).split('.');
    let integerPart = parseInt(parts[0]).toLocaleString('en-US');
    let decimalPart = parts[1];
    return `${integerPart}.${decimalPart}`;
}

function formatDiamonds(diamonds) {
    return Math.floor(diamonds).toLocaleString('en-US');
}

function updatePointsDisplay(newPoints) {
    userPoints = newPoints;
    if(currentUser) {
        currentUser.points = userPoints;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    const formatted = formatPoints(userPoints);
    document.querySelectorAll('.points-value').forEach(el => {
        if (el) el.innerText = formatted;
    });
}

function updateDiamondsDisplay(newDiamonds) {
    userDiamonds = newDiamonds;
    if(currentUser) {
        currentUser.diamonds = userDiamonds;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    const formatted = formatDiamonds(userDiamonds);
    document.querySelectorAll('.diamond-value').forEach(el => {
        if (el) el.innerText = formatted;
    });
}

// ========== ئاڵوگۆڕ ==========
function exchangeDiamondsToCoins(amount) {
    if(amount <= 0) {
        alert('تکایە ژمارەیەکی دروست بنووسە');
        return false;
    }
    if(amount > userDiamonds) {
        alert(`ئەڵماسەکەت کەمە! تەنها ${formatDiamonds(userDiamonds)} ئەڵماس هەیە`);
        return false;
    }
    const exchangeRate = 10;
    const coinsReceived = amount * exchangeRate;
    userDiamonds -= amount;
    userPoints += coinsReceived;
    updatePointsDisplay(userPoints);
    updateDiamondsDisplay(userDiamonds);
    alert(`✅ ئاڵوگۆڕ سەرکەوتوو بوو!\n💎 ${amount} ئەڵماس بەرامبەر 🪙 ${formatPoints(coinsReceived)} کۆین`);
    return true;
}

// ========== چوونەژوورەوە ==========
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    const myBetsCard = document.getElementById('myBetsCard');
    const pastBetsCard = document.getElementById('pastBetsCard');
    
    if(!authSection) return;
    
    if(currentUser) {
        authSection.innerHTML = `
            <div class="user-info">
                <div class="coin-icon-nav">
                    <img src="images/coinicon.png" alt="Coin" class="coin-img-nav" onerror="this.src='https://placehold.co/24x24?text=🪙'">
                    <span class="points-value">${formatPoints(currentUser.points || 1000)}</span>
                </div>
                <div class="diamond-icon-nav">
                    <span style="font-size:1.1rem;">💎</span>
                    <span class="diamond-value">${formatDiamonds(currentUser.diamonds || 0)}</span>
                </div>
            </div>
        `;
        if(myBetsCard) myBetsCard.classList.remove('disabled');
        if(pastBetsCard) pastBetsCard.classList.remove('disabled');
    } else {
        authSection.innerHTML = `<button class="login-btn-nav" id="showLoginBtn">چوونەژوورەوە</button>`;
        if(myBetsCard) myBetsCard.classList.add('disabled');
        if(pastBetsCard) pastBetsCard.classList.add('disabled');
        document.getElementById('showLoginBtn')?.addEventListener('click', () => window.location.href = 'login.html');
    }
    updateMenuUsername();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    userPoints = 1000.000;
    userDiamonds = 0;
    updateAuthUI();
    alert('سەرکەوتوو دەرچوویت!');
}

function loadUserFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            userPoints = currentUser.points || 1000.000;
            userDiamonds = currentUser.diamonds || 0;
        } catch(e) { currentUser = null; }
    }
    updateAuthUI();
}

function updateMenuUsername() {
    const menuUsernameSpan = document.getElementById('menuUsername');
    if(menuUsernameSpan) {
        menuUsernameSpan.innerText = currentUser ? currentUser.username : 'میوان';
    }
}

// ========== مێنوو ==========
function initMenu() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    function closeMenu() {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
        if(hamburgerIcon) hamburgerIcon.classList.remove('open');
    }
    
    if(menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !sideMenu.classList.contains('open');
            sideMenu.classList.toggle('open');
            overlay.classList.toggle('active');
            if(hamburgerIcon) hamburgerIcon.classList.toggle('open');
        });
    }
    
    if(overlay) overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && sideMenu.classList.contains('open')) closeMenu();
    });
    
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        closeMenu();
    });
}

// ========== سلایدەر ==========
let currentSlideIndex = 0;
let slideInterval;

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    if(!slides.length) return;
    
    if(dotsContainer) {
        dotsContainer.innerHTML = '';
        for(let i = 0; i < slides.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if(i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function showSlide(index) {
        const allSlides = document.querySelectorAll('.slide');
        const allDots = document.querySelectorAll('.dot');
        if(index >= allSlides.length) index = 0;
        if(index < 0) index = allSlides.length - 1;
        allSlides.forEach(s => s.classList.remove('active'));
        allDots.forEach(d => d.classList.remove('active'));
        allSlides[index].classList.add('active');
        if(allDots[index]) allDots[index].classList.add('active');
        currentSlideIndex = index;
    }
    
    window.goToSlide = function(index) {
        showSlide(index);
        if(slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 5000);
    };
    
    showSlide(0);
    slideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 5000);
}

// ========== تاسک بار ==========
function initBottomNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const navType = item.dataset.nav;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if(navType === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
            else if(navType === 'mybets' && !currentUser) alert('تکایە چوونەژوورەوە بکە');
            else alert('بەم زوانە زیاد دەکرێت');
        });
    });
}

// ========== بۆکسەکانی پەڕەی سەرەکی ==========
function initDashboardCards() {
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('click', () => {
            if(card.classList.contains('disabled')) {
                alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە');
                window.location.href = 'login.html';
                return;
            }
            const page = card.dataset.page;
            if(page === 'sports') window.location.href = 'sports.html';
            else if(page === 'exchange') document.getElementById('exchangeModal')?.classList.add('active');
            else alert(`${card.querySelector('h3')?.innerText} - بەم زوانە زیاد دەکرێت`);
        });
    });
}

// ========== مۆدالی ئاڵوگۆڕ ==========
function initExchangeModal() {
    const modal = document.getElementById('exchangeModal');
    const closeBtn = document.getElementById('closeExchangeModal');
    const exchangeBtn = document.getElementById('doExchangeBtn');
    const amountInput = document.getElementById('exchangeAmount');
    const userDiamondsSpan = document.getElementById('userDiamondsExchange');
    
    function updateModalUI() {
        if(userDiamondsSpan) userDiamondsSpan.innerText = formatDiamonds(userDiamonds);
    }
    
    document.getElementById('exchangeCard')?.addEventListener('click', () => {
        if(!currentUser) { alert('تکایە چوونەژوورەوە بکە'); window.location.href = 'login.html'; return; }
        updateModalUI();
        modal.classList.add('active');
    });
    
    closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });
    
    exchangeBtn?.addEventListener('click', () => {
        const amount = parseInt(amountInput?.value);
        if(!isNaN(amount) && amount > 0) {
            exchangeDiamondsToCoins(amount);
            updateModalUI();
            if(amountInput) amountInput.value = '';
            modal.classList.remove('active');
        } else alert('تکایە ژمارەیەکی دروست بنووسە');
    });
}

// ========== دەستپێکردن ==========
document.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    initMenu();
    initSlider();
    initBottomNav();
    initDashboardCards();
    initExchangeModal();
});
