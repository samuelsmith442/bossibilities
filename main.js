// Ebook download functionality
document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('.download-ebook');
    downloadButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const bookId = button.getAttribute('data-book-id');
            if (bookId === 'mens-7-day-mental-ebook') {
                try {
                    const response = await fetch(`/api/ebook/${bookId}`);
                    if (!response.ok) {
                        throw new Error('Failed to get download URL');
                    }
                    const data = await response.json();
                    
                    // Create a temporary link and click it to start the download
                    const link = document.createElement('a');
                    link.href = data.downloadUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error('Error downloading ebook:', error);
                    alert('Error downloading the ebook. Please try again.');
                }
            }
        });
    });

    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav ul');
    const body = document.body;
    const overlay = document.querySelector('.menu-overlay');
    
    function toggleMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        body.classList.toggle('menu-open');
        overlay.classList.toggle('active');
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // Animation on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animatedElements = document.querySelectorAll('.slide-in-left, .slide-in-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });

    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                alert('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
            }
        });
    }

    // Handle hamburger menu
    const menuOverlay = document.querySelector('.menu-overlay');
    const navbar = document.querySelector('.navbar');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    menuOverlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        menuOverlay.classList.remove('active');
        navbar.classList.remove('active');
    });

    // Handle page transitions
    document.documentElement.classList.remove('loading');

    // Add loading class before page unload
    window.addEventListener('beforeunload', () => {
        document.documentElement.classList.add('loading');
    });

    // Handle form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add form submission logic here
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Carousel functionality
    function initCarousel() {
        const track = document.querySelector('.carousel-track');
        if (!track) return;

        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-button.next');
        const prevButton = document.querySelector('.carousel-button.prev');
        const dotsNav = document.querySelector('.carousel-dots');
        const dots = Array.from(dotsNav.children);

        let currentSlide = 0;
        let isTransitioning = false;
        
        // Initialize first slide and dot
        slides[0].dataset.active = true;
        dots[0].classList.add('active');

        function updateSlidePosition() {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        function updateDots() {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function moveToSlide(index) {
            if (isTransitioning) return;
            isTransitioning = true;

            currentSlide = index;
            updateSlidePosition();
            updateDots();

            // Reset transition lock after animation completes
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
        }

        function moveNext() {
            const nextSlide = (currentSlide + 1) % slides.length;
            moveToSlide(nextSlide);
        }

        function movePrev() {
            const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
            moveToSlide(prevSlide);
        }

        // Click events
        nextButton.addEventListener('click', moveNext);
        prevButton.addEventListener('click', movePrev);

        // Dot navigation
        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('.dot');
            if (!targetDot) return;

            const targetIndex = dots.indexOf(targetDot);
            moveToSlide(targetIndex);
        });

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') movePrev();
            if (e.key === 'ArrowRight') moveNext();
        });

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        track.addEventListener('touchmove', e => {
            touchEndX = e.touches[0].clientX;
        }, { passive: true });

        track.addEventListener('touchend', () => {
            const difference = touchStartX - touchEndX;
            if (Math.abs(difference) > 50) { // Minimum swipe distance
                if (difference > 0) {
                    moveNext();
                } else {
                    movePrev();
                }
            }
        });

        // Auto advance slides
        let intervalId = setInterval(moveNext, 5000);

        // Pause auto-advance on hover
        track.addEventListener('mouseenter', () => clearInterval(intervalId));
        track.addEventListener('mouseleave', () => {
            clearInterval(intervalId);
            intervalId = setInterval(moveNext, 5000);
        });

        // Stop auto-advance on mobile touch
        track.addEventListener('touchstart', () => clearInterval(intervalId));
        track.addEventListener('touchend', () => {
            clearInterval(intervalId);
            intervalId = setInterval(moveNext, 5000);
        });
    }

    // Initialize carousel when DOM is loaded
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        initCarousel();
    }
});
