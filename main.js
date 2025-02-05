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

    // Initialize success page if we're on the success page
    if (window.location.pathname.includes('success')) {
        console.log('On success page, initializing...');
        initializeSuccessPage();
    }

    // Initialize carousel if it exists
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        initCarousel();
    }
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

// Success page functionality
function initializeSuccessPage() {
    console.log('initializeSuccessPage called');
    
    // Get session_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    console.log('Session ID:', sessionId);
    
    if (sessionId) {
        const downloadSection = document.getElementById('download-section');
        const downloadButton = document.getElementById('download-button');
        console.log('Download section:', downloadSection);
        console.log('Download button:', downloadButton);
        
        if (downloadSection && downloadButton) {
            downloadSection.style.display = 'block';
            
            downloadButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Download button clicked');
                
                try {
                    // Disable button and show loading state
                    downloadButton.disabled = true;
                    downloadButton.textContent = 'Verifying Payment...';

                    // First verify the payment
                    fetch(`/api/verify-payment/${sessionId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            
                            console.log('Download URL:', data.downloadUrl);
                            
                            // Create an anchor element for download
                            const a = document.createElement('a');
                            a.href = data.downloadUrl;
                            a.download = '7-Day-Mental-Ebook.pdf'; // Suggest filename
                            a.style.display = 'none';
                            document.body.appendChild(a);
                            
                            // Trigger download
                            a.click();
                            
                            // Clean up
                            setTimeout(() => {
                                document.body.removeChild(a);
                                downloadButton.textContent = 'Download Started!';
                                setTimeout(() => {
                                    downloadButton.disabled = false;
                                    downloadButton.textContent = 'Download eBook Again';
                                }, 3000);
                            }, 1000);
                        })
                        .catch(error => {
                            console.error('Download error:', error);
                            downloadButton.disabled = false;
                            downloadButton.textContent = 'Try Download Again';
                            alert('Download failed. Please try again or contact support.');
                        });
                } catch (error) {
                    console.error('Error initiating download:', error);
                    downloadButton.disabled = false;
                    downloadButton.textContent = 'Try Download Again';
                    alert('Download failed. Please try again or contact support.');
                }
            });
        } else {
            console.error('Download section or button not found');
        }
    } else {
        console.error('No session ID found in URL');
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
