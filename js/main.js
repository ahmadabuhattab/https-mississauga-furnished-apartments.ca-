/* ============================================
   Mississauga Furnished Apartments - ELITE v2 JS
   $300K Luxury Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Smooth page entrance ---
  document.body.classList.add('page-loaded');

  // --- Header scroll effect with glassmorphism ---
  const header = document.querySelector('.header');
  if (header) {
    let lastScroll = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
        header.classList.remove('transparent');
      } else {
        header.classList.remove('scrolled');
        header.classList.add('transparent');
      }
      // Hide header on scroll down, show on scroll up (only after 300px)
      if (scrollY > 300) {
        if (scrollY > lastScroll + 5) {
          header.style.transform = 'translateY(-100%)';
        } else if (scrollY < lastScroll - 5) {
          header.style.transform = 'translateY(0)';
        }
      } else {
        header.style.transform = 'translateY(0)';
      }
      lastScroll = scrollY;
    };
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

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll animations (IntersectionObserver) with stagger support ---
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

  // --- Stagger children animation ---
  const staggerContainers = document.querySelectorAll('.stagger-children');
  if (staggerContainers.length > 0) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    staggerContainers.forEach(el => staggerObserver.observe(el));
  }

  // --- Counter animation for stats ---
  const counterElements = document.querySelectorAll('.stat-number');
  if (counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const suffix = element.querySelector('.counter-suffix');
    const suffixText = suffix ? suffix.textContent : '';
    const duration = 2000;
    const start = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(target * easedProgress);

      if (suffix) {
        element.innerHTML = current + '<span class="counter-suffix">' + suffixText + '</span>';
      } else {
        element.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // --- Parallax effect on hero backgrounds ---
  const heroSection = document.querySelector('.hero');
  const heroBg = heroSection ? heroSection.querySelector('.hero-bg') : null;

  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      if (scrollY < heroHeight) {
        const parallaxSpeed = 0.4;
        heroBg.style.transform = 'scale(1.1) translateY(' + (scrollY * parallaxSpeed) + 'px)';
      }
    }, { passive: true });
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

  // --- Gallery lightbox with enhanced transitions ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');

  if (galleryItems.length > 0 && lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    let currentIndex = 0;
    let touchStartX = 0;

    const images = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      return img ? img.getAttribute('data-full') || img.src : '';
    });

    function showImage(index) {
      currentIndex = index;
      if (lightboxImg) {
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
          lightboxImg.src = images[index];
          lightboxImg.style.opacity = '1';
          lightboxImg.style.transform = 'scale(1)';
        }, 150);
      }
      if (lightboxCounter) lightboxCounter.textContent = (index + 1) + ' / ' + images.length;
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

    // Touch swipe support for lightbox
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showImage((currentIndex + 1) % images.length);
        } else {
          showImage((currentIndex - 1 + images.length) % images.length);
        }
      }
    }, { passive: true });
  }

  // --- Tabs (Facilities page) ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
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
          // Add a subtle scale animation on switch
          card.style.transform = 'scale(0.97)';
          card.style.opacity = '0.7';
          setTimeout(() => {
            if (mode === 'summer') {
              if (regularPrice) regularPrice.style.display = 'none';
              if (summerPrice) summerPrice.style.display = 'block';
            } else {
              if (regularPrice) regularPrice.style.display = 'block';
              if (summerPrice) summerPrice.style.display = 'none';
            }
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
          }, 200);
        });
      });
    });
  }

  // --- Testimonial slider with touch support ---
  const testimonials = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (testimonials.length > 0) {
    let currentSlide = 0;
    let slideInterval;
    let touchStartTestimonial = 0;

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

    slideInterval = setInterval(nextSlide, 5000);

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        showSlide(index);
        slideInterval = setInterval(nextSlide, 5000);
      });
    });

    // Touch swipe for testimonials
    const sliderContainer = document.querySelector('.testimonials-slider');
    if (sliderContainer) {
      sliderContainer.addEventListener('touchstart', (e) => {
        touchStartTestimonial = e.changedTouches[0].screenX;
      }, { passive: true });

      sliderContainer.addEventListener('touchend', (e) => {
        const diff = touchStartTestimonial - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          clearInterval(slideInterval);
          if (diff > 0) {
            showSlide((currentSlide + 1) % testimonials.length);
          } else {
            showSlide((currentSlide - 1 + testimonials.length) % testimonials.length);
          }
          slideInterval = setInterval(nextSlide, 5000);
        }
      }, { passive: true });
    }
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

      bookingForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      bookingForm.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');

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

  // --- Magnetic effect on primary buttons (desktop only) ---
  if (window.matchMedia('(hover: hover)').matches) {
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-book');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // --- Smooth reveal for hero content ---
  const heroContent = document.querySelector('.hero .hero-content');
  if (heroContent) {
    const children = heroContent.children;
    Array.from(children).forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
      child.style.transition = 'opacity 0.8s ease ' + (0.2 + i * 0.15) + 's, transform 0.8s ease ' + (0.2 + i * 0.15) + 's';
      setTimeout(() => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, 100);
    });
  }

  // --- Active nav link highlight ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

});
