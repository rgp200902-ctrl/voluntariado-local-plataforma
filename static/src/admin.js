/* ==========================================================================
   ADMIN — Charts and admin-specific functionality
   ========================================================================== */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

window.initChart = function (canvasId, type, data, opts) {
  opts = opts || {};
  var canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  return new Chart(canvas, {
    type: type || 'doughnut',
    data: data,
    options: Object.assign({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { family: getComputedStyle(document.documentElement).getPropertyValue('--font-sans'), size: 12 } } }
      },
      animation: { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400 }
    }, opts)
  });
};

// Apply CSRF token to all fetch requests
document.addEventListener('DOMContentLoaded', function () {
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    window.CSRF_TOKEN = csrfMeta.getAttribute('content');
  }
});

// Make toggleReaction globally available (used in detail.html)
window.toggleReaction = function (tipo, modelName, objectId, btn) {
  var formData = new FormData();
  formData.append('tipo', tipo);
  formData.append('model', modelName);
  formData.append('object_id', objectId);
  fetch('/toggle-reaction/', {
    method: 'POST',
    body: formData,
    headers: {
      'X-CSRFToken': window.CSRF_TOKEN || document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    var countEl = btn.querySelector('.reaction-count');
    if (countEl) countEl.textContent = data.total;
    if (data.action === 'added') {
      btn.classList.remove('btn--outline', 'btn--warning');
      btn.classList.add('btn--warning');
    } else {
      btn.classList.remove('btn--warning');
      btn.classList.add('btn--outline', 'btn--warning');
    }
  })
  .catch(function () {
    window.toast && window.toast.error('Erro ao reagir');
  });
};

// Save for offline (used in detail.html)
window.saveForOffline = function () {
  var btn = document.getElementById('saveBtn');
  var msgEl = document.getElementById('savedMsg');
  if (!btn) return;

  var opp = {
    id: btn.getAttribute('data-opp-id') || '0',
    titulo: btn.getAttribute('data-opp-title') || '',
    descricao: btn.getAttribute('data-opp-desc') || '',
    local: btn.getAttribute('data-opp-local') || 'Portugal',
    instituicao: btn.getAttribute('data-opp-inst') || ''
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SAVE_OPPORTUNITY', opportunity: opp });
  } else {
    try {
      localStorage.setItem('opp_' + opp.id, JSON.stringify(opp));
    } catch (e) { /* storage full */ }
  }
  btn.style.display = 'none';
  if (msgEl) msgEl.style.display = 'block';
};