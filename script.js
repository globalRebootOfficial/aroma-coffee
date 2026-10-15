/* =========================================================
   Aroma Coffee — интерактив
   ========================================================= */
(function () {
  'use strict';

  const doc = document;

  /* ---------- 1. Год в подвале ---------- */
  const yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Мобильное меню ---------- */
  const toggle = doc.querySelector('.nav-toggle');
  const nav = doc.getElementById('primary-nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    // Закрытие по клику на ссылку
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) setOpen(false);
    });

    // Закрытие по Esc
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Закрытие при ресайзе до десктопа
    const mq = window.matchMedia('(min-width: 821px)');
    const handleMq = (e) => { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', handleMq);
    else mq.addListener(handleMq);
  }

  /* ---------- 3. Плавная прокрутка (fallback) ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('scrollBehavior' in doc.documentElement.style) || prefersReduced) {
    doc.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = doc.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const header = doc.querySelector('.site-header');
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- 4. Активная ссылка при скролле ---------- */
  const sections = Array.from(doc.querySelectorAll('main section[id]'));
  const navLinks = Array.from(doc.querySelectorAll('.primary-nav a[href^="#"]'))
    .filter((a) => a.getAttribute('href') !== '#top' && !a.classList.contains('btn'));

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const linkMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      linkMap.set(id, link);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          const active = linkMap.get(entry.target.id);
          if (active) active.classList.add('active');
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- 5. Интерактивная кнопка связи ---------- */
  const contactBtn = doc.getElementById('contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      contactBtn.setAttribute('aria-busy', 'true');
      const original = contactBtn.textContent;
      contactBtn.textContent = 'Открываем почтовый клиент…';
      window.setTimeout(() => {
        contactBtn.textContent = original;
        contactBtn.removeAttribute('aria-busy');
      }, 1200);
    });
  }

  /* ---------- 6. Появление карточек меню при скролле ---------- */
  const animated = doc.querySelectorAll('.menu-card, .feature');
  if ('IntersectionObserver' in window && !prefersReduced && animated.length) {
    animated.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    });

    const appearObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          appearObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animated.forEach((el) => appearObserver.observe(el));
  }

    /* ---------- 7. Переключатель светлой/тёмной темы ---------- */
  const themeToggle = doc.getElementById('theme-toggle');
  const root = doc.documentElement;
  const THEME_KEY = 'aroma-theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute(
        'aria-label',
        isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'
      );
    }
  }

  // Синхронизируем атрибуты кнопки с уже применённой темой (из inline-скрипта)
  const initialTheme = root.getAttribute('data-theme') || 'light';
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  }

  // Реакция на смену системной темы — только если пользователь не выбрал вручную
  const handleSystemChange = (e) => {
    if (getStoredTheme()) return; // у пользователя свой выбор — не трогаем
    applyTheme(e.matches ? 'dark' : 'light');
  };
  if (systemDark.addEventListener) systemDark.addEventListener('change', handleSystemChange);
  else if (systemDark.addListener) systemDark.addListener(handleSystemChange);

  /* ---------- 8. Фильтрация меню по категориям ---------- */
  const filterButtons = doc.querySelectorAll('.filter-btn');
  const menuCards = doc.querySelectorAll('.menu-card');
  const menuStatus = doc.getElementById('menu-status');

  if (filterButtons.length && menuCards.length) {

    const categoryLabels = {
      all: 'напитков',
      coffee: 'кофейных напитков',
      tea: 'чая',
      cold: 'холодных напитка'
    };

    function applyFilter(category) {
      let visibleCount = 0;

      menuCards.forEach((card) => {
        const show = category === 'all' || card.dataset.category === category;
        card.hidden = !show;
        if (show) visibleCount += 1;
      });

      // Обновляем состояние кнопок
      filterButtons.forEach((btn) => {
        const isActive = btn.dataset.filter === category;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      // Объявляем результат скринридеру
      if (menuStatus) {
        const label = categoryLabels[category] || 'напитков';
        menuStatus.textContent = 'Показано ' + visibleCount + ' ' + label + '.';
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyFilter(button.dataset.filter);
      });
    });
  }

})();