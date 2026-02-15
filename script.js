/* ============================================
   BARBEARIA DO TALENTO — Interactive Effects
   - Particle constellation system
   - Text scramble animation
   - 3D tilt cards
   - Scroll reveal animations
   - Custom cursor
   - Counter animation
   - Smooth navigation
   ============================================ */

(function () {
    'use strict';

    // ==========================
    // LOADER
    // ==========================
    const loader = document.getElementById('loader');
    const loaderFill = document.getElementById('loaderFill');
    let loadProgress = 0;

    function updateLoader() {
        loadProgress += Math.random() * 20 + 10;
        if (loadProgress > 100) loadProgress = 100;
        loaderFill.style.width = loadProgress + '%';

        if (loadProgress < 100) {
            setTimeout(updateLoader, 100 + Math.random() * 150);
        } else {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
                initParticles();
                initCounters();
            }, 300);
        }
    }

    document.body.style.overflow = 'hidden';
    setTimeout(updateLoader, 200);

    // ==========================
    // PARTICLE CONSTELLATION
    // ==========================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let animFrame;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.7 ? '212, 168, 67' : '0, 255, 136';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x -= (dx / dist) * force * 1.5;
                this.y -= (dy / dist) * force * 1.5;
            }

            // Wrap around
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        resizeCanvas();
        const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
        if (animFrame) cancelAnimationFrame(animFrame);
        animateParticles();
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = ((150 - dist) / 150) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animFrame = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // ==========================
    // CUSTOM CURSOR
    // ==========================
    const cursorRing = document.getElementById('cursorRing');
    const cursorDot = document.getElementById('cursorDot');
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        });

        function animateCursor() {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effect on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .servico-card, .preco-item, .preco-category-card, .depoimento-card, .horario-card, .loc-info-item, .social-icon');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
        });
    } else {
        // Hide cursor elements on touch devices
        if (cursorRing) cursorRing.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
    }

    // ==========================
    // TEXT SCRAMBLE EFFECT
    // ==========================
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            this.originalText = el.textContent;
        }

        animate() {
            const text = this.originalText;
            const length = text.length;
            let iteration = 0;
            const totalIterations = length * 3;

            const interval = setInterval(() => {
                this.el.textContent = text
                    .split('')
                    .map((char, index) => {
                        if (index < iteration / 3) {
                            return text[index];
                        }
                        if (char === ' ') return ' ';
                        return this.chars[Math.floor(Math.random() * this.chars.length)];
                    })
                    .join('');

                iteration++;
                if (iteration >= totalIterations) {
                    this.el.textContent = text;
                    clearInterval(interval);
                }
            }, 30);
        }
    }

    // Run text scramble on hero title lines after loader
    setTimeout(() => {
        document.querySelectorAll('[data-scramble]').forEach((el, i) => {
            setTimeout(() => {
                new TextScramble(el).animate();
            }, i * 400 + 800);
        });
    }, 1500);

    // ==========================
    // 3D TILT CARDS
    // ==========================
    const tiltCards = document.querySelectorAll('.tilt-card');

    if (window.matchMedia('(pointer: fine)').matches) {
        tiltCards.forEach(card => {
            const inner = card.querySelector('.servico-card-inner');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                inner.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                inner.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
                inner.style.transition = 'transform 0.5s ease';
                setTimeout(() => {
                    inner.style.transition = '';
                }, 500);
            });

            card.addEventListener('mouseenter', () => {
                inner.style.transition = 'none';
            });
        });
    }

    // ==========================
    // SCROLL REVEAL
    // ==========================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, parseInt(delay));
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================
    // NAVBAR SCROLL
    // ==========================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = scrollY;
    }, { passive: true });

    // ==========================
    // HAMBURGER MENU
    // ==========================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // ==========================
    // ANIMATED COUNTERS
    // ==========================
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    animateCounter(el, target);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    function animateCounter(el, target) {
        let current = 0;
        const duration = 2000;
        const start = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function step(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);

            current = Math.floor(easedProgress * target);
            el.textContent = current.toLocaleString('pt-BR');

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString('pt-BR');
            }
        }

        requestAnimationFrame(step);
    }

    // ==========================
    // SMOOTH SCROLL
    // ==========================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = navbar.offsetHeight + 20;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================
    // PRICE ITEM GLOW ON HOVER
    // ==========================
    const precoItems = document.querySelectorAll('.preco-item');
    precoItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.boxShadow = 'inset 0 0 30px rgba(212, 168, 67, 0.05)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.boxShadow = 'none';
        });
    });

    // ==========================
    // SCHEDULE: HIGHLIGHT TODAY
    // ==========================
    const dayMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const todayKey = dayMap[new Date().getDay()];
    const todayCard = document.querySelector(`.horario-card[data-day="${todayKey}"]`);
    if (todayCard) {
        todayCard.classList.add('today-highlight');
    }

    // ==========================
    // PARALLAX ORBITAL RINGS
    // ==========================
    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            const rings = document.querySelectorAll('.orbital-ring');
            rings.forEach((ring, i) => {
                const factor = (i + 1) * 5;
                ring.style.transform = `translate(calc(-50% + ${x * factor}px), calc(-50% + ${y * factor}px)) rotateX(60deg) rotateZ(${Date.now() / (2000 + i * 1000)}deg)`;
            });
        });
    }

})();
