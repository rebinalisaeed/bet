// Data structure
let userPoints = 1000.000;
let currentUser = null;

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

// ========== سیستەمی چوونەژوورەوە ==========
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    const myBetsCard = document.getElementById('myBetsCard');
    const loginMessage = document.getElementById('loginMessage');
    
    if(!authSection) return;
    
    if(currentUser) {
        authSection.innerHTML = `
            <div class="user-info">
                <div class="coin-icon-nav">
                    <img src="images/coinicon.png" alt="Coin" class="coin-img-nav" onerror="this.src='https://placehold.co/28x28?text=🪙'">
                    <span class="points-value" id="userPointsNav">${formatPoints(currentUser.points)}</span>
                </div>
                <span class="username-display">👤 ${currentUser.username}</span>
            </div>
        `;
        
        if(myBetsCard) {
            myBetsCard.classList.remove('disabled');
        }
        
        if(loginMessage) {
            loginMessage.style.display = 'none';
        }
    } else {
        authSection.innerHTML = `
            <button class="login-btn-nav" id="showLoginBtn">🔑 چوونەژوورەوە</button>
        `;
        
        if(myBetsCard) {
            myBetsCard.classList.add('disabled');
        }
        
        if(loginMessage) {
            loginMessage.style.display = 'block';
        }
        
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
    updateAuthUI();
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

// ========== مێنوو (گۆڕینی ئایکۆن بۆ X) ==========
function initMenu() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    const menuIcon = document.getElementById('menuIcon');
    
    function updateMenuIcon(isOpen) {
        if(isOpen) {
            menuIcon.innerHTML = `
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            `;
        } else {
            menuIcon.innerHTML = `
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            `;
        }
    }
    
    function closeMenu() {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
        updateMenuIcon(false);
    }
    
    if(menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !sideMenu.classList.contains('open');
            sideMenu.classList.toggle('open');
            overlay.classList.toggle('active');
            updateMenuIcon(isOpening);
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
    
    updateMenuIcon(false);
}

// ========== سلایدەر (تەواو چاککراو) ==========
let currentSlideIndex = 0;
let slideInterval;
let totalSlides;

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if(!slides.length) return;
    
    totalSlides = slides.length;
    
    // دروستکردنی دۆتەکان
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
    
    function prevSlide() {
        goToSlide(currentSlideIndex - 1);
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
    
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
    }
    
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });
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
                case 'support':
                    alert('💬 پشتگیری: بۆ یارمەتی پەیوەندی بکە بە پشتگیری');
                    break;
            }
        });
    });
}

// ========== بۆکسەکان ==========
function initDashboardCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if(card.classList.contains('disabled') && card.id === 'myBetsCard') {
                alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە بۆ بینینی پێشبینیەکانت!');
                window.location.href = 'login.html';
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
                case 'sponsors':
                    alert('🤝 سپۆنسەرەکان: پشتگیری لە پڕۆژەکەمان دەکەن 💝');
                    break;
                case 'about':
                    alert('ℹ️ دەربارە: پێشبڕکێی خۆڕایی بۆ مۆندیال 2026 - هەموو بەکارهێنەر 1000 پۆینت وەردەگرێت');
                    break;
            }
        });
    });
}

// ========== دەستپێکردنی پیامی چوونەژوورەوە ==========
function initLoginPrompt() {
    const promptBtn = document.getElementById('promptLoginBtn');
    if(promptBtn) {
        promptBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

// ========== دەستپێکردن ==========
document.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    initMenu();
    initSlider();
    initBottomNav();
    initDashboardCards();
    initLoginPrompt();
});
