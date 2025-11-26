const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const scrollTopBtn = document.getElementById('scrollTop');
const navLinks = document.querySelectorAll('.header__nav-link');
const contactForm = document.getElementById('contactForm');
const videoPlaceholder = document.querySelector('.video-section__placeholder');
const mainVideo = document.getElementById('mainVideo');

const dropdownLinks = document.querySelectorAll('.dropdown-link');
const dropdownItems = document.querySelectorAll('.header__nav-item.dropdown');


let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
    lastScroll = currentScroll;
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
        dropdownItems.forEach(item => {
            item.classList.remove('open');
            const content = item.querySelector('.dropdown-content');
            if (content) content.style.maxHeight = null;
        });
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (link.classList.contains('dropdown-link') && href === '#') {
            e.preventDefault(); 
            return; 
        }
        
        if (href.startsWith('#')) {
            e.preventDefault();
            
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});


dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 || navMenu.classList.contains('active')) {
            e.preventDefault(); 
            const parentItem = link.closest('.header__nav-item');
            const content = parentItem.querySelector('.dropdown-content');

            dropdownItems.forEach(item => {
                if (item !== parentItem) {
                    item.classList.remove('open');
                    if (item.querySelector('.dropdown-content')) {
                        item.querySelector('.dropdown-content').style.maxHeight = null;
                    }
                }
            });

            parentItem.classList.toggle('open');
            
            if (parentItem.classList.contains('open')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = null;
            }
        }
    });
});


function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    const headerHeight = header.offsetHeight;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('header__nav-link--active');
                if (!link.classList.contains('dropdown-link') && link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('header__nav-link--active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const revealCallback = (entries, observer) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
};

const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

const revealElements = document.querySelectorAll(`
    .service-card,
    .about__benefit,
    .stat-card,
    .video-section__content,
    .podcast__player,
    .contact__detail,
    .form-group
`);

revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${index * 0.1}s`;
    revealObserver.observe(el);
});

if (videoPlaceholder && mainVideo) {
    videoPlaceholder.addEventListener('click', () => {
        videoPlaceholder.style.display = 'none';
        mainVideo.style.display = 'block';
        mainVideo.play();
    });
    mainVideo.addEventListener('ended', () => {
        videoPlaceholder.style.display = 'flex';
        mainVideo.style.display = 'none';
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        const inputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#EF4444';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 2000);
            }
        });
        if (!isValid) {
            showNotification('Por favor, completa todos los campos requeridos', 'error');
            return;
        }
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        setTimeout(() => {
            submitBtn.textContent = '✓ Enviado';
            submitBtn.style.background = '#10B981';
            showNotification('¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.', 'success');
            contactForm.reset();
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }, 2000);
        console.log('Datos del formulario:', data);
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        maxWidth: '400px',
        fontSize: '0.95rem',
        fontWeight: '600',
        animation: 'slideInRight 0.3s ease',
        background: type === 'success' ? '#10B981' : '#EF4444',
        color: '#FFFFFF'
    });
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

const podcastAudio = document.getElementById('podcastAudio');

if (podcastAudio) {
    podcastAudio.addEventListener('play', () => {
        console.log('Podcast iniciado');
    });
    podcastAudio.addEventListener('pause', () => {
        console.log('Podcast pausado');
    });
    podcastAudio.addEventListener('ended', () => {
        console.log('Podcast finalizado');
        showNotification('¡Gracias por escuchar nuestro podcast!', 'success');
    });
}

const heroCube = document.querySelector('.hero__cube');

if (heroCube) {
    let mouseX = 0;
    let mouseY = 0;
    let cubeRotationX = 0;
    let cubeRotationY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
    function animateCube() {
        cubeRotationX += (mouseY * 20 - cubeRotationX) * 0.05;
        cubeRotationY += (mouseX * 20 - cubeRotationY) * 0.05;
        const currentRotation = heroCube.style.transform || '';
        if (!currentRotation.includes('rotateX') && !currentRotation.includes('rotateY')) {
            heroCube.style.transform = `
                rotateX(${cubeRotationX}deg) 
                rotateY(${cubeRotationY}deg)
            `;
        }
        requestAnimationFrame(animateCube);
    }
    animateCube();
}

const heroParticles = document.querySelector('.hero__particles');

if (heroParticles) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        heroParticles.style.transform = `translateY(${rate}px)`;
    });
}

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                observer.unobserve(img);
            }
        });
    });
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
}

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (element.dataset.suffix || '');
        }
    }, 16);
}

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const number = entry.target.querySelector('.stat-card__number');
            const value = parseInt(number.textContent);
            if (number.textContent.includes('+')) {
                number.dataset.suffix = '+';
            } else if (number.textContent.includes('%')) {
                number.dataset.suffix = '%';
            }
            animateCounter(number, value, 2000);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
    statObserver.observe(card);
});

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
    updateActiveNavLink();
});

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.body.classList.add('is-mobile');
    const cube = document.querySelector('.hero__cube');
    if (cube) {
        cube.style.animation = 'none';
    }
}

window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Página cargada en ${Math.round(loadTime)}ms`);
});

window.addEventListener('error', (e) => {
    console.error('Error capturado:', e.message);
});

function trackEvent(category, action, label) {
    console.log('Analytics Event:', { category, action, label });
}

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('CTA', 'Click', btn.textContent.trim());
    });
});

console.log('%c🚀 IAceleración - Sitio Web Cargado', 'color: #00FFFF; font-size: 16px; font-weight: bold;');
console.log('%cDesarrollado con estándares profesionales', 'color: #0047AB; font-size: 12px;');

