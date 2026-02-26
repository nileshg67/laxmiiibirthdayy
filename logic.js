
// =====================================================
// TIME LOCK CONFIGURATION
// =====================================================
// Set the date and time when the gift should unlock
// Format: "YYYY-MM-DDTHH:MM" (e.g., "2025-01-15T00:00" for January 15, 2025 at midnight)
// You can change this to any date/time you want
const TARGET_DATE = "2026-02-27T00:00";

// Alternatively, set days from now (uncomment below and set days)
// const DAYS_FROM_NOW = 3; // Gift unlocks in 3 days
// const TARGET_DATE = new Date(Date.now() + DAYS_FROM_NOW * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

// =====================================================
// TIME LOCK FUNCTIONS
// =====================================================
let countdownInterval;

// Get target date as Date object
function getTargetDate() {
    return new Date(TARGET_DATE);
}

// Check if gift can be opened
function canOpenGift() {
    const now = new Date();
    const target = getTargetDate();
    return now >= target;
}

// Get time remaining until gift can be opened
function getTimeRemaining() {
    const now = new Date();
    const target = getTargetDate();
    const diff = target - now;
    
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total: diff };
}

// Show countdown timer on the overlay
function showCountdown() {
    const timeRemaining = getTimeRemaining();
    
    // Create or update countdown display
    let countdownEl = document.getElementById('countdown-display');
    if (!countdownEl) {
        countdownEl = document.createElement('div');
        countdownEl.id = 'countdown-display';
        countdownEl.className = 'countdown-display';
        
        // Find the overlay content and add countdown before the gift box
        const overlayContent = document.querySelector('.overlay-content');
        if (overlayContent) {
            overlayContent.insertBefore(countdownEl, overlayContent.firstChild);
        }
    }
    
    // Format time
    const { days, hours, minutes, seconds } = timeRemaining;
    const timeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    countdownEl.innerHTML = `
        <div class="countdown-title">⏰ Time until your surprise:</div>
        <div class="countdown-timer">${timeStr}</div>
        <div class="countdown-date">Opens on: ${getTargetDate().toLocaleString()}</div>
    `;
    
    // Update every second
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const tr = getTimeRemaining();
        if (tr.total <= 0) {
            // Time reached! Enable the gift
            clearInterval(countdownInterval);
            enableGift();
        } else {
            const t = document.getElementById('countdown-display');
            if (t) {
                t.innerHTML = `
                    <div class="countdown-title">⏰ Time until your surprise:</div>
                    <div class="countdown-timer">${tr.days}d ${tr.hours}h ${tr.minutes}m ${tr.seconds}s</div>
                    <div class="countdown-date">Opens on: ${getTargetDate().toLocaleString()}</div>
                `;
            }
        }
    }, 1000);
}

