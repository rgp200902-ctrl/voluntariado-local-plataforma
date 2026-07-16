/* ==========================================================================
   MAIN JAVASCRIPT ENTRY POINT
   Handles: theme toggle, toast notifications, sidebar, dropdown, password strength, etc.
   ========================================================================== */

(function () {
  'use strict';

  // ========================================================================
  // THEME — dark/light mode
  // ========================================================================
  function getTheme() {
    return localStorage.getItem('theme') || 'light';
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }

  // Init theme
  setTheme(getTheme());

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle-theme]');
    if (!toggle) return;
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updateThemeIcon(toggle, next);
  });

  function updateThemeIcon(el, theme) {
    var icon = el.querySelector('.icon, i');
    if (!icon) return;
    var isDark = theme === 'dark';
    icon.className = icon.className.replace(/bi-(sun|moon)-?(fill)?/g, '');
    if (isDark) {
      icon.classList.add('bi', 'bi-sun-fill');
    } else {
      icon.classList.add('bi', 'bi-moon-fill');
    }
    el.setAttribute('title', isDark ? 'Modo Claro' : 'Modo Escuro');
    el.setAttribute('aria-label', isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro');
  }

  // Update all theme icons on load
  document.querySelectorAll('[data-toggle-theme]').forEach(function (el) {
    updateThemeIcon(el, getTheme());
  });

  // ========================================================================
  // TOAST SYSTEM — replaces Django messages
  // ========================================================================
  window.toast = {
    _container: null,
    _counter: 0,

    _ensureContainer: function () {
      if (this._container) return this._container;
      this._container = document.createElement('div');
      this._container.className = 'toast-container toast-container--top-right';
      this._container.setAttribute('aria-live', 'polite');
      this._container.setAttribute('aria-relevant', 'additions');
      document.body.appendChild(this._container);
      return this._container;
    },

    show: function (message, opts) {
      opts = opts || {};
      var type = opts.type || 'info';
      var duration = opts.duration || 5000;
      var title = opts.title || '';
      var id = 'toast-' + (++this._counter);

      var el = document.createElement('div');
      el.className = 'toast toast--' + type;
      el.id = id;
      el.style.setProperty('--toast-duration', duration + 'ms');
      el.setAttribute('role', 'alert');

      el.innerHTML =
        '<div class="toast__icon">' + getToastIcon(type) + '</div>' +
        '<div class="toast__content">' +
          (title ? '<div class="toast__title">' + escapeHtml(title) + '</div>' : '') +
          '<div class="toast__message">' + escapeHtml(message) + '</div>' +
        '</div>' +
        '<button class="toast__close" onclick="this.closest(\'.toast\').remove()" aria-label="Fechar">' +
          '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>' +
        '</button>';

      this._ensureContainer().appendChild(el);

      // Auto dismiss
      if (duration > 0) {
        setTimeout(function () {
          var t = document.getElementById(id);
          if (t) {
            t.classList.add('toast--closing');
            setTimeout(function () { t.remove(); }, 300);
          }
        }, duration);
      }

      return id;
    },

    success: function (msg, opts) { opts = opts || {}; opts.type = 'success'; return this.show(msg, opts); },
    error: function (msg, opts) { opts = opts || {}; opts.type = 'error'; return this.show(msg, opts); },
    warning: function (msg, opts) { opts = opts || {}; opts.type = 'warning'; return this.show(msg, opts); },
    info: function (msg, opts) { opts = opts || {}; opts.type = 'info'; return this.show(msg, opts); }
  };

  function getToastIcon(type) {
    var icons = {
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.874c.673 1.167-.17 2.631-1.516 2.631H3.72c-1.347 0-2.189-1.464-1.516-2.631L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/></svg>'
    };
    return icons[type] || icons.info;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // Convert Django messages to toast
  document.addEventListener('DOMContentLoaded', function () {
    var msgEls = document.querySelectorAll('[data-django-message]');
    msgEls.forEach(function (el) {
      var type = el.getAttribute('data-django-message') || 'info';
      var text = el.textContent.trim();
      if (text) { window.toast[type] ? window.toast[type](text) : window.toast.show(text, { type: type }); }
      el.remove();
    });
  });

  // ========================================================================
  // MOBILE SIDEBAR TOGGLE
  // ========================================================================
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle-sidebar]');
    if (!btn) return;
    var sidebar = document.getElementById(btn.getAttribute('data-toggle-sidebar'));
    var overlay = document.getElementById(btn.getAttribute('data-sidebar-overlay'));
    if (sidebar) {
      sidebar.classList.toggle('dashboard__sidebar--open');
      if (overlay) overlay.classList.toggle('dashboard__sidebar-overlay--visible');
    }
  });

  // Close sidebar on overlay click
  document.addEventListener('click', function (e) {
    var overlay = e.target.closest('.dashboard__sidebar-overlay');
    if (!overlay) return;
    var sidebar = document.querySelector('.dashboard__sidebar');
    if (sidebar) {
      sidebar.classList.remove('dashboard__sidebar--open');
      overlay.classList.remove('dashboard__sidebar-overlay--visible');
    }
  });

  // ========================================================================
  // DROPDOWN TOGGLE
  // ========================================================================
  document.addEventListener('click', function (e) {
    var dropdown = e.target.closest('.dropdown');
    if (!dropdown) return;
    var wasOpen = dropdown.classList.contains('dropdown--open');
    // Close all dropdowns
    document.querySelectorAll('.dropdown--open').forEach(function (d) {
      d.classList.remove('dropdown--open');
    });
    if (!wasOpen) dropdown.classList.add('dropdown--open');
    e.stopPropagation();
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown--open').forEach(function (d) {
      d.classList.remove('dropdown--open');
    });
  });

  // ========================================================================
  // PASSWORD STRENGTH METER
  // ========================================================================
  document.addEventListener('input', function (e) {
    var input = e.target.closest('[data-password-strength]');
    if (!input) return;
    var meter = document.getElementById(input.getAttribute('data-password-strength'));
    if (!meter) return;
    var val = input.value;
    var strength = 0;
    if (val.length >= 8) strength += 25;
    if (val.length >= 12) strength += 15;
    if (/[A-Z]/.test(val)) strength += 20;
    if (/[a-z]/.test(val)) strength += 15;
    if (/[0-9]/.test(val)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(val)) strength += 10;

    var fill = meter.querySelector('.password-strength__fill');
    var label = meter.querySelector('.password-strength__label');
    if (!fill) return;

    fill.style.width = Math.min(strength, 100) + '%';
    fill.className = 'password-strength__fill';
    if (strength < 30) { fill.classList.add('password-strength__fill--weak'); if (label) label.textContent = 'Fraca'; }
    else if (strength < 50) { fill.classList.add('password-strength__fill--fair'); if (label) label.textContent = 'Média'; }
    else if (strength < 75) { fill.classList.add('password-strength__fill--good'); if (label) label.textContent = 'Boa'; }
    else { fill.classList.add('password-strength__fill--strong'); if (label) label.textContent = 'Forte'; }
  });

  // ========================================================================
  // MODAL / DIALOG
  // ========================================================================
  window.modal = {
    open: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.focus();
      el.classList.add('modal-overlay--open');
      document.body.style.overflow = 'hidden';
    },
    close: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('modal-overlay--open');
      document.body.style.overflow = '';
    }
  };

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-modal-open]');
    if (btn) { window.modal.open(btn.getAttribute('data-modal-open')); return; }
    var btnClose = e.target.closest('[data-modal-close]');
    if (btnClose) { window.modal.close(btnClose.getAttribute('data-modal-close') || btnClose.closest('.modal-overlay').id); return; }
    var overlay = e.target.closest('.modal-overlay');
    if (overlay && e.target === overlay) { window.modal.close(overlay.id); }
  });

  // Close modal on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay--open').forEach(function (el) {
        el.classList.remove('modal-overlay--open');
        document.body.style.overflow = '';
      });
    }
  });

  // ========================================================================
  // CONFIRM DIALOG (replaces confirm())
  // ========================================================================
  window.confirmDialog = function (message, opts) {
    return new Promise(function (resolve) {
      opts = opts || {};
      var id = 'confirm-' + Date.now();
      var modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = id;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML =
        '<div class="modal modal--sm confirm-dialog">' +
          '<div class="modal__header">' +
            '<h3 class="modal__title">' + escapeHtml(opts.title || 'Confirmar') + '</h3>' +
          '</div>' +
          '<div class="modal__body">' +
            '<div class="confirm-dialog__icon confirm-dialog__icon--' + (opts.icon || 'warning') + '">' +
              '<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.874c.673 1.167-.17 2.631-1.516 2.631H3.72c-1.347 0-2.189-1.464-1.516-2.631L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>' +
            '</div>' +
            '<p class="confirm-dialog__message">' + escapeHtml(message) + '</p>' +
          '</div>' +
          '<div class="modal__footer confirm-dialog__actions">' +
            '<button class="btn btn--secondary" data-modal-close="' + id + '">' + escapeHtml(opts.cancelText || 'Cancelar') + '</button>' +
            '<button class="btn btn--' + (opts.confirmVariant || 'danger') + '" id="' + id + '-confirm">' + escapeHtml(opts.confirmText || 'Confirmar') + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
      // Trigger enter animation
      requestAnimationFrame(function () {
        modal.classList.add('modal-overlay--open');
      });
      document.getElementById(id + '-confirm').addEventListener('click', function () {
        modal.remove();
        document.body.style.overflow = '';
        resolve(true);
      });
      // Close handlers
      modal.addEventListener('click', function (e) {
        if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; resolve(false); }
      });
      var closeBtns = modal.querySelectorAll('[data-modal-close]');
      closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () { modal.remove(); document.body.style.overflow = ''; resolve(false); });
      });
    });
  };

  // Intercept confirm() in forms
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-confirm]');
    if (!btn) return;
    e.preventDefault();
    var msg = btn.getAttribute('data-confirm');
    var form = btn.closest('form') || btn.closest('[data-confirm-form]');
    window.confirmDialog(msg, {
      title: btn.getAttribute('data-confirm-title') || 'Confirmar',
      confirmText: btn.getAttribute('data-confirm-accept') || 'Sim',
      cancelText: btn.getAttribute('data-confirm-cancel') || 'Cancelar',
      confirmVariant: btn.getAttribute('data-confirm-variant') || 'danger'
    }).then(function (confirmed) {
      if (confirmed && form && form.tagName === 'FORM') {
        form.submit();
      } else if (confirmed) {
        window.location.href = btn.getAttribute('href') || btn.getAttribute('data-confirm-href');
      }
    });
  });

  // ========================================================================
  // COPY TO CLIPBOARD
  // ========================================================================
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    if (!text) text = btn.getAttribute('data-copy-value') || btn.textContent;
    navigator.clipboard.writeText(text).then(function () {
      var original = btn.innerHTML;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Copiado!';
      setTimeout(function () { btn.innerHTML = original; }, 2000);
    }).catch(function () {
      window.toast.error('Não foi possível copiar');
    });
  });

  // ========================================================================
  // FILE UPLOAD PREVIEW
  // ========================================================================
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input.matches('.file-upload__input')) return;
    var preview = input.closest('.file-upload').querySelector('.file-upload__preview');
    if (!preview) return;
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      preview.innerHTML = '<img src="' + ev.target.result + '" alt="Pré-visualização">';
    };
    reader.readAsDataURL(file);
  });

  // ========================================================================
  // INIT (on DOMContentLoaded)
  // ========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    // Password strength init
    document.querySelectorAll('[data-password-strength]').forEach(function (input) {
      var event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    });

    // File upload preview init
    document.querySelectorAll('.file-upload[data-preview]').forEach(function (el) {
      var input = el.querySelector('.file-upload__input');
      var preview = el.querySelector('.file-upload__preview');
      if (input && preview && input.dataset.previewSrc) {
        preview.innerHTML = '<img src="' + input.dataset.previewSrc + '" alt="Pré-visualização">';
      }
    });
  });
})();