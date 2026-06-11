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
    if (currentUser) {
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
    if (currentUser) {
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
    if (amount <= 0) {
        alert('تکایە ژمارەیەکی دروست بنووسە');
        return false;
    }
    if (amount > userDiamonds) {
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
    
    if (!authSection) return;
    
    if (currentUser) {
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
        if (myBetsCard) myBetsCard.classList.remove('disabled');
    } else {
        authSection.innerHTML = `<button class="login-btn-nav" id="showLoginBtn">چوونەژوورەوە</button>`;
        if (myBetsCard) myBetsCard.classList.add('disabled');
        const loginBtn = document.getElementById('showLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }
    
    const menuUsername = document.getElementById('menuUsername');
    if (menuUsername) {
        menuUsername.innerText = currentUser ? currentUser.username : 'میوان';
    }
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
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            userPoints = currentUser.points || 1000.000;
            userDiamonds = currentUser.diamonds || 0;
        } catch (e) {
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
        if (hamburgerIcon) hamburgerIcon.classList.remove('open');
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !sideMenu.classList.contains('open');
            sideMenu.classList.toggle('open');
            overlay.classList.toggle('active');
            if (hamburgerIcon) hamburgerIcon.classList.toggle('open');
        });
    }
    
    if (overlay) overlay.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
            closeMenu();
        }
    });
    
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            closeMenu();
        });
    }
}

// ========== سلایدەری سەرەکی ==========
let currentSlideIndex = 0;
let slideInterval;

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!slides.length) return;
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', (function(index) {
                return function() { goToSlide(index); };
            })(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function showSlide(index) {
        const allSlides = document.querySelectorAll('.slide');
        const allDots = document.querySelectorAll('.dot');
        
        if (index >= allSlides.length) index = 0;
        if (index < 0) index = allSlides.length - 1;
        
        allSlides.forEach(slide => slide.classList.remove('active'));
        allDots.forEach(dot => dot.classList.remove('active'));
        
        allSlides[index].classList.add('active');
        if (allDots[index]) allDots[index].classList.add('active');
        
        currentSlideIndex = index;
    }
    
    window.goToSlide = function(index) {
        showSlide(index);
        resetInterval();
    };
    
    function nextSlide() {
        goToSlide(currentSlideIndex + 1);
    }
    
    function resetInterval() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    showSlide(0);
    resetInterval();
}

// ========== بارکردنی سلایدەر لە ئەدمین ==========
function loadSlidesFromAdmin() {
    const savedSlides = localStorage.getItem('homepageSlides');
    const sliderContainer = document.getElementById('sponsorSlider');
    
    if (savedSlides && sliderContainer) {
        try {
            const slidesData = JSON.parse(savedSlides);
            sliderContainer.innerHTML = '';
            slidesData.forEach((slide, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
                slideDiv.innerHTML = `
                    <div class="slide-content">
                        <img src="${slide.image}" style="width:50px;height:50px;object-fit:contain;margin-bottom:8px;border-radius:12px;" onerror="this.src='https://placehold.co/50x50?text=🏆'">
                        <h3>${escapeHtml(slide.title)}</h3>
                        <p>${escapeHtml(slide.text)}</p>
                    </div>
                `;
                sliderContainer.appendChild(slideDiv);
            });
            initSlider();
        } catch (e) {
            console.log('Error loading slides:', e);
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== تاسک بار ==========
function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const navType = item.dataset.nav;
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            switch (navType) {
                case 'home':
                    window.location.href = 'index.html';
                    break;
                case 'live':
                    alert('📡 ڕاستەوخۆکان - بەم زوانە زیاد دەکرێت');
                    break;
                case 'mybets':
                    if (!currentUser) {
                        alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە');
                        window.location.href = 'login.html';
                    } else {
                        alert('🎯 پێشبینیەکانت: هیچ پێشبینیەکت نییە');
                    }
                    break;
                case 'rank':
                    alert('🏆 ڕێزبەندی بەکارهێنەران - بەم زوانە زیاد دەکرێت');
                    break;
            }
        });
    });
}

// ========== بۆکسەکانی پەڕەی سەرەکی ==========
function initDashboardCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('disabled')) {
                alert('🔐 تکایە یەکەمجار چوونەژوورەوە بکە');
                window.location.href = 'login.html';
                return;
            }
            
            const page = card.dataset.page;
            switch (page) {
                case 'sports':
                    window.location.href = 'sports.html';
                    break;
                case 'exchange':
                    const modal = document.getElementById('exchangeModal');
                    if (modal) {
                        document.getElementById('userDiamondsExchange').innerText = formatDiamonds(userDiamonds);
                        modal.classList.add('active');
                    }
                    break;
                default:
                    alert(`${card.querySelector('h3')?.innerText} - بەم زوانە زیاد دەکرێت`);
            }
        });
    });
}

// ========== مۆدالی ئاڵوگۆڕ ==========
function initExchangeModal() {
    const modal = document.getElementById('exchangeModal');
    const closeBtn = document.getElementById('closeExchangeModal');
    const exchangeBtn = document.getElementById('doExchangeBtn');
    const amountInput = document.getElementById('exchangeAmount');
    
    function updateModalUI() {
        const userDiamondsSpan = document.getElementById('userDiamondsExchange');
        if (userDiamondsSpan) {
            userDiamondsSpan.innerText = formatDiamonds(userDiamonds);
        }
    }
    
    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    exchangeBtn?.addEventListener('click', () => {
        const amount = parseInt(amountInput?.value);
        if (!isNaN(amount) && amount > 0) {
            exchangeDiamondsToCoins(amount);
            updateModalUI();
            if (amountInput) amountInput.value = '';
            modal.classList.remove('active');
        } else {
            alert('تکایە ژمارەیەکی دروست بنووسە');
        }
    });
}

// ========== دەستپێکردن ==========
document.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    initMenu();
    initBottomNav();
    initDashboardCards();
    initExchangeModal();
    loadSlidesFromAdmin();
});
