/* ============================================
   Mississauga Furnished Apartments - ELITE v2 JS
   $300K Luxury Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      if (header.classList.contains('menu-open')) {
        header.style.transform = 'none';
        lastScroll = scrollY;
        return;
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
    const mobileMenu = window.matchMedia('(max-width: 968px)');
    let isOpen = false;
    let previousOverflow = null;
    const menuLinks = () => Array.from(navMenu.querySelectorAll('a[href]:not([tabindex="-1"])'));
    const focusFirstLink = () => (menuLinks()[0] || hamburger).focus({ preventScroll: true });

    const closeMenu = (restoreFocus = false) => {
      isOpen = false;
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
      navMenu.classList.remove('open');
      navMenu.toggleAttribute('inert', mobileMenu.matches);
      if (overlay) overlay.classList.remove('active');
      if (header) header.classList.remove('menu-open');
      document.body.classList.remove('mobile-menu-open');
      if (previousOverflow !== null) {
        if (previousOverflow.value) document.body.style.setProperty('overflow', previousOverflow.value, previousOverflow.priority);
        else document.body.style.removeProperty('overflow');
        previousOverflow = null;
      }
      if (restoreFocus && mobileMenu.matches) hamburger.focus({ preventScroll: true });
    };

    const openMenu = () => {
      if (!mobileMenu.matches || isOpen) return;
      previousOverflow = {
        value: document.body.style.getPropertyValue('overflow'),
        priority: document.body.style.getPropertyPriority('overflow'),
      };
      isOpen = true;
      navMenu.removeAttribute('inert');
      navMenu.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation menu');
      if (overlay) overlay.classList.add('active');
      if (header) {
        header.classList.add('menu-open');
        header.style.transform = 'none';
      }
      document.body.classList.add('mobile-menu-open');
      document.body.style.setProperty('overflow', 'hidden');
      focusFirstLink();
    };

    hamburger.addEventListener('click', () => isOpen ? closeMenu(true) : openMenu());
    if (overlay) overlay.addEventListener('click', () => closeMenu(true));
    navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(true)));

    document.addEventListener('keydown', (event) => {
      if (!isOpen || !mobileMenu.matches) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      } else if (event.key === 'Tab') {
        // Follow the DOM order: navigation links, then the persistent close button.
        const controls = [...menuLinks(), hamburger];
        const current = controls.indexOf(document.activeElement);
        if (current === -1 || (!event.shiftKey && current === controls.length - 1) || (event.shiftKey && current === 0)) {
          event.preventDefault();
          (event.shiftKey ? controls[controls.length - 1] : controls[0]).focus({ preventScroll: true });
        }
      }
    });
    document.addEventListener('focusin', (event) => {
      if (isOpen && mobileMenu.matches && event.target !== hamburger && !navMenu.contains(event.target)) focusFirstLink();
    });

    const syncMenuViewport = () => {
      const focusedNav = navMenu.contains(document.activeElement);
      const focusedHamburger = document.activeElement === hamburger;
      closeMenu();
      if (mobileMenu.matches && focusedNav) hamburger.focus({ preventScroll: true });
      else if (!mobileMenu.matches && focusedHamburger) focusFirstLink();
    };
    if (mobileMenu.addEventListener) mobileMenu.addEventListener('change', syncMenuViewport);
    else mobileMenu.addListener(syncMenuViewport);
    syncMenuViewport();
  }

  // Content and statistics render immediately; the design uses static photography.

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

    function preloadImage(index) {
      const src = images[(index + images.length) % images.length];
      if (src) {
        const img = new Image();
        img.src = src;
      }
    }

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
      // Warm up neighbours so next/prev feel instant
      preloadImage(index + 1);
      preloadImage(index - 1);
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
          card.classList.add('pricing-switching');
          setTimeout(() => {
            if (mode === 'summer') {
              if (regularPrice) regularPrice.style.display = 'none';
              if (summerPrice) summerPrice.style.display = 'block';
            } else {
              if (regularPrice) regularPrice.style.display = 'block';
              if (summerPrice) summerPrice.style.display = 'none';
            }
            card.classList.remove('pricing-switching');
          }, 200);
        });
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
      if (input && input.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        if (success) {
          success.style.display = 'block';
          success.textContent = 'Thank you!';
        }
        input.value = '';
        setTimeout(() => {
          if (success) success.style.display = 'none';
        }, 3000);
      } else if (input) {
        input.style.borderColor = '#e74c3c';
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
      }
    });
  });

  // --- Booking form validation ---
  const bookingForm = document.querySelector('.booking-form form');
  if (bookingForm) {
    const successMsg = bookingForm.parentElement.querySelector('.form-success');
    const reservationWasSent = new URLSearchParams(window.location.search).get('reservation') === 'sent';

    if (reservationWasSent && successMsg) {
      bookingForm.style.display = 'none';
      successMsg.style.display = 'block';
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      bookingForm.addEventListener('submit', (e) => {
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
        if (email && (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))) {
          email.classList.add('error');
          const err = email.parentElement.querySelector('.form-error');
          if (err) err.style.display = 'block';
          isValid = false;
        }

        const phone = bookingForm.querySelector('[name="phone"]');
        if (phone && !phone.value.trim()) {
          phone.classList.add('error');
          isValid = false;
        }

        if (!isValid) {
          e.preventDefault();
          return;
        }

        const submitButton = bookingForm.querySelector('[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Sending...';
        }
      });
    }
  }

  // Render primary content immediately; delaying its opacity delays the main paint.

  // --- Active nav link highlight (supports clean URLs and .html paths) ---
  const normalizePath = (path) => {
    let p = (path || '').split(/[?#]/)[0];
    if (!p.startsWith('/')) p = '/' + p;
    p = p.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return p || '/';
  };
  const currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll('.header-nav a').forEach(link => {
    if (normalizePath(link.getAttribute('href')) === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // --- Hover prefetch fallback for browsers without the Speculation Rules API ---
  const supportsSpeculation = typeof HTMLScriptElement !== 'undefined' &&
    typeof HTMLScriptElement.supports === 'function' &&
    HTMLScriptElement.supports('speculationrules');

  if (!supportsSpeculation && !navigator.connection?.saveData && !/2g/.test(navigator.connection?.effectiveType || '')) {
    const prefetched = new Set();
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.origin !== window.location.origin) return;
      const url = link.pathname;
      if (prefetched.has(url) || url === window.location.pathname) return;
      prefetched.add(url);
      const hint = document.createElement('link');
      hint.rel = 'prefetch';
      hint.href = url;
      document.head.appendChild(hint);
    }, { passive: true });
  }

});
