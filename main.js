// Handle menu overlay clicks
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('#nav-links');
    const navbar = document.querySelector('.navbar');
    const body = document.body;

    // Set active class for current page
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('#nav-links a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        const hrefPage = itemHref.split('/').pop();
        
        if (currentPage === hrefPage || 
            (currentPage === '' && hrefPage === 'index.html') || 
            (currentPage === '/' && hrefPage === 'index.html')) {
            item.classList.add('active');
        }
    });

    // Add background on scroll
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Toggle mobile menu
    const toggleMobileMenu = (show) => {
        navLinks.classList.toggle('active', show);
        mobileNavToggle.classList.toggle('is-active', show);
        body.classList.toggle('menu-open', show);
        mobileNavToggle.setAttribute('aria-expanded', show);
    };

    mobileNavToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu(!navLinks.classList.contains('active'));
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu(false);
            }
        });
    });

    // Close mobile menu when window is resized to desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Initialize carousel if it exists
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        initCarousel();
    }

    // Scroll Animation Observer
    const animateOnScroll = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px'
        });

        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(element => {
            observer.observe(element);
        });
    };

    animateOnScroll();
});

// Initialize carousel if it exists
function initCarousel() {
    const carousel = document.querySelector('.carousel-container');
    
    if (!carousel) {
        console.error('Carousel container not found');
        return;
    }
    
    console.log('Initializing carousel');
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    console.log('Slides found:', slides.length);
    
    // Log each slide's image src
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        if (img) {
            console.log(`Slide ${index} image src: ${img.src}`);
            // Force image to be visible
            img.style.display = 'block';
            img.onerror = function() {
                console.error(`Failed to load image for slide ${index}: ${img.src}`);
            };
            img.onload = function() {
                console.log(`Successfully loaded image for slide ${index}: ${img.src}`);
            };
        } else {
            console.error(`No image found in slide ${index}`);
        }
    });
    
    const dots = carousel.querySelectorAll('.dot');
    const totalSlides = slides.length;
    
    console.log(`Found ${totalSlides} slides and ${dots.length} dots`);
    
    let currentSlide = 0;
    let isTransitioning = false;

    function updateCarousel() {
        // Update slides
        slides.forEach((slide, index) => {
            const offset = (index - currentSlide) * 100;
            console.log(`Setting transform for slide ${index} to translateX(${offset}%)`);
            slide.style.transform = `translateX(${offset}%)`;
            slide.style.opacity = index === currentSlide ? '1' : '0';
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        console.log(`Current slide is now ${currentSlide}`);
    }

    function goToSlide(slideIndex) {
        if (!isTransitioning) {
            isTransitioning = true;
            currentSlide = slideIndex;
            console.log(`Going to slide ${slideIndex}`);
            updateCarousel();
            setTimeout(() => isTransitioning = false, 600);
        }
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }

    // Add navigation buttons
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');

    if (prevButton && nextButton) {
        console.log('Adding button event listeners');
        prevButton.addEventListener('click', function() {
            console.log('Previous button clicked');
            prevSlide();
        });
        nextButton.addEventListener('click', function() {
            console.log('Next button clicked');
            nextSlide();
        });
    } else {
        console.error('Carousel buttons not found');
    }

    // Add dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            console.log(`Dot ${index} clicked`);
            goToSlide(index);
        });
    });

    // Initialize carousel
    updateCarousel();
    console.log('Carousel initialized successfully');

    // Auto-advance slides
    let autoAdvance = setInterval(nextSlide, 5000);
    
    // Add event listener to pause auto-advance when hovering over carousel
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoAdvance);
        console.log('Auto-advance paused');
    });
    
    carousel.addEventListener('mouseleave', () => {
        clearInterval(autoAdvance);
        autoAdvance = setInterval(nextSlide, 5000);
        console.log('Auto-advance resumed');
    });
}