// Show message when someone tries to open gift too early
function showTimeLockMessage() {
    const timeRemaining = getTimeRemaining();
    const { days, hours, minutes, seconds } = timeRemaining;
    
    // Create a toast/alert
    const existingAlert = document.getElementById('time-lock-alert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.id = 'time-lock-alert';
    alert.className = 'time-lock-alert';
    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">⏳</span>
            <div class="alert-text">
                <strong>Not yet!</strong>
                <p>Your surprise will be available in:</p>
                <p class="alert-time">${days}d ${hours}h ${minutes}m ${seconds}s</p>
            </div>
        </div>
    `;
    document.body.appendChild(alert);
    
    // Show with animation
    setTimeout(() => alert.classList.add('show'), 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 4000);
}

// Enable gift when time is reached
function enableGift() {
    const giftBox = document.querySelector('.gift-box-container');
    const openBtn = document.getElementById('open-btn');
    const countdownEl = document.getElementById('countdown-display');
    
    if (giftBox) {
        giftBox.style.cursor = 'pointer';
        giftBox.classList.remove('locked');
    }
    
    if (openBtn) {
        openBtn.disabled = false;
        openBtn.classList.remove('disabled');
    }
    
    // Update or remove countdown
    if (countdownEl) {
        countdownEl.innerHTML = `
            <div class="countdown-title">🎉 Your surprise is ready!</div>
            <div class="countdown-timer">Click to unwrap!</div>
        `;
        countdownEl.classList.add('ready');
    }
    
    // Update click hint
    const clickHint = document.querySelector('.click-hint');
    if (clickHint) {
        clickHint.textContent = 'Click to open your gift! 🎁';
    }
}

// Wrapper for init to check time before opening
function initWithTimeCheck() {
    if (canOpenGift()) {
        // Time has reached, open the gift
        init();
    } else {
        // Show time lock message
        showTimeLockMessage();
    }
}

let heartInterval;
let bgHeartInterval;
let starsCreated = false;
let firefliesCreated = false;

// Detect mobile for performance optimization
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isSmallMobile = window.matchMedia('(max-width: 480px)').matches;

// =====================================================
// INITIALIZATION
// =====================================================
function init() {
    // 1. Hide overlay and show content
    document.getElementById('overlay').style.display = 'none';
    document.querySelector('.animated-bg').style.display = 'none';
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    
    // 2. Create night sky elements
    if (!starsCreated) {
        createStars();
        createShootingStars();
        createFireflies();
        starsCreated = true;
        firefliesCreated = true;
    }
    
    // 3. Music Setup with Fade-in
    const audio = document.getElementById("myAudio");
    audio.volume = 0;
    audio.play().then(() => {
        let vol = 0;
        const fadeInterval = setInterval(() => {
            if (vol < 1) {
                vol += 0.05;
                audio.volume = vol.toFixed(2);
            } else {
                clearInterval(fadeInterval);
            }
        }, 200);
    }).catch(err => console.log("Audio issue: ", err));

    // 4. Grand Entrance Confetti
    try {
        const end = Date.now() + (3 * 1000);
        (function frame() {
            try {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff4d6d', '#ffccd5'] });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff4d6d', '#ffccd5'] });
            } catch (e) { }

            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    } catch (e) {
        console.warn('confetti not available', e);
    }

    // 5. Start Floating Elements
    heartInterval = setInterval(createFloatingElement, 500);
    startFloatingHearts();
    startFloatingCakes();

    // 6. Add mouse trail effect
    document.addEventListener('mousemove', createMouseTrail);
}

// =====================================================
// MOUSE TRAIL EFFECT
// =====================================================
function createMouseTrail(e) {
    const emojis = ['✨', '💖', '🌟', '💫', '⭐'];
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    el.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = e.pageX + 'px';
    el.style.top = e.pageY + 'px';
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 800);
}

// =====================================================
// NIGHT SKY - STARS
// =====================================================
function createStars() {
    const container = document.getElementById('stars-container');
    const starCount = isSmallMobile ? 50 : (isMobile ? 75 : 100);
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.setProperty('--delay', (Math.random() * 2) + 's');
        star.style.width = (Math.random() * 2 + 1) + 'px';
        star.style.height = star.style.width;
        container.appendChild(star);
    }
}

// =====================================================
// NIGHT SKY - SHOOTING STARS
// =====================================================
function createShootingStars() {
    setInterval(() => {
        const container = document.getElementById('stars-container');
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.left = Math.random() * 70 + '%';
        shootingStar.style.top = Math.random() * 50 + '%';
        container.appendChild(shootingStar);
        
        setTimeout(() => shootingStar.remove(), 3000);
    }, 3000);
}

// =====================================================
// FIREFLIES
// =====================================================
function createFireflies() {
    const container = document.getElementById('fireflies-container');
    const fireflyCount = isSmallMobile ? 5 : (isMobile ? 8 : 12);
    
    for (let i = 0; i < fireflyCount; i++) {
        setTimeout(() => {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            firefly.style.left = Math.random() * 100 + '%';
            firefly.style.top = Math.random() * 100 + '%';
            firefly.style.setProperty('--float-duration', (Math.random() * 8 + 6) + 's');
            firefly.style.setProperty('--delay', (Math.random() * 5) + 's');
            container.appendChild(firefly);
            
            setTimeout(() => firefly.remove(), 14000);
        }, i * 1000);
    }
    
    // Keep creating fireflies periodically
    setInterval(() => {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        firefly.style.left = Math.random() * 100 + '%';
        firefly.style.top = Math.random() * 100 + '%';
        firefly.style.setProperty('--float-duration', (Math.random() * 8 + 6) + 's');
        firefly.style.setProperty('--delay', '0s');
        container.appendChild(firefly);
        
        setTimeout(() => firefly.remove(), 14000);
    }, 3000);
}

// =====================================================
// FLOATING ELEMENTS
// =====================================================
function createFloatingElement() {
    const emojis = ['❤️', '💖', '✨', '🌸', '🌹', '💫', '⭐'];
    const el = document.createElement('div');
    el.classList.add('heart');
    el.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (Math.random() * 20 + 10) + 'px';
    
    const duration = Math.random() * 3 + 4;
    el.style.animationDuration = duration + 's';
    el.style.opacity = Math.random();
    
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.style.transition = 'opacity 1s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 1000);
    }, (duration - 1) * 1000);
}

// =====================================================
// MUSIC TOGGLE
// =====================================================
function cornerAction() {
    const audio = document.getElementById('myAudio');
    const btn = document.getElementById('corner-btn');
    if (!audio || !btn) return;

    if (audio.paused) {
        audio.play().catch(() => {});
        btn.textContent = '🔊';
        btn.title = 'Pause music';
    } else {
        audio.pause();
        btn.textContent = '🔇';
        btn.title = 'Play music';
    }
    
    try {
        confetti({ particleCount: 15, spread: 60, colors: ['#ff4d6d', '#ffccd5'] });
    } catch (e) {}
}

// =====================================================
// CELEBRATE - ENHANCED FIREWORKS
// =====================================================
function celebrate() {
    // Enhanced confetti burst
    try {
        confetti({ particleCount: 100, spread: 150, origin: { y: 0.6 }, colors: ['#ff4d6d', '#ffccd5', '#ffd166', '#8ad2ff', '#c39cff'] });
        confetti({ particleCount: 80, spread: 120, origin: { y: 0.6 }, colors: ['#ffd166', '#ffd7e0', '#ffb3c4'] });
    } catch (e) {}

    // Create floating balloons
    const colors = ['#ff6b81', '#ffcfdf', '#ffd166', '#8ad2ff', '#c39cff'];
    const count = 15;
    for (let i = 0; i < count; i++) {
        const b = document.createElement('div');
        b.className = 'balloon';
        const size = Math.floor(Math.random() * 28) + 48;
        b.style.width = size + 'px';
        b.style.height = Math.floor(size * 1.2) + 'px';
        b.style.left = (Math.random() * 85 + 5) + 'vw';
        const color = colors[Math.floor(Math.random() * colors.length)];
        b.style.background = 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), rgba(255,255,255,0.05)), ' + color;
        const duration = (Math.random() * 6) + 6;
        b.style.animationDuration = duration + 's, ' + (3 + Math.random() * 2) + 's';
        b.textContent = '❤';

        b.addEventListener('animationend', (ev) => {
            if (ev.animationName === 'floatUp') b.remove();
        });

        b.addEventListener('click', () => {
            try { confetti({ particleCount: 12, spread: 40, origin: { x: parseFloat(b.style.left) / 100, y: 0.8 } }); } catch (e) {}
            b.remove();
        });

        document.body.appendChild(b);
    }
    
    // Launch big fireworks
    launchFireworks();
}

// =====================================================
// FIREWORKS SHOW
// =====================================================
function launchFireworks() {
    const colors = ['#ff4d6d', '#ff85a1', '#ffd166', '#8ad2ff', '#c39cff', '#ffee58'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFirework(
                Math.random() * 60 + 20, // x position (20-80%)
                Math.random() * 40 + 20, // y position (20-60%)
                colors[Math.floor(Math.random() * colors.length)]
            );
        }, i * 400);
    }
}

function createFirework(x, y, color) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = x + '%';
    firework.style.top = y + '%';
    
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.background = color;
        
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--x', x + 'px');
        particle.style.setProperty('--y', y + 'px');
        
        firework.appendChild(particle);
    }
    
    document.body.appendChild(firework);
    setTimeout(() => firework.remove(), 1000);
}

// =====================================================
// BACKGROUND FLOATING HEARTS
// =====================================================
function createBackgroundHeart() {
    const b = document.createElement('div');
    b.className = 'bg-heart';
    b.innerHTML = '❤';

    const left = Math.random() * 90 + 5;
    b.style.left = left + 'vw';

    const size = Math.floor(Math.random() * 18) + 28;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.fontSize = Math.max(12, Math.floor(size * 0.6)) + 'px';

    const tints = ['#ff4d6d', '#ff85a1', '#ffd1df', '#ffb3c4'];
    const color = tints[Math.floor(Math.random() * tints.length)];
    b.style.color = color;

    const duration = (Math.random() * 4) + 6;
    b.style.animationDuration = duration + 's, 3s';

    b.addEventListener('animationend', (ev) => {
        if (ev.animationName === 'heartFloat') b.remove();
    });

    document.body.appendChild(b);
}

function startFloatingHearts(rateMs = 350) {
    if (bgHeartInterval) return;
    const rate = isSmallMobile ? 600 : (isMobile ? 450 : rateMs);
    for (let i = 0; i < 3; i++) createBackgroundHeart();
    bgHeartInterval = setInterval(() => {
        const n = isSmallMobile ? 1 : Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < n; i++) createBackgroundHeart();
    }, rate);
}

// =====================================================
// FLOATING CAKES
// =====================================================
let floatingCakesInterval;

function createFloatingCake() {
    const c = document.createElement('div');
    c.className = 'floating-cake';
    c.innerHTML = '🎂';

    const left = Math.random() * 90 + 5;
    c.style.left = left + 'vw';

    const size = Math.floor(Math.random() * 12) + 20;
    c.style.fontSize = size + 'px';

    const duration = (Math.random() * 6) + 8;
    c.style.animationDuration = duration + 's, 4s';

    c.addEventListener('animationend', (ev) => {
        if (ev.animationName === 'cakeFloat') c.remove();
    });

    document.body.appendChild(c);
}

function startFloatingCakes(rateMs = 1200) {
    if (floatingCakesInterval) return;
    const rate = isSmallMobile ? 2000 : (isMobile ? 1500 : rateMs);
    createFloatingCake();
    floatingCakesInterval = setInterval(createFloatingCake, rate);
}

// =====================================================
// LOVE NOTE
// =====================================================
const loveNoteMessage = `Laxmi, kuch log life mein aate hain aur sab kuch badal dete hain, bina ye jaane ki unka hona hi kisi aur ke liye kitna bada gift hai. Mere liye tum wahi insaan ho. Main shayad kabhi keh na paun, par tumhari khushi meri life ki sabse badi dua hai. Aaj tumhara birthday hai, aur main bas yahi chahta hoon ki tum hamesha aise hi hansti raho, bhale hi us hansi ki wajah main na hoon. Happy Birthday to the girl who means the world to me. ✨`;
let typewriterTimeout;

function openLoveNote() {
    const modal = document.getElementById('love-note-modal');
    const textEl = document.getElementById('love-text');
    if (!modal || !textEl) return;

    modal.style.display = 'flex';
    textEl.textContent = '';
    
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    
    typewriterEffect(textEl, loveNoteMessage, 50);
}

function closeLoveNote() {
    const modal = document.getElementById('love-note-modal');
    if (modal) modal.style.display = 'none';
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
}

function typewriterEffect(element, text, speed = 50) {
    let idx = 0;
    element.textContent = '';
    const type = () => {
        if (idx < text.length) {
            element.textContent += text[idx];
            idx++;
            typewriterTimeout = setTimeout(type, speed);
        } else {
            typewriterTimeout = null;
        }
    };
    type();
}

// =====================================================
// GREETING CARD
// =====================================================
function openGreetingCard() {
    const modal = document.getElementById('greeting-card-modal');
    if (modal) modal.style.display = 'flex';
}

function closeGreetingCard() {
    const modal = document.getElementById('greeting-card-modal');
    if (modal) modal.style.display = 'none';
}

function downloadCard() {
    const card = document.getElementById('instagram-card');
    if (!card) return;

    try {
        if (typeof html2canvas === 'undefined') {
            alert('📸 Screenshot this card and share it on Instagram!');
            return;
        }

        html2canvas(card, { scale: 2, backgroundColor: '#fff' }).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'Laxmi-Birthday-Card.png';
            link.click();
        });
    } catch (e) {
        alert('📸 Screenshot this card and share it on Instagram!');
    }
}

// =====================================================
// SOCIAL SHARE
// =====================================================
function shareOnWhatsapp() {
    const text = "Happy Birthday Laxmi! 🎂💕 Check out this amazing birthday website made by Nilesh!";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function shareOnTwitter() {
    const text = "Happy Birthday Laxmi! 🎂💕";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function shareOnFacebook() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer');
}

// =====================================================
// WISH GENERATOR
// =====================================================
const wishes = [
    "May all your dreams come true! ✨",
    "May you always smile like you do now! 😊",
    "May your life be filled with love and happiness! 💕",
    "May you achieve all that you desire! 🌟",
    "May each day bring you new joys! 🎉",
    "May your heart be filled with peace! 🕊️",
    "May you be surrounded by loved ones! ❤️",
    "May this year be your best year yet! 🚀",
    "May success follow you everywhere! 🏆",
    "May your birthday be as amazing as you are! 🎂",
    "Tumhari har khushi ki duniya bana do! 🌈",
    "Har din tumhare liye khushiyon se bhara ho! 💖"
];

function openWishGenerator() {
    const modal = document.getElementById('wish-modal');
    if (modal) modal.style.display = 'flex';
    document.getElementById('wish-display').textContent = 'Click the button to generate a wish...';
}

function closeWishGenerator() {
    const modal = document.getElementById('wish-modal');
    if (modal) modal.style.display = 'none';
}

function generateWish() {
    const display = document.getElementById('wish-display');
    const wish = wishes[Math.floor(Math.random() * wishes.length)];
    display.style.animation = 'none';
    display.offsetHeight; // Trigger reflow
    display.style.animation = 'wishFade 0.5s ease';
    display.textContent = wish;
    
    // Confetti burst
    try {
        confetti({ particleCount: 30, spread: 50, colors: ['#ff4d6d', '#ffd166', '#8ad2ff'] });
    } catch (e) {}
}

// =====================================================
// QUIZ
// =====================================================
const quizQuestions = [
    {
        question: "laxmi ka fav fruit konsa h?",
        options: ["Apple", "Mango", "oranges", "Strawberry"],
        correct: 2
    },
    {
        question: "laxmi ka fav food konsa h ?",
        options: ["Biryani", "Pizza", "Pasta", "Dosa"],
        correct: 0
    },
    {
        question: "Laxmi ko sabse jada kya pasand ?",
        options: ["Reading", "Dancing", "Painting", "Traveling"],
        correct: 3
    },

    {
        question: "Kya laxmi zindagi mein kabhi time par aayegi?",
        options: ["Haan, bilkul!", "Shayad kabhi", "Nahi, kabhi nahi", "Pata nahi"],
        correct: 2
    },

    {
        question: "Laxmi ka sabse bada sapna kya hai?",
        options: ["World Travel", "Successful Career", "Happy Family", "All of the above"],
        correct: 3
    },
];

let currentQuestion = 0;
let score = 0;

function openQuiz() {
    const modal = document.getElementById('quiz-modal');
    if (modal) modal.style.display = 'flex';
    currentQuestion = 0;
    score = 0;
    showQuestion();
}

function closeQuiz() {
    const modal = document.getElementById('quiz-modal');
    if (modal) modal.style.display = 'none';
}

function showQuestion() {
    const container = document.getElementById('quiz-container');
    const q = quizQuestions[currentQuestion];
    
    container.innerHTML = `
        <p class="quiz-question">${q.question}</p>
        <div class="quiz-options">
            ${q.options.map((opt, i) => `
                <button class="quiz-option" onclick="checkAnswer(${i})">${opt}</button>
            `).join('')}
        </div>
        <p class="quiz-score">Question ${currentQuestion + 1} of ${quizQuestions.length}</p>
    `;
}

function checkAnswer(answer) {
    // Prevent multiple clicks on options
    const optionsContainer = document.querySelector('.quiz-options');
    if (optionsContainer.style.pointerEvents === 'none') return;
    optionsContainer.style.pointerEvents = 'none';

    const q = quizQuestions[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    if (answer === q.correct) {
        options[answer].classList.add('correct');
        score++;
    } else {
        options[answer].classList.add('wrong');
        options[q.correct].classList.add('correct');
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizQuestions.length) {
            showQuestion();
        } else {
            showFinalScore();
        }
    }, 1000);
}

function showFinalScore() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
        <p class="quiz-question">Quiz Complete!</p>
        <p class="quiz-score">Your Score: ${score} / ${quizQuestions.length}</p>
        <button class="start-btn" onclick="openQuiz()" style="margin-top: 20px;">Play Again 🔄</button>
    `;
    
    // Celebration
    try {
        confetti({ particleCount: 50, spread: 70 });
    } catch (e) {}
}

// =====================================================
// MEMORY LANE
// =====================================================
function openMemoryLane() {
    const modal = document.getElementById('memory-modal');
    if (modal) modal.style.display = 'flex';
}

function closeMemoryLane() {
    const modal = document.getElementById('memory-modal');
    if (modal) modal.style.display = 'none';
}

// =====================================================
// CAKE CUTTING
// =====================================================
function openCakeModal() {
    const modal = document.getElementById('cake-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCakeModal() {
    const modal = document.getElementById('cake-modal');
    if (modal) modal.style.display = 'none';
}

function cutCake() {
    const cake = document.querySelector('.cake');
    const message = document.getElementById('cake-message');
    
    cake.classList.add('cut');
    message.textContent = "🎉 Happy Birthday Laxmi! 🎉";
    
    // Big confetti celebration
    try {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        confetti({ particleCount: 100, spread: 150, origin: { y: 0.6 } });
    } catch (e) {}
    
    setTimeout(() => {
        cake.classList.remove('cut');
    }, 2000);
}

// =====================================================
// SECRET SURPRISE
// =====================================================
let secretClickCount = 0;

function showSecretSurprise() {
    secretClickCount++;
    
    if (secretClickCount === 3) {
        secretClickCount = 0;
        
        const secretMsg = document.getElementById('secret-message');
        secretMsg.style.display = 'block';
        
        // Big fireworks
        launchFireworks();
        
        setTimeout(() => {
            secretMsg.style.display = 'none';
        }, 5000);
    }
}

// =====================================================
// PHOTO FRAME TOGGLE
// =====================================================
function toggleFrame(card) {
    card.classList.toggle('frame-active');
    
    if (card.classList.contains('frame-active')) {
        try {
            confetti({ particleCount: 20, spread: 40, colors: ['#ff4d6d', '#ffd166'] });
        } catch (e) {}
    }
}

// =====================================================
// MODAL CLOSE ON OUTSIDE CLICK
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    const modals = ['love-note-modal', 'greeting-card-modal', 'wish-modal', 'quiz-modal', 'memory-modal', 'cake-modal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    });
});

// =====================================================
// AUTO-START ANIMATIONS ON PAGE LOAD
// =====================================================
function autoStartAnimations() {
    // Start floating hearts
    startFloatingHearts();
    
    // Start floating lanterns
    startLanterns();
    
    // Trigger confetti burst
    try {
        confetti({ particleCount: 40, spread: 100, origin: { y: 0.5 }, colors: ['#ff4d6d', '#ffccd5', '#ffd166'] });
    } catch (e) {
        console.warn('confetti unavailable on load', e);
    }
}

// Trigger on page load
document.addEventListener('DOMContentLoaded', () => {
    autoStartAnimations();
    
    // Show countdown timer on the overlay
    showCountdown();
    
    // Add keyboard interaction - press Enter to open gift
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const overlay = document.getElementById('overlay');
            if (overlay && overlay.style.display !== 'none') {
                initWithTimeCheck();
            }
        }
    });
});

