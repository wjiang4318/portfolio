/* Wilson Jiang — portfolio
   A nav hairline plus section-aware nav dots, the scroll reveals, and
   the travel deck: a pile on the page that opens a gallery window,
   where any one photo enlarges in place, and the case-study windows for
   the two projects that have no public repo. Nothing else. */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. nav hairline + current section ---------- */

  const nav = document.getElementById('nav');
  const onScroll = () => nav.dataset.scrolled = String(window.scrollY > 8);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const links = [...document.querySelectorAll('.nav__links a')];
  const targets = links
    .map(a => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(t => t.el);

  if (targets.length && 'IntersectionObserver' in window) {
    const seen = new Map();
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => seen.set(e.target, e.intersectionRatio));
      let best = null, bestRatio = 0;
      seen.forEach((ratio, el) => { if (ratio > bestRatio) { bestRatio = ratio; best = el; } });
      targets.forEach(t => t.a.toggleAttribute('aria-current', t.el === best && bestRatio > 0));
    }, { threshold: [0, 0.15, 0.4, 0.75], rootMargin: '-68px 0px -40% 0px' });
    targets.forEach(t => spy.observe(t.el));
  }

  /* ---------- 2. scroll reveal ---------- */

  const revealables = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  }


  /* ---------- 3. travel deck + gallery window ---------- */

  const deck = document.querySelector('[data-deck]');
  if (deck) {
    const collage = deck.querySelector('.collage');
    const toggle  = deck.querySelector('[data-deck-toggle]');
    const stamps  = [...collage.querySelectorAll('.stamp')];

    const win    = document.querySelector('[data-gallery]');
    const slot   = win.querySelector('[data-gallery-slot]');
    const viewer = win.querySelector('[data-viewer]');
    const vImg   = viewer.querySelector('img');
    const vCap   = viewer.querySelector('figcaption');

    stamps.forEach((f, i) => f.style.setProperty('--i', i));

    /* while piled, the cards behind the top three are not reachable */
    /* on the page the stamps are not rendered at all — the panel photo
       is the only control — so nothing in the collage is tabbable until
       it is inside the window */
    const setPileTabbing = (inWindow) => {
      stamps.forEach((f) => {
        f.querySelector('.stamp__photo').tabIndex = inWindow ? 0 : -1;
      });
    };

    const showGrid = () => {
      viewer.hidden = true;
      slot.hidden = false;
      vImg.removeAttribute('src');
    };

    /* The collage is MOVED into the window rather than duplicated, so
       there is only ever one copy of these images in the document. */
    const openWindow = () => {
      slot.append(collage);
      collage.dataset.open = 'true';
      toggle.setAttribute('aria-expanded', 'true');
      setPileTabbing(true);
      showGrid();
      win.showModal();
    };

    const closeWindow = () => {
      win.close();
      showGrid();
      collage.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      deck.insertBefore(collage, toggle);
      setPileTabbing(false);
      toggle.focus();
    };

    setPileTabbing(false);
    toggle.addEventListener('click', openWindow);

    collage.addEventListener('click', (e) => {
      const btn = e.target.closest('.stamp__photo');
      if (!btn) return;
      /* on the page the pile is a single target: it opens the window */
      if (collage.dataset.open !== 'true') { openWindow(); return; }
      /* inside the window a card enlarges in place */
      vImg.src = btn.dataset.full;
      vImg.alt = btn.dataset.caption || '';
      vCap.textContent = btn.dataset.caption || '';
      slot.hidden = true;
      viewer.hidden = false;
      viewer.querySelector('[data-viewer-back]').focus();
    });

    viewer.querySelector('[data-viewer-back]').addEventListener('click', showGrid);
    win.querySelector('[data-gallery-close]').addEventListener('click', closeWindow);
    /* Escape backs out one level at a time, then closes */
    win.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (!viewer.hidden) { showGrid(); return; }
      closeWindow();
    });
  }

  /* ---------- 4. case-study windows ---------- */

  /* Two projects have no public repo, so their write-ups open in the same
     window component the gallery uses. The copy lives in <template>s in
     the HTML rather than in strings here, so it stays editable as markup. */
  const caseWin = document.querySelector('[data-case-window]');
  if (caseWin) {
    const slot = caseWin.querySelector('[data-case-slot]');
    let lastTrigger = null;

    const closeCase = () => {
      caseWin.close();
      slot.replaceChildren();
      if (lastTrigger) lastTrigger.focus();
    };

    document.querySelectorAll('[data-case-open]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const tpl = document.querySelector(`template[data-case="${link.dataset.caseOpen}"]`);
        if (!tpl) return;               /* no template: let the href do its job */
        e.preventDefault();
        lastTrigger = link;
        slot.replaceChildren(tpl.content.cloneNode(true));
        /* the bar names the project — the masthead already says it is a
           case study, so repeating that label was pure duplication */
        caseWin.querySelector('[data-case-eyebrow]').textContent = tpl.dataset.title || '';
        slot.scrollTop = 0;
        caseWin.showModal();
      });
    });

    caseWin.querySelector('[data-case-close]').addEventListener('click', closeCase);
    caseWin.addEventListener('click', (e) => { if (e.target === caseWin) closeCase(); });
    caseWin.addEventListener('cancel', (e) => { e.preventDefault(); closeCase(); });
  }
})();
