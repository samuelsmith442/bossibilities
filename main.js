// Handle menu overlay clicks
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('#nav-links');
    const navbar = document.querySelector('.navbar');
    const body = document.body;

    // Add background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toggle mobile menu
    mobileNavToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
        mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
        
        if (window.innerWidth <= 768) {
            navLinks.classList.toggle('active');
            mobileNavToggle.classList.toggle('is-active');
            body.classList.toggle('menu-open');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            mobileNavToggle.classList.remove('is-active');
            body.classList.remove('menu-open');
        }
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                mobileNavToggle.classList.remove('is-active');
                body.classList.remove('menu-open');
            }
        });
    });

    // Close mobile menu when window is resized to desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            mobileNavToggle.classList.remove('is-active');
            body.classList.remove('menu-open');
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            mobileNavToggle.classList.remove('is-active');
            body.classList.remove('menu-open');
        }
    });

    // Shopping cart functionality
    updateCartCount();
});

// Shopping cart functionality
function addToBasket(productId, price, imageUrl, name) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
        id: productId,
        price: price,
        image: imageUrl,
        name: name,
        quantity: 1
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Item added to basket!');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.length;
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'block' : 'none';
    }
}

// Ebook download functionality
function downloadEbook(bookId) {
    try {
        const viewerUrl = `viewer.html?bookId=${encodeURIComponent(bookId)}`;
        window.open(viewerUrl, '_blank');
    } catch (error) {
        console.error('Error opening viewer:', error);
        alert('Error opening the ebook viewer. Please try again.');
    }
}

// Initialize carousel if it exists
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

    nextButton.addEventListener('click', moveNext);
    prevButton.addEventListener('click', movePrev);

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('.dot');
        if (!targetDot) return;
        const targetIndex = dots.indexOf(targetDot);
        moveToSlide(targetIndex);
    });

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
        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                moveNext();
            } else {
                movePrev();
            }
        }
    });

    let intervalId = setInterval(moveNext, 5000);

    track.addEventListener('mouseenter', () => clearInterval(intervalId));
    track.addEventListener('mouseleave', () => {
        clearInterval(intervalId);
        intervalId = setInterval(moveNext, 5000);
    });

    track.addEventListener('touchstart', () => clearInterval(intervalId));
    track.addEventListener('touchend', () => {
        clearInterval(intervalId);
        intervalId = setInterval(moveNext, 5000);
    });
}

// Initialize carousel if it exists
const carousel = document.querySelector('.carousel-container');
if (carousel) {
    initCarousel();
}
