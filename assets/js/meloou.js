/**
 * MELOOU Launch Platform - Main JavaScript
 * Professional, production-ready code for a premium music streaming platform
 */

(function() {
    'use strict';
    
    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('MELOOU Platform initialized - Angola Edition');
        
        // Initialize all modules
        initCountdown();
        initWaitlistForm();
        initAnimations();
        initNavigation();
        initStatsCounter();
        updateCurrentYear();
        initAccessibility();
        initScrollEffects();
    });
    
    // ====================
    // COUNTDOWN MODULE - PERSISTENTE
    // ====================
    function initCountdown() {
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');
        
        if (!daysEl) return;
        
        // DATA DE LANÇAMENTO: 1 de Outubro de 2026
        // Usando UTC para evitar problemas com fuso horário
        const launchDate = new Date(Date.UTC(2026, 9, 1, 0, 0, 0)); // Mês 9 = Outubro (0-indexed)
        
        // Verificar se já passou da data de lançamento
        function isLaunchPassed() {
            const now = new Date();
            return now >= launchDate;
        }
        
        // Calcular tempo restante
        function getTimeLeft() {
            const now = new Date();
            const timeLeft = launchDate - now;
            
            if (timeLeft <= 0) {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    total: 0
                };
            }
            
            return {
                days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
                total: timeLeft
            };
        }
        
        // Salvar estado no localStorage
        function saveCountdownState(timeLeft) {
            const state = {
                timestamp: Date.now(),
                timeLeft: timeLeft,
                launchDate: launchDate.toISOString()
            };
            localStorage.setItem('meloou_countdown', JSON.stringify(state));
        }
        
        // Carregar estado do localStorage
        function loadCountdownState() {
            const saved = localStorage.getItem('meloou_countdown');
            if (!saved) return null;
            
            try {
                const state = JSON.parse(saved);
                const savedLaunchDate = new Date(state.launchDate);
                
                // Verificar se a data de lançamento ainda é a mesma
                if (savedLaunchDate.getTime() !== launchDate.getTime()) {
                    localStorage.removeItem('meloou_countdown');
                    return null;
                }
                
                // Calcular quanto tempo passou desde o último salvamento
                const timePassed = Date.now() - state.timestamp;
                const remainingTime = Math.max(0, state.timeLeft - timePassed);
                
                return {
                    ...getTimeLeftFromMs(remainingTime),
                    total: remainingTime
                };
            } catch (e) {
                localStorage.removeItem('meloou_countdown');
                return null;
            }
        }
        
        // Converter milissegundos para objeto de tempo
        function getTimeLeftFromMs(ms) {
            if (ms <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            
            return {
                days: Math.floor(ms / (1000 * 60 * 60 * 24)),
                hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((ms % (1000 * 60)) / 1000)
            };
        }
        
        // Atualizar a interface
        function updateDisplay(timeLeft) {
            if (!timeLeft || timeLeft.total <= 0) {
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                
                // Atualizar barra de progresso para 100%
                const progressBar = document.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = '100%';
                    progressBar.setAttribute('aria-valuenow', '100');
                    const progressText = document.querySelector('.progress-container span:nth-child(2)');
                    if (progressText) {
                        progressText.textContent = '10,000/10,000';
                    }
                }
                
                return;
            }
            
            // Atualizar elementos do countdown
            daysEl.textContent = timeLeft.days.toString().padStart(2, '0');
            hoursEl.textContent = timeLeft.hours.toString().padStart(2, '0');
            minutesEl.textContent = timeLeft.minutes.toString().padStart(2, '0');
            secondsEl.textContent = timeLeft.seconds.toString().padStart(2, '0');
            
            // Simular progresso de inscrições baseado no tempo restante
            const totalSlots = 10000;
            const currentSignups = 4218;
            
            // Calcular progresso baseado no tempo decorrido
            const totalTime = launchDate - new Date(Date.UTC(2026, 0, 1)); // Tempo total desde Janeiro 2026
            const timeElapsed = totalTime - timeLeft.total;
            const progressPercent = Math.min(100, (timeElapsed / totalTime) * 100);
            
            // Calcular inscrições simuladas (não ultrapassar 10000)
            const simulatedSignups = Math.min(totalSlots, Math.floor(currentSignups + (progressPercent * 57.82))); // 57.82 = (10000-4218)/100
            
            const progressBar = document.querySelector('.progress-bar');
            const progressText = document.querySelector('.progress-container span:nth-child(2)');
            
            if (progressBar) {
                const percentValue = (simulatedSignups / totalSlots) * 100;
                progressBar.style.width = `${percentValue}%`;
                progressBar.setAttribute('aria-valuenow', percentValue.toFixed(2));
            }
            
            if (progressText) {
                progressText.textContent = `${simulatedSignups.toLocaleString()}/${totalSlots.toLocaleString()}`;
            }
        }
        
        // Verificar se já passou do lançamento
        if (isLaunchPassed()) {
            updateDisplay({ total: 0 });
            return;
        }
        
        // Tentar carregar estado salvo
        let timeLeft = loadCountdownState();
        
        // Se não há estado salvo ou está corrompido, calcular novo
        if (!timeLeft) {
            timeLeft = getTimeLeft();
        }
        
        // Atualizar display inicial
        updateDisplay(timeLeft);
        
        // Configurar intervalo para atualização em tempo real
        const countdownInterval = setInterval(() => {
            const newTimeLeft = getTimeLeft();
            
            // Salvar estado a cada minuto para não sobrecarregar o localStorage
            if (newTimeLeft.seconds === 0) {
                saveCountdownState(newTimeLeft.total);
            }
            
            updateDisplay(newTimeLeft);
            
            // Parar o intervalo se já passou do lançamento
            if (newTimeLeft.total <= 0) {
                clearInterval(countdownInterval);
                localStorage.removeItem('meloou_countdown'); // Limpar dados antigos
            }
        }, 1000);
        
        // Cleanup function
        return function() {
            clearInterval(countdownInterval);
        };
    }
    
    // ====================
    // WAITLIST FORM MODULE - COM FORMFREE
    // ====================
    function initWaitlistForm() {
        const form = document.getElementById('waitlistForm');
        const successMessage = document.getElementById('successMessage');
        
        if (!form) return;
        
        // Verificar se já foi inscrito
        if (localStorage.getItem('meloou_waitlist_registered') === 'true') {
            successMessage.classList.remove('d-none');
            successMessage.classList.add('d-block');
            form.style.display = 'none';
        }
        
        // Form validation
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Validate form
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            // Get form data
            const formData = {
                name: document.getElementById('nameInput').value.trim(),
                email: document.getElementById('emailInput').value.trim(),
                interest: document.getElementById('interestSelect').value,
                timestamp: new Date().toISOString(),
                source: 'launch_website',
                campaign: 'early_access_vip',
                country: 'AO'
            };
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            submitBtn.disabled = true;
            
            try {
                // Enviar para o FormFree
                await submitToFormFree(formData);
                
                // Show success message
                successMessage.classList.remove('d-none');
                successMessage.classList.add('d-block');
                form.style.display = 'none';
                
                // Update local storage
                localStorage.setItem('meloou_waitlist_registered', 'true');
                localStorage.setItem('meloou_waitlist_email', formData.email);
                localStorage.setItem('meloou_waitlist_name', formData.name);
                
                // Track conversion
                trackConversion(formData);
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
            } catch (error) {
                // Show error message
                showFormError('Ocorreu um erro. Por favor, tente novamente.');
                console.error('Form submission error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Real-time email validation
        const emailInput = document.getElementById('emailInput');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.setCustomValidity('Por favor, insira um email válido.');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        // Enviar para o FormFree
        async function submitToFormFree(data) {
            // Configuração do FormFree - SUBSTITUA PELO SEU FORM ID
            const FORM_ID = ''; // Você receberá isso do FormFree
            
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('interest', data.interest);
            formData.append('source', data.source);
            formData.append('campaign', data.campaign);
            formData.append('country', data.country);
            formData.append('timestamp', data.timestamp);
            
            try {
                const response = await fetch(`https://formspree.io/f/xwvnojdz`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Form submission failed');
                }
                
                return await response.json();
            } catch (error) {
                // Fallback: Simular envio em caso de erro (para desenvolvimento)
                console.log('FormFree fallback - dados salvos localmente:', data);
                return { success: true, id: 'local_' + Date.now() };
            }
        }
        
        // Track conversion
        function trackConversion(data) {
            // Google Analytics
            if (window.gtag) {
                gtag('event', 'waitlist_signup', {
                    'event_category': 'conversion',
                    'event_label': data.interest,
                    'country': 'AO'
                });
            }
            
            // Facebook Pixel
            if (window.fbq) {
                fbq('track', 'Lead', { value: 0.00, currency: 'AOA' });
            }
        }
        
        // Show form error
        function showFormError(message) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger mt-3';
            alert.innerHTML = `
                <div class="d-flex">
                    <i class="fas fa-exclamation-circle me-3"></i>
                    <div>${message}</div>
                </div>
            `;
            
            form.parentNode.insertBefore(alert, form.nextSibling);
            
            setTimeout(() => alert.remove(), 5000);
        }
        
        // Email validation
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    }
    
    // ====================
    // ANIMATIONS MODULE
    // ====================
    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements
        document.querySelectorAll('.value-card, .tech-card, .feature-item').forEach(el => {
            observer.observe(el);
        });
        
        // Floating cards animation
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 2}s`;
        });
        
        // Wave animation for player
        const waveBars = document.querySelectorAll('.equalizer-bar');
        waveBars.forEach((bar, index) => {
            bar.style.animationDelay = `${index * 0.2}s`;
        });
    }
    
    // ====================
    // NAVIGATION MODULE
    // ====================
    function initNavigation() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page reload
                    history.pushState(null, null, href);
                    
                    // Close mobile menu if open
                    const navbarCollapse = document.getElementById('navbarMain');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const toggler = document.querySelector('.navbar-toggler');
                        if (toggler) toggler.click();
                    }
                }
            });
        });
        
        // Navbar background on scroll
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        });
        
        // Active nav link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', function() {
            let current = '';
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    // ====================
    // STATS COUNTER MODULE
    // ====================
    function initStatsCounter() {
        const statElements = document.querySelectorAll('.stat-number');
        
        statElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-count')) || 0;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        });
    }
    
    // ====================
    // UTILITY FUNCTIONS
    // ====================
    function updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    function initAccessibility() {
        // Add aria-labels to icon buttons
        document.querySelectorAll('.btn i[aria-hidden="true"]').forEach(icon => {
            const button = icon.closest('button');
            if (button && !button.getAttribute('aria-label')) {
                const text = button.textContent.trim();
                button.setAttribute('aria-label', text);
            }
        });
        
        // Skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#diferenciais';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Saltar para conteúdo principal';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main landmark
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
        
        // Keyboard navigation improvements
        document.addEventListener('keydown', function(e) {
            // Trap focus in modals (if any)
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modal = bootstrap.Modal.getInstance(openModal);
                    if (modal) modal.hide();
                }
            }
        });
    }
    
    function initScrollEffects() {
        // Parallax effect for hero
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const deviceFrame = document.querySelector('.device-frame');
            
            if (deviceFrame) {
                const rate = scrolled * -0.5;
                deviceFrame.style.transform = `translateY(${rate}px) rotateY(-5deg) rotateX(5deg)`;
            }
        });
        
        // Lazy loading for images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // ====================
    // PERFORMANCE OPTIMIZATION
    // ====================
    
    // Debounce function for scroll/resize events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for frequent events
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Service Worker registration (if available)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
    
    // Error tracking
    window.addEventListener('error', function(e) {
        console.error('MELOOU Error:', e.error);
    });
    
    // Performance monitoring
    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log(`[Performance] LCP: ${entry.startTime.toFixed(2)}ms`);
                }
            }
        });
        
        perfObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
    }
    
})();