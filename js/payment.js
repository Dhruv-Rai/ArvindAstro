/* ═══════════════════════════════════════════════════════════
   Arvind Rai — PhonePe Payment Helpers
   Frontend helper methods for PhonePe backend endpoints.
   ═══════════════════════════════════════════════════════════ */

var PhonePeGateway = {
  initiate: function(payload) {
    return fetch(API_BASE_URL + '/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }).then(function(response) {
      return response.json().then(function(data) {
        return { ok: response.ok, data: data };
      });
    });
  },

  getStatus: function(transactionId) {
    return fetch(API_BASE_URL + '/payment/phonepe/status/' + encodeURIComponent(transactionId || ''), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(function(response) {
      return response.json().then(function(data) {
        return { ok: response.ok, data: data };
      });
    });
  }
};

// Backward-compatible wrapper retained to avoid runtime errors
// if any legacy call path still invokes initiatePayment().
function initiatePayment(amount, data) {
  if (!amount || amount <= 0) {
    if (typeof onPaymentSuccess === 'function') {
      onPaymentSuccess('NO_PAYMENT_' + Date.now());
    }
    return;
  }

  var payload = {
    amount: amount,
    bookingReference: 'legacy-' + Date.now(),
    service: data && data.service ? data.service : 'Booking',
    customerName: data && data.name ? data.name : '',
    customerPhone: data && data.phone ? data.phone : ''
  };

  PhonePeGateway.initiate(payload)
    .then(function(result) {
      if (!result.ok || !result.data || !(result.data.tokenUrl || result.data.paymentUrl)) {
        throw new Error(result.data && result.data.error ? result.data.error : 'Could not start payment.');
      }

      var tokenUrl = result.data.tokenUrl || result.data.paymentUrl;

      if (
        window.PhonePeCheckout &&
        typeof window.PhonePeCheckout.transact === 'function'
      ) {
        window.PhonePeCheckout.transact({
          tokenUrl: tokenUrl,
          type: 'IFRAME',
          callback: function(response) {
            if (response === 'USER_CANCEL' && typeof showToast === 'function') {
              showToast('Payment cancelled by user.', 'info');
            }
          }
        });
        return;
      }

      window.location.href = tokenUrl;
    })
    .catch(function(error) {
      if (typeof showToast === 'function') {
        showToast(error && error.message ? error.message : 'Could not initiate payment.', 'error');
      }
    });
}