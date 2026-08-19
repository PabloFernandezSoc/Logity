/* =========================================================
   Logity — interacciones de la landing
   ========================================================= */
(function () {
  'use strict';

  /* Endpoint del formulario de demo.
     Deja el valor vacío para usar el fallback por correo (mailto),
     o pega aquí la URL de tu CRM / Formspree / webhook.        */
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'contacto@logity.com';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- año del footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- nav: estado al hacer scroll ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- nav: menú móvil ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
    links.classList.toggle('is-open', !open);
  });

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  /* ---------- reveal al hacer scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(el.parentElement.children);
        var i = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- video del hero ---------- */
  var video = document.getElementById('heroVideo');
  if (video) {
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      // Algunos navegadores bloquean el autoplay hasta que hay interacción.
      var tryPlay = function () {
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () { /* queda el poster */ });
      };
      tryPlay();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) video.pause(); else tryPlay();
      });
    }
  }

  /* ---------- formulario de demo ---------- */
  var form = document.getElementById('demoForm');
  var status = document.getElementById('formStatus');

  var setStatus = function (msg, type) {
    status.textContent = msg;
    status.className = 'form__status' + (type ? ' is-' + type : '');
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var required = form.querySelectorAll('[required]');
    var firstInvalid = null;

    required.forEach(function (field) {
      var ok = field.value.trim() !== '' &&
               (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim()));
      field.classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      setStatus('Revisa los campos marcados para poder enviar tu solicitud.', 'err');
      firstInvalid.focus();
      return;
    }

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus('Enviando…');

    var done = function () {
      form.reset();
      button.disabled = false;
      setStatus('¡Gracias! Recibimos tu solicitud y te contactamos dentro de las próximas 24 horas hábiles.', 'ok');
    };

    var fallbackMail = function () {
      var body = [
        'Nombre: ' + (data.nombre || ''),
        'Empresa: ' + (data.empresa || ''),
        'Email: ' + (data.email || ''),
        'Teléfono: ' + (data.telefono || '—'),
        'Interés: ' + (data.interes || ''),
        '',
        (data.mensaje || '')
      ].join('\n');

      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent('Solicitud de demo — ' + (data.empresa || data.nombre || '')) +
        '&body=' + encodeURIComponent(body);
      done();
    };

    if (!FORM_ENDPOINT) {
      fallbackMail();
      return;
    }

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('bad response');
        done();
      })
      .catch(function () {
        button.disabled = false;
        setStatus('No pudimos enviar el formulario. Escríbenos a ' + CONTACT_EMAIL + ' y te respondemos igual.', 'err');
      });
  });

  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid')) e.target.classList.remove('is-invalid');
  });
})();
