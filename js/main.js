/* ============================================
   Mississauga Furnished Apartments - Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.querySelector('.header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
        header.classList.remove('transparent');
      } else {
        header.classList.remove('scrolled');
        header.classList.add('transparent');
      }
    };
    // Check on load (for pages that might start scrolled)
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // --- Mobile hamburger menu ---
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.header-nav');
  const overlay = document.querySelector('.mobile-overlay');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll animations (IntersectionObserver) ---
  const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  // --- Scroll to top button ---
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Gallery lightbox ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');

  if (galleryItems.length > 0 && lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    let currentIndex = 0;

    const images = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      return img ? img.getAttribute('data-full') || img.src : '';
    });

    function showImage(index) {
      currentIndex = index;
      if (lightboxImg) lightboxImg.src = images[index];
      if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${images.length}`;
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        showImage(index);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', () => {
        showImage((currentIndex - 1 + images.length) % images.length);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', () => {
        showImage((currentIndex + 1) % images.length);
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') showImage((currentIndex + 1) % images.length);
    });
  }

  // --- Tabs (Facilities page) ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        // Deactivate all
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        // Activate clicked
        btn.classList.add('active');
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');
      });
    });
  }

  // --- Pricing toggle ---
  const pricingToggles = document.querySelectorAll('.pricing-toggle-btn');
  if (pricingToggles.length > 0) {
    pricingToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-pricing');
        pricingToggles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.pricing-card').forEach(card => {
          const regularPrice = card.querySelector('.regular-price');
          const summerPrice = card.querySelector('.summer-price');
          if (mode === 'summer') {
            if (regularPrice) regularPrice.style.display = 'none';
            if (summerPrice) summerPrice.style.display = 'block';
          } else {
            if (regularPrice) regularPrice.style.display = 'block';
            if (summerPrice) summerPrice.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Testimonial slider ---
  const testimonials = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (testimonials.length > 0) {
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
      testimonials.forEach(t => t.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      testimonials[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      currentSlide = index;
    }

    function nextSlide() {
      showSlide((currentSlide + 1) % testimonials.length);
    }

    // Auto-advance every 5 seconds
    slideInterval = setInterval(nextSlide, 5000);

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        showSlide(index);
        slideInterval = setInterval(nextSlide, 5000);
      });
    });
  }

  // --- Newsletter form ---
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const success = form.parentElement.querySelector('.newsletter-success');
      if (input && input.value.trim()) {
        if (success) {
          success.style.display = 'block';
          success.textContent = 'Thank you!';
        }
        input.value = '';
        setTimeout(() => {
          if (success) success.style.display = 'none';
        }, 3000);
      }
    });
  });

  // --- Booking form validation ---
  const bookingForm = document.querySelector('.booking-form form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      bookingForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      bookingForm.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');

      // Validate required fields
      const name = bookingForm.querySelector('[name="name"]');
      if (name && !name.value.trim()) {
        name.classList.add('error');
        const err = name.parentElement.querySelector('.form-error');
        if (err) err.style.display = 'block';
        isValid = false;
      }

      const email = bookingForm.querySelector('[name="email"]');
      if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error');
        const err = email.parentElement.querySelector('.form-error');
        if (err) err.style.display = 'block';
        isValid = false;
      }

      if (isValid) {
        const successMsg = bookingForm.parentElement.querySelector('.form-success');
        if (successMsg) {
          bookingForm.style.display = 'none';
          successMsg.style.display = 'block';
        }
      }
    });
  }

  // --- Lazy loading images ---
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length > 0) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px'
    });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

});
