document.addEventListener('DOMContentLoaded', function () {
  document.documentElement.classList.add('js-loaded');
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // ============================================================
  // CHARACTER SPLIT UTILITY (for Enhancement #6)
  // ============================================================
  function splitChars(element) {
    const children = Array.from(element.childNodes);
    element.innerHTML = '';
    children.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent.split('').forEach(char => {
          if (char === ' ') {
            element.appendChild(document.createTextNode(' '));
          } else {
            const span = document.createElement('span');
            span.className = 'char-animate';
            span.textContent = char;
            span.style.display = 'inline-block';
            element.appendChild(span);
          }
        });
      } else if (child.nodeName === 'BR') {
        element.appendChild(child.cloneNode());
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const wrapper = child.cloneNode(false);
        const innerText = child.textContent;
        innerText.split('').forEach(char => {
          if (char === ' ') {
            wrapper.appendChild(document.createTextNode(' '));
          } else {
            const span = document.createElement('span');
            span.className = 'char-animate';
            span.textContent = char;
            span.style.display = 'inline-block';
            wrapper.appendChild(span);
          }
        });
        element.appendChild(wrapper);
      }
    });
    return element.querySelectorAll('.char-animate');
  }

  // ============================================================
  // LUXURY LOADING SCREEN (Enhancement #1)
  // ============================================================
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && !prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.set(loadingScreen, { clipPath: 'inset(0 0 0 0)' });
    const loaderTL = gsap.timeline({
      onComplete: () => {
        gsap.to(loadingScreen, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => loadingScreen.remove()
        });
        document.dispatchEvent(new Event('loader-done'));
      }
    });
    loaderTL
      .to('.loader-logo', { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' })
      .to('.loader-line', { width: '120px', duration: 1, ease: 'power2.inOut' }, '-=0.3')
      .to('.loader-tagline', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.4')
      .to({}, { duration: 0.5 });
  } else {
    if (loadingScreen) loadingScreen.remove();
    document.dispatchEvent(new Event('loader-done'));
  }

  // ============================================================
  // THREE.JS — 3D Gold Particle Field
  // ============================================================
  if (typeof THREE !== 'undefined' && !prefersReducedMotion && !isMobile) {
    const canvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('hero');
    if (canvas && heroSection) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const particleCount = 200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        sizes[i] = Math.random() * 3 + 1;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xC9A96E, size: 0.04, transparent: true,
        opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true
      });
      const particles = new THREE.Points(geometry, particleMaterial);
      scene.add(particles);

      const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
      const icoMat = new THREE.MeshBasicMaterial({ color: 0xC9A96E, wireframe: true, transparent: true, opacity: 0.12 });
      const icosahedron = new THREE.Mesh(icoGeo, icoMat);
      icosahedron.position.set(3, 0.5, -2);
      scene.add(icosahedron);

      const torusGeo = new THREE.TorusGeometry(0.6, 0.2, 12, 48);
      const torusMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, wireframe: true, transparent: true, opacity: 0.08 });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.position.set(-3.5, -1, -1);
      scene.add(torus);

      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      function animateThree() {
        requestAnimationFrame(animateThree);
        const heroRect = heroSection.getBoundingClientRect();
        if (heroRect.bottom < 0) return;
        particles.rotation.y += 0.0008;
        particles.rotation.x += 0.0003;
        icosahedron.rotation.x += 0.003;
        icosahedron.rotation.y += 0.005;
        torus.rotation.x += 0.004;
        torus.rotation.z += 0.006;
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }
      animateThree();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  }

  // ============================================================
  // HERO VIDEO FALLBACK (Enhancement #8)
  // ============================================================
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      heroVideo.setAttribute('data-error', 'true');
    });
    if (typeof IntersectionObserver !== 'undefined') {
      const videoObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          heroVideo.play().catch(() => {});
        } else {
          heroVideo.pause();
        }
      }, { threshold: 0.1 });
      videoObserver.observe(heroVideo);
    }
  }

  // ============================================================
  // GSAP + ScrollTrigger
  // ============================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // --- Scroll Progress Indicator (Enhancement #9) ---
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
      gsap.to(scrollProgress, {
        width: '100%', ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top', end: 'bottom bottom', scrub: 0.3
        }
      });
    }

    // --- Clear CSS and set GSAP initial states ---
    const allAnimated = '.scroll-hidden, .scroll-slide-left, .scroll-slide-right, .scroll-scale, .scroll-blur';
    gsap.set(allAnimated, { clearProps: 'opacity,transform,filter' });
    document.querySelectorAll('.scroll-hidden').forEach(el => gsap.set(el, { opacity: 0, y: 40 }));
    document.querySelectorAll('.scroll-slide-left').forEach(el => gsap.set(el, { opacity: 0, x: -80 }));
    document.querySelectorAll('.scroll-slide-right').forEach(el => gsap.set(el, { opacity: 0, x: 80 }));
    document.querySelectorAll('.scroll-scale').forEach(el => gsap.set(el, { opacity: 0, scale: 0.8 }));
    document.querySelectorAll('.scroll-blur').forEach(el => gsap.set(el, { opacity: 0, y: 30, filter: 'blur(15px)' }));
    document.querySelectorAll('.img-reveal').forEach(el => gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' }));

    // --- Character split for hero heading (Enhancement #6) ---
    const heroHeading = document.getElementById('hero-heading');
    let heroChars = [];
    if (heroHeading) {
      heroChars = splitChars(heroHeading);
      gsap.set(heroChars, { opacity: 0, y: 80, rotateX: 40 });
    }

    // --- Hero Entrance Timeline (paused, waits for loader) ---
    const heroTL = gsap.timeline({ paused: true });

    if (heroChars.length > 0) {
      heroTL.to(heroChars, {
        y: 0, opacity: 1, rotateX: 0, duration: 0.6,
        stagger: 0.03, ease: 'power3.out'
      });
    }
    heroTL.to('#hero .scroll-hidden', {
      y: 0, opacity: 1, duration: 0.7,
      stagger: 0.12, ease: 'power2.out'
    }, heroChars.length > 0 ? '-=0.3' : '0')
    .fromTo('.hero-float-product',
      { scale: 0.8, opacity: 0, rotateY: -20 },
      { scale: 1, opacity: 1, rotateY: 0, duration: 1.2, ease: 'power3.out' },
      '-=0.5'
    );

    // Play hero after loader finishes
    document.addEventListener('loader-done', () => {
      gsap.delayedCall(0.2, () => heroTL.play());
    }, { once: true });

    // --- Scroll-Triggered Animations ---
    gsap.utils.toArray('.scroll-hidden').forEach((el) => {
      if (el.closest('#hero')) return;
      const delay = el.classList.contains('stagger-1') ? 0.1 :
                    el.classList.contains('stagger-2') ? 0.2 :
                    el.classList.contains('stagger-3') ? 0.3 :
                    el.classList.contains('stagger-4') ? 0.4 : 0;
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        y: 0, opacity: 1, duration: 0.8, delay, ease: 'power2.out'
      });
    });

    gsap.utils.toArray('.scroll-slide-left').forEach((el) => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        x: 0, opacity: 1, duration: 1, ease: 'power3.out'
      });
    });

    gsap.utils.toArray('.scroll-slide-right').forEach((el) => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        x: 0, opacity: 1, duration: 1, ease: 'power3.out'
      });
    });

    gsap.utils.toArray('.scroll-scale').forEach((el, i) => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        scale: 1, opacity: 1, duration: 0.9, delay: i * 0.15, ease: 'back.out(1.4)'
      });
    });

    gsap.utils.toArray('.scroll-blur').forEach((el, i) => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        filter: 'blur(0px)', opacity: 1, y: 0, duration: 0.8,
        delay: i * 0.12, ease: 'power2.out'
      });
    });

    // --- Image Reveal + Ken Burns Zoom (Enhancement #10) ---
    gsap.utils.toArray('.img-reveal').forEach((img) => {
      gsap.to(img, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut',
        scrollTrigger: { trigger: img, start: 'top 88%', once: true }
      });
      if (!isMobile) {
        gsap.fromTo(img, { scale: 1.15 }, {
          scale: 1, ease: 'none',
          scrollTrigger: {
            trigger: img.closest('section') || img,
            start: 'top bottom', end: 'bottom top', scrub: 1.5
          }
        });
      }
    });

    // --- Animated Counter ---
    const statsBar = document.getElementById('stats-bar');
    if (statsBar) {
      ScrollTrigger.create({
        trigger: statsBar, start: 'top 80%', once: true,
        onEnter: () => {
          statsBar.querySelectorAll('.counter-value').forEach((el) => {
            const target = parseInt(el.dataset.count, 10);
            gsap.to({ val: 0 }, {
              val: target, duration: 2.5, ease: 'power2.out',
              onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val); }
            });
          });
        }
      });
    }

    // --- Parallax ---
    if (!isMobile) {
      const heroImg = document.querySelector('[data-parallax-hero]');
      if (heroImg) {
        gsap.to(heroImg, {
          y: 200, ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
      }

      const heritageImg = document.querySelector('#heritage .glass-card img');
      if (heritageImg) {
        gsap.to(heritageImg, {
          y: -60, scale: 1.08, ease: 'none',
          scrollTrigger: { trigger: '#heritage', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        });
      }

      gsap.utils.toArray('[data-parallax-orb]').forEach((orb, i) => {
        gsap.to(orb, {
          y: (i % 2 === 0) ? 150 : -100, ease: 'none',
          scrollTrigger: { trigger: orb.closest('section') || orb, start: 'top bottom', end: 'bottom top', scrub: 2 }
        });
      });

      const floatProduct = document.querySelector('.hero-float-product');
      if (floatProduct) {
        gsap.to(floatProduct, {
          y: 120, ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
        });
      }
    }

    // --- Horizontal Scroll Lookbook (Enhancement #4) ---
    const lookbookTrack = document.getElementById('lookbook-track');
    const lookbookSection = document.getElementById('lookbook');
    if (lookbookTrack && lookbookSection && !prefersReducedMotion) {
      const totalScrollWidth = lookbookTrack.scrollWidth - window.innerWidth;
      if (!isMobile) {
        gsap.to(lookbookTrack, {
          x: () => -totalScrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: lookbookSection,
            start: 'top top',
            end: () => '+=' + totalScrollWidth,
            pin: true, scrub: 1,
            invalidateOnRefresh: true, anticipatePin: 1,
          }
        });
      }
      // Ken Burns on lookbook images
      if (!isMobile) {
        gsap.utils.toArray('.lookbook-item img').forEach(img => {
          gsap.fromTo(img, { scale: 1.1 }, {
            scale: 1, ease: 'none',
            scrollTrigger: {
              trigger: img, start: 'top bottom', end: 'bottom top', scrub: 2
            }
          });
        });
      }
    }

    // --- Full-Screen Collection Reveal (Enhancement #7) ---
    const collectionSection = document.getElementById('collections');
    if (collectionSection && !prefersReducedMotion && !isMobile) {
      const slides = collectionSection.querySelectorAll('.collection-slide');
      const dots = collectionSection.querySelectorAll('.collection-progress-dot');
      const counter = collectionSection.querySelector('.collection-counter');
      const total = slides.length;

      if (total > 1) {
        slides.forEach((slide, i) => {
          if (i === 0) gsap.set(slide, { opacity: 1 });
          else {
            gsap.set(slide, { opacity: 0 });
            const img = slide.querySelector('.collection-slide-img');
            if (img) gsap.set(img, { scale: 1.15 });
          }
        });

        const colTL = gsap.timeline({
          scrollTrigger: {
            trigger: collectionSection,
            start: 'top top', end: 'bottom bottom', scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const activeIndex = Math.min(Math.floor(progress * total), total - 1);
              dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
              if (counter) counter.textContent = `0${activeIndex + 1} / 0${total}`;
            }
          }
        });

        for (let i = 0; i < total - 1; i++) {
          const currentSlide = slides[i];
          const nextSlide = slides[i + 1];
          const nextImg = nextSlide.querySelector('.collection-slide-img');
          const nextContent = nextSlide.querySelector('.collection-slide-content');

          colTL
            .to(currentSlide, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.inOut' })
            .to(nextSlide, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, '<')
            .to(nextImg, { scale: 1, duration: 0.8, ease: 'power2.out' }, '<')
            .fromTo(nextContent,
              { opacity: 0, y: 60 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
              '-=0.3'
            )
            .to({}, { duration: 0.3 });
        }
      }
    }

    // --- Section heading char animations (Enhancement #6) ---
    document.querySelectorAll('[data-char-animate]:not(#hero-heading)').forEach(heading => {
      const chars = splitChars(heading);
      gsap.set(chars, { opacity: 0, y: 50, rotateX: 30 });
      gsap.to(chars, {
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
        y: 0, opacity: 1, rotateX: 0, duration: 0.5,
        stagger: 0.02, ease: 'power3.out'
      });
    });

    // --- Navbar scroll ---
    const navInner = document.querySelector('#navbar nav');
    if (navInner) {
      ScrollTrigger.create({
        start: 50, end: 99999,
        onEnter: () => {
          gsap.to(navInner, { background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(30px)', duration: 0.4 });
        },
        onLeaveBack: () => {
          gsap.to(navInner, { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', duration: 0.4 });
        }
      });
    }
  }

  // ============================================================
  // INTERACTIVE EFFECTS
  // ============================================================

  // --- Mobile Menu ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('flex');
      mobileMenu.classList.toggle('flex', !isOpen);
      mobileMenu.classList.toggle('hidden', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('flex');
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- 3D Tilt on Product Cards ---
  if (!prefersReducedMotion && !isMobile) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      const shine = card.querySelector('.tilt-shine');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(card, {
          rotateX, rotateY, translateZ: 15,
          duration: 0.5, ease: 'power2.out', overwrite: 'auto'
        });
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25) 0%, rgba(201,169,110,0.1) 40%, transparent 60%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0, rotateY: 0, translateZ: 0,
          duration: 1, ease: 'elastic.out(1, 0.5)', overwrite: 'auto'
        });
        if (shine) shine.style.background = '';
      });
    });
  }

  // --- 3D Card Flip ---
  document.querySelectorAll('.flip-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const flipInner = btn.closest('.flip-inner');
      if (flipInner) {
        const front = flipInner.querySelector('.flip-front');
        const back = flipInner.querySelector('.flip-back');
        gsap.to(flipInner, { rotateY: 180, duration: 1.2, ease: 'power3.inOut',
          onComplete: () => {
            if (back) back.style.pointerEvents = 'auto';
            if (front) front.style.pointerEvents = 'none';
          }
        });
        if (typeof lucide !== 'undefined') setTimeout(() => lucide.createIcons(), 200);
      }
    });
  });
  document.querySelectorAll('.flip-btn-back').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const flipInner = btn.closest('.flip-inner');
      if (flipInner) {
        const front = flipInner.querySelector('.flip-front');
        const back = flipInner.querySelector('.flip-back');
        gsap.to(flipInner, { rotateY: 0, duration: 1.2, ease: 'power3.inOut',
          onComplete: () => {
            if (back) back.style.pointerEvents = 'none';
            if (front) front.style.pointerEvents = '';
          }
        });
      }
    });
  });

  // --- Magnetic Buttons ---
  if (!prefersReducedMotion && !isMobile) {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ============================================================
  // CUSTOM CURSOR (Enhancement #2)
  // ============================================================
  if (!prefersReducedMotion && !isMobile && window.matchMedia('(hover: hover)').matches) {
    const cursor = document.getElementById('custom-cursor');
    const cursorLabel = document.getElementById('cursor-label');
    if (cursor) {
      let cursorX = 0, cursorY = 0;
      let currentX = 0, currentY = 0;

      document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
      }, { passive: true });

      function updateCursor() {
        currentX += (cursorX - currentX) * 0.15;
        currentY += (cursorY - currentY) * 0.15;
        cursor.style.left = currentX + 'px';
        cursor.style.top = currentY + 'px';
        requestAnimationFrame(updateCursor);
      }
      updateCursor();

      document.documentElement.style.cursor = 'none';
      document.querySelectorAll('a, button, [role="button"], input, .cursor-pointer').forEach(el => {
        el.style.cursor = 'none';
      });

      const interactiveMap = [
        { selector: '.flip-btn, .product-img-wrapper, .product-sheen', label: 'View' },
        { selector: '.collection-3d, .collection-slide-content a, .lookbook-item', label: 'Explore' },
        { selector: '.magnetic-btn, button[type="submit"], .bg-gold', label: 'Shop' },
        { selector: '.flip-btn-back', label: 'Close' },
      ];

      interactiveMap.forEach(({ selector, label }) => {
        document.querySelectorAll(selector).forEach(el => {
          el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            if (cursorLabel) cursorLabel.textContent = label;
          });
          el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover', 'cursor-image');
            if (cursorLabel) cursorLabel.textContent = '';
          });
        });
      });

      document.querySelectorAll('img').forEach(img => {
        img.addEventListener('mouseenter', () => cursor.classList.add('cursor-image'));
        img.addEventListener('mouseleave', () => cursor.classList.remove('cursor-image'));
      });

      document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    }
  }

  // --- Membership Form ---
  const membershipForm = document.getElementById('membership-form');
  if (membershipForm) {
    membershipForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('membership-email').value;
      if (email) {
        membershipForm.innerHTML = `
          <div class="flex flex-col items-center gap-3 py-4 w-full">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 border border-gold/30">
              <i data-lucide="heart" class="h-6 w-6 text-gold"></i>
            </div>
            <p class="font-heading text-lg font-semibold text-text-primary">Welcome to the Club</p>
            <p class="font-body text-sm text-text-secondary">We'll be in touch at <span class="text-gold">${email}</span></p>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }

  // --- Smooth Scroll ---
  const navbar = document.getElementById('navbar');
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });
});
