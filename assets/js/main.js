(function () {
  'use strict';

  /* --------------------------------------------------
   * Utility & cached selectors
   * -------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const on = (el, ev, cb, opts = false) => el && el.addEventListener(ev, cb, opts);

  /* --------------------------------------------------
   * DOM ready
   * -------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    /* --------------------------------------------------
     * Header - mobile toggle
     * -------------------------------------------------- */
    const header      = $('#header');
    const headerTgl   = $('.header-toggle');
    const toggleMenu  = () => {
      header.classList.toggle('header-show');
      headerTgl.classList.toggle('bi-list');
      headerTgl.classList.toggle('bi-x');
    };
    on(headerTgl, 'click', toggleMenu);

    // hide mobile nav after clicking an in-page link
    $$('#navmenu a').forEach((link) =>
      on(link, 'click', () => header.classList.contains('header-show') && toggleMenu())
    );

    // open/close mobile dropdowns
    $$('.navmenu .toggle-dropdown').forEach((btn) =>
      on(btn, 'click', (e) => {
        e.preventDefault();
        btn.parentNode.classList.toggle('active');
        btn.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      })
    );

    /* --------------------------------------------------
     * Preloader
     * -------------------------------------------------- */
    const preloader = $('#preloader');
    window.addEventListener('load', () => preloader?.remove());

    /* --------------------------------------------------
     * Scroll-top button
     * -------------------------------------------------- */
    const scrollTopBtn = $('.scroll-top');
    const toggleScrollBtn = () =>
      scrollTopBtn && (window.scrollY > 100 ? scrollTopBtn.classList.add('active') : scrollTopBtn.classList.remove('active'));

    on(scrollTopBtn, 'click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', toggleScrollBtn);
    toggleScrollBtn();

    /* --------------------------------------------------
     * AOS (animate-on-scroll)
     * -------------------------------------------------- */
    window.addEventListener('load', () => AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false }));

    /* --------------------------------------------------
     * Typed.js – hero subtitle
     * -------------------------------------------------- */
    const typedEl = $('.typed');
    if (typedEl) {
      new Typed('.typed', {
        strings: typedEl.getAttribute('data-typed-items').split(','),
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
      });
    }

    /* --------------------------------------------------
     * Wedding countdown
     * -------------------------------------------------- */
    const countdownEl = $('#countdown');
    if (countdownEl) {
      const weddingDate = new Date('2025-11-15T18:30:00');
      const tick = () => {
        const diff = weddingDate - new Date();
        if (diff <= 0) return (countdownEl.textContent = 'The big day is here!');
        const d = Math.floor(diff / 864e5);
        const h = Math.floor((diff / 36e5) % 24);
        const m = Math.floor((diff / 6e4) % 60);
        const s = Math.floor((diff / 1000) % 60);
        countdownEl.textContent = `${d}d ${h}h ${m}m ${s}s`;
      };
      tick();
      setInterval(tick, 1000);
    }

    /* --------------------------------------------------
     * PureCounter (stats)
     * -------------------------------------------------- */
    new PureCounter();

    /* --------------------------------------------------
     * Skills bar animation with Waypoints
     * -------------------------------------------------- */
    $$('.skills-animation').forEach((box) => {
      new Waypoint({
        element: box,
        offset: '80%',
        handler() {
          box.querySelectorAll('.progress-bar').forEach((bar) => (bar.style.width = bar.getAttribute('aria-valuenow') + '%'));
        },
      });
    });

    /* --------------------------------------------------
     * GLightbox & Isotope
     * -------------------------------------------------- */
    const glightbox = GLightbox({ selector: '.glightbox' });

    $$('.isotope-layout').forEach((iso) => {
      const container = iso.querySelector('.isotope-container');
      const layout = iso.dataset.layout || 'masonry';
      const filterDefault = iso.dataset.defaultFilter || '*';
      const sort = iso.dataset.sort || 'original-order';

      imagesLoaded(container, () => {
        const isoObj = new Isotope(container, { itemSelector: '.isotope-item', layoutMode: layout, filter: filterDefault, sortBy: sort });
        iso.querySelectorAll('.isotope-filters li').forEach((btn) =>
          on(btn, 'click', () => {
            iso.querySelector('.filter-active').classList.remove('filter-active');
            btn.classList.add('filter-active');
            isoObj.arrange({ filter: btn.dataset.filter });
          })
        );
      });
    });

    /* --------------------------------------------------
     * Swiper – generic sliders (template) + Story carousel
     * -------------------------------------------------- */
    if (typeof initSwiper === 'function') window.addEventListener('load', initSwiper);

    new Swiper('.story-swiper', {
      loop: true,
      effect: 'fade',
      autoplay: { delay: 4500, disableOnInteraction: false },
      navigation: { nextEl: '.story-swiper .swiper-button-next', prevEl: '.story-swiper .swiper-button-prev' },
      pagination: { el: '.story-swiper .swiper-pagination', clickable: true },
    });

    /* --------------------------------------------------
     * Scroll-spy for nav links
     * -------------------------------------------------- */
    const spy = () => {
      $$('#navmenu a').forEach((link) => {
        if (!link.hash) return;
        const section = $(link.hash);
        if (!section) return;
        const pos = window.scrollY + 200;
        (pos >= section.offsetTop && pos <= section.offsetTop + section.offsetHeight)
          ? link.classList.add('active')
          : link.classList.remove('active');
      });
    };
    window.addEventListener('scroll', spy);
    spy();

    /* --------------------------------------------------
     * Story toggle (image expands to reveal text)
     * -------------------------------------------------- */
    const storyBtn = $('#storyToggleBtn');
    const photoBox = $('#photoContainer');
    const loveStory = $('#loveStory');
    on(storyBtn, 'click', () => {
      photoBox?.classList.toggle('collapsed');
      loveStory?.classList.toggle('show');
      storyBtn.textContent = loveStory.classList.contains('show') ? 'Hide our story' : 'Read our story';
    });

    /* --------------------------------------------------
 * RSVP – pre-fill, submit, remember, re-open
 * -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* 1 — Grab elements */
  const $                = (sel) => document.querySelector(sel);
  const on               = (el, ev, fn) => el.addEventListener(ev, fn);

  const rsvpForm         = $('#rsvpForm');
  const resubmitBtn      = $('#resubmitBtn');
  const confirmationMsg  = $('#confirmationMessage');
  const rsvpInstructions = $('#rsvpInstructions');

  /* 2 — Build a unique localStorage key */
  const urlParams  = new URLSearchParams(window.location.search);
  const guestSlug  = urlParams.get('guest') || 'generic';
  const storageKey = `rsvpSubmitted_${guestSlug}`;

  /* 3 — If already submitted, hide form straight away  */
  if (localStorage.getItem(storageKey) === 'true') {
    rsvpForm.style.display        = 'none';
    rsvpInstructions.style.display = 'none';
    confirmationMsg.style.display = 'block';
    resubmitBtn.style.display     = 'inline-block';
  }

  /* 4 — Handle normal submission */
  on(rsvpForm, 'submit', (e) => {
    e.preventDefault();

    /* --- build params exactly as you already do --- */
    const params = new URLSearchParams({
      "entry.123456789": $('#guestName').value,
      "entry.987654321": $('#attendance').value,
      "entry.111213141": $('#plusOne').value,
      "entry.215151617": $('#message').value
    });
      fetch('https://docs.google.com/forms/d/e/1FAIpQLSfQ6cOOonEob2AChNMvyI4LL_DBwCffaVmJEtIm3nOqf3g4FA/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        body: params,
      })
        .then(() => {
      /* 4a — remember submission */
      localStorage.setItem(storageKey, 'true');

      /* 4b — update UI */
      rsvpForm.style.display        = 'none';
      rsvpInstructions.style.display = 'none';
      confirmationMsg.style.display = 'block';
      resubmitBtn.style.display     = 'inline-block';
      rsvpForm.reset();
    })
    .catch(() => alert('Something went wrong. Please try again.'));
  });

  /* 5 — Allow a resubmit (clears the flag) */
  on(resubmitBtn, 'click', () => {
    localStorage.removeItem(storageKey);          // forget previous submit
    rsvpForm.style.display        = 'block';
    rsvpInstructions.style.display = '';
    confirmationMsg.style.display = 'none';
    resubmitBtn.style.display     = 'none';
  });

});


    /* --------------------------------------------------
     * Background music player
     * -------------------------------------------------- */
    const audio = $('#background-music');
    const musicBtn = $('#music-toggle');
    const playIco = $('#play-icon');
    const pauseIco = $('#pause-icon');

    if (audio && musicBtn) {
      const playlist = [
        'https://bachlong-trading.com/wp-content/uploads/2024/07/oke-Cody-Francis-Honey-Take-My-Hand-online-audio-converter.com_.mp3',
        'https://bachlong-trading.com/wp-content/uploads/2024/05/EM-DONG-Y-I-DO-DUC-PHUC-x-911-x-KHAC-HUNG-1ST-LIVE-STAGE.mp3',
        'https://bachlong-trading.com/wp-content/uploads/2024/06/Bruno-Mars-Marry-You-Official-Lyric-Video-mp3cut.net_.mp3',
      ];
      let current = 0, playing = false;

      const load = (i) => {
        audio.src = playlist[i];
        audio.load();
      };
      const play = () => audio.play().then(() => {
        playing = true;
        playIco.style.display = 'none';
        pauseIco.style.display = 'block';
        musicBtn.classList.add('vibrating');
      }).catch(console.error);
      const pause = () => {
        audio.pause();
        playing = false;
        playIco.style.display = 'block';
        pauseIco.style.display = 'none';
        musicBtn.classList.remove('vibrating');
      };

      load(current);
      document.body.addEventListener('click', function init() { play(); this.removeEventListener('click', init); }, { once: true });
      on(musicBtn, 'click', (e) => { e.stopPropagation(); playing ? pause() : play(); });
      on(audio, 'ended', () => { current = (current + 1) % playlist.length; load(current); play(); });
    }

    /* --------------------------------------------------
     * Copy address helper (exposed globally for inline onClick)
     * -------------------------------------------------- */
    window.copyAddress = () => {
      navigator.clipboard.writeText($('#addressText').innerText)
        .then(() => alert('Address copied to clipboard!'))
        .catch(() => alert('Failed to copy address.'));
    };
  });
})();