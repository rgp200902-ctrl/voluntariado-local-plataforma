/* ==========================================================================
   UTILS — TOAST NOTIFICATIONS
   Non-blocking, accessible, stackable notifications
   ========================================================================== */

import { Announcer } from './announcer.js';

export const Toast = {
  container: null,
  toasts: new Map(),
  defaultDuration: 5000,
  maxToasts: 5,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container toast-container--bottom-right';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notificações');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  },

  show(message, options = {}) {
    const {
      type = 'info',
      title,
      duration = this.defaultDuration,
      persistent = false,
      action,
      onClose,
    } = options;

    // Limit number of toasts
    if (this.toasts.size >= this.maxToasts) {
      const oldestKey = this.toasts.keys().next().value;
      this.remove(oldestKey);
    }

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast = this.createToast(id, message, { type, title, action });

    this.toasts.set(id, { element: toast, timeout: null, onClose });
    this.container.appendChild(toast);

    // Force reflow for animation
    toast.offsetHeight;

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Auto-dismiss
    if (!persistent && duration > 0) {
      const timeout = setTimeout(() => this.remove(id), duration);
      this.toasts.get(id).timeout = timeout;

      // Progress bar animation
      const progress = toast.querySelector('.toast__progress');
      if (progress) {
        progress.style.animationDuration = `${duration}ms`;
      }
    }

    // Announce for screen readers
    Announcer.announce(`${title || type}: ${message}`, 'polite');

    return id;
  },

  createToast(id, message, { type, title, action }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.dataset.toastId = id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icon = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true">${icon}</div>
      <div class="toast__content">
        ${title ? `<div class="toast__title">${this.escapeHtml(title)}</div>` : ''}
        <div class="toast__message">${this.escapeHtml(message)}</div>
        ${action ? `
          <div class="toast__actions">
            <button type="button" class="toast__action" data-toast-action="${this.escapeHtml(action.label)}">${this.escapeHtml(action.label)}</button>
          </div>
        ` : ''}
      </div>
      <button type="button" class="toast__close" aria-label="Fechar notificação">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
      </button>
      <div class="toast__progress" style="animation-duration: ${this.defaultDuration}ms"></div>
    `;

    // Close button
    toast.querySelector('.toast__close').addEventListener('click', () => this.remove(id));

    // Action button
    if (action) {
      toast.querySelector('[data-toast-action]').addEventListener('click', () => {
        action.onClick?.();
        if (!action.persist) this.remove(id);
      });
    }

    // Pause on hover
    toast.addEventListener('mouseenter', () => this.pause(id));
    toast.addEventListener('mouseleave', () => this.resume(id));

    return toast;
  },

  getIcon(type) {
    const icons = {
      success: '<svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      error: '<svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
      warning: '<svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      info: '<svg class="icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
    };
    return icons[type] || icons.info;
  },

  remove(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const { element, timeout, onClose } = toastData;

    if (timeout) clearTimeout(timeout);

    element.classList.add('toast--closing');
    element.addEventListener('animationend', () => {
      element.remove();
      this.toasts.delete(id);
      onClose?.();
    }, { once: true });
  },

  pause(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const { element, timeout } = toastData;
    if (timeout) {
      clearTimeout(timeout);
      toastData.timeout = null;
      toastData.pausedAt = Date.now();
    }
    const progress = element.querySelector('.toast__progress');
    if (progress) progress.style.animationPlayState = 'paused';
  },

  resume(id) {
    const toastData = this.toasts.get(id);
    if (!toastData || !toastData.pausedAt) return;

    const { element, pausedAt } = toastData;
    const elapsed = Date.now() - pausedAt;
    const remaining = this.defaultDuration - elapsed;

    if (remaining > 0) {
      const timeout = setTimeout(() => this.remove(id), remaining);
      toastData.timeout = timeout;
      toastData.pausedAt = null;
    }

    const progress = element.querySelector('.toast__progress');
    if (progress) progress.style.animationPlayState = 'running';
  },

  // Convenience methods
  success(message, options) { return this.show(message, { ...options, type: 'success' }); },
  error(message, options) { return this.show(message, { ...options, type: 'error' }); },
  warning(message, options) { return this.show(message, { ...options, type: 'warning' }); },
  info(message, options) { return this.show(message, { ...options, type: 'info' }); },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
};