// =====================================================
// GIFT BOX OPENING ANIMATION
// =====================================================
function playGiftBoxAnimation() {
    const giftBox = document.querySelector('.gift-box-container');
    if (giftBox) {
        giftBox.classList.add('opening');
        
        // Create confetti burst when gift opens
        setTimeout(() => {
            try {
                confetti({ 
                    particleCount: 80, 
                    spread: 120, 
                    origin: { y: 0.6 },
                    colors: ['#ff4d6d', '#ffccd5', '#ffd166', '#8ad2ff', '#c39cff']
                });
            } catch (e) {}
        }, 300);
    }
}

// Enhanced init function with gift box animation
const originalInit = init;
init = function() {
    // Play gift box animation first
    playGiftBoxAnimation();
    
    // Delay the actual initialization to allow animation to play
    setTimeout(() => {
        // 1. Hide overlay and show content
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.style.display = 'none';
        
        const animatedBg = document.querySelector('.animated-bg');
        if (animatedBg) animatedBg.style.display = 'none';
        
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.style.display = 'block';
        
        // 2. Create night sky elements
        if (!starsCreated) {
            createStars();
            createShootingStars();
            createFireflies();
            starsCreated = true;
            firefliesCreated = true;
        }
        
        // 3. Music Setup with Fade-in
        const audio = document.getElementById("myAudio");
        if (audio) {
            audio.volume = 0;
            audio.play().then(() => {
                let vol = 0;
                const fadeInterval = setInterval(() => {
                    if (vol < 1) {
                        vol += 0.05;
                        audio.volume = vol.toFixed(2);
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, 200);
            }).catch(err => console.log("Audio issue: ", err));
        }

        // 4. Grand Entrance Confetti
        try {
            const end = Date.now() + (3 * 1000);
            (function frame() {
                try {
                    confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff4d6d', '#ffccd5'] });
                    confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff4d6d', '#ffccd5'] });
                } catch (e) { }

                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        } catch (e) {
            console.warn('confetti not available', e);
        }

        // 5. Start Floating Elements
        heartInterval = setInterval(createFloatingElement, 500);
        startFloatingHearts();
        startFloatingCakes();

        // 6. Add mouse trail effect
        document.addEventListener('mousemove', createMouseTrail);
    }, 800); // Delay for gift animation
};

// =====================================================
// FLOATING LANTERNS
// =====================================================
let lanternsInterval;

function createLantern() {
    const container = document.getElementById('lanterns-container');
    if (!container) return;
    
    const lantern = document.createElement('div');
    lantern.className = 'lantern';
    
    // Random lantern emoji
    const lanternEmojis = ['🏮', '🪔', '✨', '💫'];
    lantern.innerHTML = lanternEmojis[Math.floor(Math.random() * lanternEmojis.length)];
    
    lantern.style.left = Math.random() * 90 + 5 + '%';
    lantern.style.animationDuration = (Math.random() * 8 + 10) + 's';
    lantern.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(lantern);
    
    // Remove after animation
    setTimeout(() => {
        lantern.remove();
    }, 18000);
}

function startLanterns() {
    if (lanternsInterval) return;
    
    // Create initial lanterns
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createLantern(), i * 500);
    }
    
    // Create new lanterns periodically
    lanternsInterval = setInterval(() => {
        if (Math.random() > 0.5) { // Random interval
            createLantern();
        }
    }, 2000);
}

// =====================================================
// INTERACTIVE SURPRISE ELEMENTS
// =====================================================
function createSurpriseBurst(element) {
    // Get element position
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Create burst container
    const burst = document.createElement('div');
    burst.className = 'surprise-burst';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    
    // Create particles
    const particles = ['✨', '⭐', '💫', '❤️', '💖', '🌟'];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'surprise-particle';
        particle.innerHTML = particles[Math.floor(Math.random() * particles.length)];
        
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = Math.random() * 80 + 40;
        const px = Math.cos(angle) * velocity;
        const py = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--x', px + 'px');
        particle.style.setProperty('--y', py + 'px');
        
        burst.appendChild(particle);
    }
    
    document.body.appendChild(burst);
    
    // Add confetti
    try {
        confetti({ 
            particleCount: 20, 
            spread: 60, 
            origin: { x: x / window.innerWidth, y: y / window.innerHeight },
            colors: ['#ff4d6d', '#ffd166', '#8ad2ff', '#c39cff']
        });
    } catch (e) {}
    
    // Remove burst after animation
    setTimeout(() => {
        burst.remove();
    }, 800);
}

// Add hover effect to surprise elements
document.addEventListener('DOMContentLoaded', () => {
    const surpriseElements = document.querySelectorAll('.surprise-element');
    surpriseElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.textShadow = '';
        });
    });
});

