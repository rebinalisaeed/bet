// Data structure
let userPoints = 1000.000;
let userDiamonds = 0;
let currentUser = null;

// ========== فەنکشنی کۆین بە شێوەی currency ==========
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
    const pointsElements = document.querySelectorAll('.points-value');
    pointsElements.forEach(el => {
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
    const diamondElements = document.querySelectorAll('.diamond-value');
    diamondElements.forEach(el => {
        if (el) el.innerText = formatted;
    });
}

// ========== سیستەمی ئەڵماس ==========
function placeBet(betAmount, isWin) {
    if(isWin) {
        let newDiamonds = userDiamonds + betAmount;
        updateDiamondsDisplay(newDiamonds);
        return true;
    } else {
        return false;
    }
}

// ========== نوێکردنەوەی ناوی یوزەر لە مێنوو ==========
function updateMenuUsername() {
    const menuUsernameSpan = document.getElementById('menuUsername');
    if(menuUsernameSpan) {
        if(currentUser) {
            menuUsernameSpan.innerText = currentUser.username;
        } else {
            menuUsernameSpan.innerText = 'میوان';
        }
    }
}

// ========== ناچالاک کردنی بۆکسی پێشبینیەکانی پێشوو ==========
function updatePastBetsCard() {
    const pastBetsCard = document.getElementById('pastBetsCard');
    if(pastBetsCard) {
        if(!currentUser) {
            pastBetsCard.classList.add('disabled');
        } else {
            pastBetsCard.classList.remove('disabled');
        }
    }
}

// ========== سیستەمی چوونەژوورەوە ==========
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    const myBetsCard = document.getElementById('myBetsCard');
    
    if(!authSection) return;
    
    if(currentUser) {
        authSection.innerHTML = `
            <div class="user-info">
                <div class="coin-icon-nav">
                    <img src="images/coinicon.png" alt="Coin" class="coin-img-nav" onerror="this.src='https://placehold.co/24x24?text=🪙'">
                    <span class="points-value" id="userPointsNav">${formatPoints(currentUser.points || 1000)}</span>
                </div>
                <div class="diamond-icon-nav">
                    <span style="font-size:1.1rem;">💎</span>
                    <span class="diamond-value" id="userDiamondsNav">${formatDiamonds(currentUser.diamonds || 0)}</span>
                </div>
            </div>
        `;
        
        if(myBetsCard) {
            myBetsCard.classList.remove('disabled');
        }
    } else {
        authSection.innerHTML = `
            <button class="login-btn-nav" id="showLoginBtn">چوونەژوورەوە</button>
        `;
        
        if(myBetsCard) {
            myBetsCard.classList.add('disabled');
        }
        
        const loginBtn = document.getElementById('showLoginBtn');
        if(loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }
    
    updateMenuUsername();
    updatePastBetsCard();
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
        } catch(e) {
            currentUser = null;
        }
    }
    updateAuthUI();
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
            if(hamburgerIcon) {
                hamburgerIcon.classList.toggle('open');
            }
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

// ========== سلایدەر ==========
let currentSlideIndex = 0;
let slideInterval;
let totalSlides;

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    
    if(!slides.length) return;
    
    totalSlides = slides.length;
    
    if(dotsContainer) {
        dotsContainer.innerHTML = '';
        for(let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if(i === 0) dot.classList.add('active');
            dot.addEventListener('click', (function(index) {
                return function() { goToSlide(index); };
            })(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function showSlide(index) {
        const allSlides = document.querySelectorAll('.slide');
        const allDots = document.querySelectorAll('.dot');
        
        if(index >= totalSlides) index = 0;
        if(index < 0) index = totalSlides - 1;
        
        allSlides.forEach(slide => slide.classList.remove('active'));
        allDots.forEach(dot => dot.classList.remove('active'));
        
        allSlides[index].classList.add('active');
        if(allDots[index]) allDots[index].classList.add('active');
        
        currentSlideIndex = index;
    }
    
    function nextSlide() {
        goToSlide(currentSlideIndex + 1);
    }
    
    window.goToSlide = function(index) {
        showSlide(index);
        resetInterval();
    };
    
    function resetInterval() {
        if(slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    }
    
    showSlide(0);
    resetInterval();
}

// ========== تاسک بار ==========
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
                    alert('📡 ڕاستەوخۆکان: بەم زوانە بەش بەمزوانی زیاد دەکرێت');
                    break;
                case 'mybets':
                    if(!currentUser) {
                        alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە بۆ بینینی پێشبینیەکانت!');
                        window.location.href = 'login.html';
                    } else {
                        alert('🎯 پێشبینیەکانت: هیچ پێشبینیەکت نییە');
                    }
                    break;
                case 'rank':
                    alert('🏆 ڕێزبەندی بەکارهێنەران: ڕیزبەندی مانگانە بەپێی ئەڵماس');
                    break;
            }
        });
    });
}

// ========== 9 بۆکسەکان ==========
function initDashboardCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // پشکنینی بۆکسی ناچالاک
            if(card.classList.contains('disabled')) {
                if(card.id === 'myBetsCard') {
                    alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە بۆ بینینی پێشبینیەکانت!');
                    window.location.href = 'login.html';
                } else if(card.id === 'pastBetsCard') {
                    alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە بۆ بینینی مێژووی پێشبینیەکانت!');
                    window.location.href = 'login.html';
                }
                return;
            }
            
            const page = card.dataset.page;
            switch(page) {
                case 'sports':
                    alert('⚽ وەرزشەکان: هەموو پێشبینیە وەرزشیەکان لێرە دەردەکەون');
                    break;
                case 'live':
                    alert('📡 ڕاستەوخۆکان: ئەنجامە ڕاستەوخۆکانی یارییەکان لێرە دەردەکەون');
                    break;
                case 'results':
                    alert('📊 ئەنجامەکان: دوای کۆتایی یارییەکان نمایش دەکرێن');
                    break;
                case 'mybets':
                    if(currentUser) {
                        alert('🎯 پێشبینیەکانت: هیچ پێشبینیەکت نییە');
                    }
                    break;
                case 'rank':
                    alert('🏆 ڕێزبەندی بەکارهێنەران: ڕیزبەندی مانگانە بەپێی ئەڵماس\nسەرەتا: هیچ ئەڵماسێک نییە');
                    break;
                case 'rules':
                    alert('📜 مەرج و ڕێساکان:\n1. هەر بەکارهێنەر 1000 پۆینت وەردەگرێت\n2. پێشبینی بە پۆینت بکە\n3. ئەگەر بردەوە، پۆینتەکان دەبنە ئەڵماس\n4. ڕیزبەندی مانگانە بەپێی ئەڵماس');
                    break;
                case 'pastbets':
                    if(currentUser) {
                        alert('📋 پێشبینیەکانی پێشوو: هیچ مێژوویەک نییە');
                    }
                    break;
                case 'sponsors':
                    alert('🤝 سپۆنسەرەکان: ئاسیاسێل - Zain Cash - بکات کارتی');
                    break;
                case 'about':
                    alert('ℹ️ دەربارە: پێشبڕکێی خۆڕایی بۆ مۆندیال 2026 - هەموو بەکارهێنەر 1000 پۆینت وەردەگرێت');
                    break;
            }
        });
    });
}

// ========== دەستپێکردن ==========
document.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    initMenu();
    initSlider();
    initBottomNav();
    initDashboardCards();
});
