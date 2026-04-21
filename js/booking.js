/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Booking System
   Service-driven 4-step flow: Details -> Date -> Confirmation -> Payment
   ═══════════════════════════════════════════════════════════ */

var BOOKING_SERVICE_CATALOG = [
  {
    key: 'Janam Kundali',
    title: 'Janam Kundali/Horoscope',
    type: 'consultation',
    price: 2500,
    bookable: true
  },
  {
    key: 'Kundali Milan',
    title: 'Kundali Milan/Match Making',
    type: 'matchmaking',
    price: 2100,
    bookable: true
  },
  {
    key: 'Industrial / Corporate Vastu',
    title: 'Industrial / Corporate Vastu',
    type: 'vastu',
    price: 125000,
    bookable: true
  },
  {
    key: 'Vastu Shastra',
    title: 'Vastu Shastra (Home)',
    type: 'vastu',
    price: 51000,
    bookable: true
  },
  {
    key: 'Gemstone',
    title: 'Gemstone',
    type: 'consultation',
    price: 0,
    bookable: false
  },
  {
    key: 'Pujan / Remedies',
    title: 'Pujan / Remedies',
    type: 'puja',
    price: 0,
    bookable: true
  }
];

var BOOKING_SERVICE_MAP = {};
for (var serviceIndex = 0; serviceIndex < BOOKING_SERVICE_CATALOG.length; serviceIndex++) {
  BOOKING_SERVICE_MAP[BOOKING_SERVICE_CATALOG[serviceIndex].key] = BOOKING_SERVICE_CATALOG[serviceIndex];
}

var BOOKING_FORM_CONFIG = {
  consultation: {
    fields: [
      { name: 'fullName', label: 'Full Name', required: true, placeholder: 'Your full name' },
      { name: 'phone', label: 'Phone / WhatsApp', required: true, placeholder: '+91 XXXXX XXXXX', validation: 'phone', inputMode: 'tel' },
      { name: 'dob', label: 'Date of Birth', required: true, placeholder: 'DD/MM/YYYY', picker: 'past-date' },
      { name: 'tob', label: 'Time of Birth', required: true, placeholder: 'HH:MM AM/PM', picker: 'time' },
      { name: 'pob', label: 'Place of Birth', required: true, placeholder: 'City, State, Country' }
    ]
  },
  matchmaking: {
    fields: [
      { type: 'heading', text: 'Male Details' },
      { name: 'maleName', label: 'Male Name', required: true, placeholder: 'Enter male name' },
      { name: 'maleDob', label: 'Male Date of Birth', required: true, placeholder: 'DD/MM/YYYY', picker: 'past-date' },
      { name: 'maleTob', label: 'Male Time of Birth', required: true, placeholder: 'HH:MM AM/PM', picker: 'time' },
      { name: 'malePob', label: 'Male Place of Birth', required: true, placeholder: 'City, State, Country' },
      { type: 'heading', text: 'Female Details' },
      { name: 'femaleName', label: 'Female Name', required: true, placeholder: 'Enter female name' },
      { name: 'femaleDob', label: 'Female Date of Birth', required: true, placeholder: 'DD/MM/YYYY', picker: 'past-date' },
      { name: 'femaleTob', label: 'Female Time of Birth', required: true, placeholder: 'HH:MM AM/PM', picker: 'time' },
      { name: 'femalePob', label: 'Female Place of Birth', required: true, placeholder: 'City, State, Country' },
      { name: 'contactNumber', label: 'Phone / WhatsApp', required: true, placeholder: '+91 XXXXX XXXXX', validation: 'phone', inputMode: 'tel' }
    ]
  },
  vastu: {
    fields: [
      { name: 'fullName', label: 'Full Name', required: true, placeholder: 'Your full name' },
      { name: 'phone', label: 'Phone / WhatsApp', required: true, placeholder: '+91 XXXXX XXXXX', validation: 'phone', inputMode: 'tel' },
      { name: 'propertyLocation', label: 'Property Location', required: true, placeholder: 'Property address / location' }
    ]
  },
  puja: {
    fields: [
      { name: 'fullName', label: 'Full Name', required: true, placeholder: 'Your full name' },
      { name: 'phone', label: 'Phone / WhatsApp', required: true, placeholder: '+91 XXXXX XXXXX', validation: 'phone', inputMode: 'tel' },
      { name: 'dob', label: 'Date of Birth', required: true, placeholder: 'DD/MM/YYYY', picker: 'past-date' },
      { name: 'tob', label: 'Time of Birth', required: true, placeholder: 'HH:MM AM/PM', picker: 'time' },
      { name: 'pob', label: 'Place of Birth', required: true, placeholder: 'City, State, Country' }
    ]
  }
};

var BOOKING_STEPS = [
  {
    title: 'User Details',
    subtitle: 'Provide the required booking details for your selected service'
  },
  {
    title: 'Select Date',
    subtitle: 'Select your booking date. Time is assigned after confirmation'
  },
  {
    title: 'Confirmation',
    subtitle: 'Review and confirm your booking details'
  },
  {
    title: 'Payment Gateway',
    subtitle: 'Proceed to secure PhonePe checkout'
  }
];

var BOOKING_NOTE = 'Time will be assigned by astrologer after booking confirmation';
var BOOKING_PENDING_STORAGE_KEY = 'arvindrai_pending_phonepe_booking_v1';

var bookingData = createInitialBookingState();
var currentStep = 1;
var mainDatePickerInstance = null;
var dynamicPickerInstances = [];

var BookingModal = {
  openWithService: function(serviceContext) {
    this.reset();

    bookingData.serviceKey = serviceContext.serviceKey;
    bookingData.serviceType = serviceContext.serviceType;
    bookingData.serviceLabel = serviceContext.serviceLabel;
    bookingData.serviceSlug = serviceContext.serviceSlug;
    bookingData.price = serviceContext.price;

    var modal = document.getElementById('bookingModal');
    if (modal) {
      modal.classList.add('active');
    }

    document.body.style.overflow = 'hidden';
    this.showStep(1);
  },

  openFromStoredState: function(storedState) {
    bookingData = normalizeStoredBookingState(storedState);

    var modal = document.getElementById('bookingModal');
    if (modal) {
      modal.classList.add('active');
    }

    document.body.style.overflow = 'hidden';
    this.showStep(4);
  },

  close: function() {
    var modal = document.getElementById('bookingModal');
    if (modal) {
      modal.classList.remove('active');
    }

    document.body.style.overflow = '';
    clearDynamicPickers();

    if (mainDatePickerInstance) {
      mainDatePickerInstance.destroy();
      mainDatePickerInstance = null;
    }
  },

  reset: function() {
    bookingData = createInitialBookingState();
    currentStep = 1;

    clearDynamicPickers();

    if (mainDatePickerInstance) {
      mainDatePickerInstance.destroy();
      mainDatePickerInstance = null;
    }

    var dateInput = document.getElementById('modalDate');
    if (dateInput) {
      dateInput.value = '';
    }

    var summary = document.getElementById('bookingSummary');
    if (summary) {
      summary.innerHTML = '';
    }

    var paymentPreview = document.getElementById('paymentPreview');
    if (paymentPreview) {
      paymentPreview.innerHTML = '';
    }

    var confirmationSummary = document.getElementById('confirmationSummary');
    if (confirmationSummary) {
      confirmationSummary.innerHTML = '';
    }

    var finalState = document.getElementById('bookingFinalState');
    if (finalState) {
      finalState.style.display = 'none';
    }

    var payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = 'Proceed to Payment Gateway';
    }
  },

  showStep: function(step) {
    currentStep = step;

    var totalSteps = BOOKING_STEPS.length;

    document.querySelectorAll('.booking-step').forEach(function(dot, index) {
      dot.classList.remove('active', 'done');
      if (index < step - 1) {
        dot.classList.add('done');
      }
      if (index === step - 1) {
        dot.classList.add('active');
      }
    });

    for (var stepNumber = 1; stepNumber <= totalSteps; stepNumber++) {
      var pane = document.getElementById('step' + stepNumber);
      if (pane) {
        pane.classList.toggle('active', stepNumber === step);
      }
    }

    this.updateTitles(step);

    if (step === 1) {
      StepUserDetails.render();
    }
    if (step === 2) {
      StepDateSelection.init();
    }
    if (step === 3) {
      StepConfirmation.render();
    }
    if (step === 4) {
      PaymentHandler.renderPreview();
    }
  },

  updateTitles: function(step) {
    var title = document.getElementById('bookingModalTitle');
    var subtitle = document.getElementById('bookingModalSub');
    var stepMeta = BOOKING_STEPS[step - 1] || null;

    if (title) {
      title.textContent = stepMeta ? stepMeta.title : 'Book Your Consultation';
    }

    if (subtitle) {
      subtitle.textContent = stepMeta ? stepMeta.subtitle : '';
    }
  }
};

var StepUserDetails = {
  render: function() {
    var container = document.getElementById('dynamicFormContainer');
    if (!container) {
      return;
    }

    clearDynamicPickers();

    if (!bookingData.serviceKey || !bookingData.serviceType) {
      container.innerHTML = '<div class="booking-empty-state">Please select a service card to continue.</div>';
      return;
    }

    var fields = getFieldsForServiceType(bookingData.serviceType);
    var html = '';

    html += '<div class="form-sub" style="margin-bottom:16px;">Selected Service: ' + escapeHtml(bookingData.serviceLabel || bookingData.serviceKey) + '</div>';

    for (var index = 0; index < fields.length; index++) {
      html += this.buildFieldHtml(fields[index]);
    }

    container.innerHTML = html;
    this.bindValuePersistence(fields);
    this.initPickers(fields);
  },

  buildFieldHtml: function(field) {
    if (field.type === 'heading') {
      return '<div class="dynamic-group-title">' + escapeHtml(field.text) + '</div>';
    }

    var id = 'dynamic-' + field.name;
    var value = bookingData.details[field.name] || '';
    var requiredMark = field.required ? ' <span class="field-required">*</span>' : '';
    var readOnlyAttr = (field.picker && typeof flatpickr !== 'undefined') ? ' readonly' : '';
    var inputModeAttr = field.inputMode ? ' inputmode="' + escapeHtmlAttr(field.inputMode) + '"' : '';

    return '' +
      '<div class="f-field">' +
        '<label class="f-label" for="' + escapeHtmlAttr(id) + '">' + escapeHtml(field.label) + requiredMark + '</label>' +
        '<input class="f-input dynamic-input" id="' + escapeHtmlAttr(id) + '" data-field="' + escapeHtmlAttr(field.name) + '" type="text" placeholder="' + escapeHtmlAttr(field.placeholder || '') + '" value="' + escapeHtmlAttr(value) + '"' + readOnlyAttr + inputModeAttr + '>' +
        '<div class="f-error" id="error-' + escapeHtmlAttr(field.name) + '"></div>' +
      '</div>';
  },

  bindValuePersistence: function(fields) {
    for (var index = 0; index < fields.length; index++) {
      var field = fields[index];
      if (field.type === 'heading') {
        continue;
      }

      var input = document.getElementById('dynamic-' + field.name);
      if (!input) {
        continue;
      }

      input.addEventListener('input', function(event) {
        var fieldName = event.target.getAttribute('data-field');
        bookingData.details[fieldName] = (event.target.value || '').trim();
        StepUserDetails.clearFieldError(fieldName);
      });
    }
  },

  initPickers: function(fields) {
    if (typeof flatpickr === 'undefined') {
      return;
    }

    for (var index = 0; index < fields.length; index++) {
      var field = fields[index];
      if (!field.picker) {
        continue;
      }

      var input = document.getElementById('dynamic-' + field.name);
      if (!input) {
        continue;
      }

      var pickerOptions = {
        allowInput: false,
        disableMobile: true,
        onChange: function(selectedDates, dateStr, instance) {
          var changedFieldName = instance.element.getAttribute('data-field');
          bookingData.details[changedFieldName] = dateStr;
          StepUserDetails.clearFieldError(changedFieldName);
        }
      };

      if (field.picker === 'past-date') {
        pickerOptions.dateFormat = 'd/m/Y';
        pickerOptions.maxDate = 'today';
      }

      if (field.picker === 'time') {
        pickerOptions.enableTime = true;
        pickerOptions.noCalendar = true;
        pickerOptions.dateFormat = 'h:i K';
        pickerOptions.time_24hr = false;
        pickerOptions.minuteIncrement = 1;
      }

      if (bookingData.details[field.name]) {
        pickerOptions.defaultDate = bookingData.details[field.name];
      }

      dynamicPickerInstances.push(flatpickr(input, pickerOptions));
    }
  },

  collectAndValidate: function() {
    var fields = getFieldsForServiceType(bookingData.serviceType);
    if (!fields.length) {
      showToast('Selected service configuration is unavailable.', 'error');
      return false;
    }

    this.clearErrors();

    var details = {};
    var hasError = false;

    for (var index = 0; index < fields.length; index++) {
      var field = fields[index];
      if (field.type === 'heading') {
        continue;
      }

      var input = document.getElementById('dynamic-' + field.name);
      var value = input ? (input.value || '').trim() : '';
      details[field.name] = value;

      if (field.required && !value) {
        this.setFieldError(field.name, 'This field is required.');
        hasError = true;
        continue;
      }

      if (field.validation === 'phone' && value && !isValidPhone(value)) {
        this.setFieldError(field.name, 'Enter a valid phone number.');
        hasError = true;
      }
    }

    if (hasError) {
      showToast('Please correct highlighted fields.', 'error');
      return false;
    }

    bookingData.details = details;
    updateDerivedContactFields();
    return true;
  },

  clearErrors: function() {
    document.querySelectorAll('#dynamicFormContainer .f-error').forEach(function(errorNode) {
      errorNode.textContent = '';
    });
  },

  setFieldError: function(fieldName, message) {
    var errorNode = document.getElementById('error-' + fieldName);
    if (errorNode) {
      errorNode.textContent = message;
    }
  },

  clearFieldError: function(fieldName) {
    var errorNode = document.getElementById('error-' + fieldName);
    if (errorNode) {
      errorNode.textContent = '';
    }
  }
};

var StepDateSelection = {
  init: function() {
    var input = document.getElementById('modalDate');
    if (!input) {
      return;
    }

    if (mainDatePickerInstance) {
      mainDatePickerInstance.destroy();
      mainDatePickerInstance = null;
    }

    if (typeof flatpickr === 'undefined') {
      input.readOnly = false;
      input.value = bookingData.date || '';
      return;
    }

    mainDatePickerInstance = flatpickr(input, {
      minDate: 'today',
      maxDate: new Date().fp_incr(180),
      dateFormat: 'd/m/Y',
      disableMobile: true,
      defaultDate: bookingData.date || null,
      onChange: function(selectedDates, dateStr) {
        bookingData.date = dateStr;
      }
    });
  },

  validate: function() {
    var input = document.getElementById('modalDate');
    var dateValue = input ? (input.value || '').trim() : '';

    if (!dateValue) {
      showToast('Please select a booking date.', 'error');
      return false;
    }

    bookingData.date = dateValue;
    return true;
  }
};

var StepConfirmation = {
  render: function() {
    var summary = document.getElementById('bookingSummary');
    if (!summary) {
      return;
    }

    var rows = getSummaryRows();
    if (!rows.length) {
      summary.innerHTML = '<div class="booking-empty-state">No booking details found. Please go back and complete your details.</div>';
      return;
    }

    summary.innerHTML = renderSummaryRows(rows) + renderAmountRow();
  }
};

var PaymentHandler = {
  renderPreview: function() {
    var preview = document.getElementById('paymentPreview');
    if (!preview) {
      return;
    }

    var rows = getSummaryRows();
    preview.innerHTML = renderSummaryRows(rows) + renderAmountRow();

    var payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = bookingData.price > 0 ? 'Proceed to Payment Gateway' : 'Confirm Booking Request';
    }

    var finalState = document.getElementById('bookingFinalState');
    if (finalState && !bookingData.paymentId) {
      finalState.style.display = 'none';
    }
  },

  initiate: function() {
    if (!bookingData.serviceKey || !bookingData.serviceLabel || !bookingData.date) {
      showToast('Please complete booking details before payment.', 'error');
      return;
    }

    if (bookingData.paymentId) {
      showToast('This booking is already confirmed.', 'info');
      return;
    }

    if (bookingData.price <= 0) {
      onPaymentSuccess('NO_PAYMENT_' + Date.now());
      return;
    }

    var payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = 'Opening PhonePe...';
    }

    this.storePendingBooking();

    var requestPayload = {
      amount: bookingData.price,
      bookingReference: buildBookingReference(),
      service: bookingData.serviceLabel,
      customerName: bookingData.contactName,
      customerPhone: bookingData.contactPhone
    };

    fetch(API_BASE_URL + '/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    })
      .then(function(response) {
        return response.json().then(function(data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function(result) {
        if (!result.ok || !result.data || !(result.data.tokenUrl || result.data.paymentUrl)) {
          throw new Error(result.data && result.data.error ? result.data.error : 'Could not initiate payment.');
        }

        bookingData.phonePeTransactionId = result.data.merchantOrderId || result.data.transactionId || '';

        if (!bookingData.phonePeTransactionId) {
          throw new Error('PhonePe order reference is missing. Please retry.');
        }

        PaymentHandler.storePendingBooking();
        PaymentHandler.openPhonePePayPage(result.data.tokenUrl || result.data.paymentUrl);
      })
      .catch(function(error) {
        showToast(error && error.message ? error.message : 'Could not initiate payment. Please retry.', 'error');
        PaymentHandler.setRetryState();
      });
  },

  openPhonePePayPage: function(payPageUrl) {
    if (!payPageUrl) {
      throw new Error('PhonePe PayPage URL is missing.');
    }

    if (
      window.PhonePeCheckout &&
      typeof window.PhonePeCheckout.transact === 'function'
    ) {
      window.PhonePeCheckout.transact({
        tokenUrl: payPageUrl,
        type: 'IFRAME',
        callback: function(response) {
          if (response === 'USER_CANCEL') {
            showToast('Payment cancelled by user.', 'info');
            PaymentHandler.setRetryState();
            return;
          }

          PaymentHandler.verifyPendingPaymentStatus();
        }
      });
      return;
    }

    // Fallback to redirect if checkout script is unavailable.
    window.location.href = payPageUrl;
  },

  verifyPendingPaymentStatus: function() {
    var pending = this.getPendingBooking();
    var reference = pending && pending.phonePeTransactionId
      ? pending.phonePeTransactionId
      : bookingData.phonePeTransactionId;

    if (!reference) {
      showToast('Could not find pending payment reference. Please retry.', 'error');
      this.setRetryState();
      return;
    }

    this.verifyPaymentStatus(reference);
  },

  verifyPaymentStatus: function(transactionId) {
    var payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = 'Checking payment status...';
    }

    this.fetchPaymentStatus(transactionId)
      .then(function(statusResult) {
        PaymentHandler.handlePaymentStatusResult(statusResult, transactionId);
      })
      .catch(function(error) {
        showToast(error && error.message ? error.message : 'Could not verify payment status.', 'error');
        PaymentHandler.setRetryState();
      });
  },

  handlePaymentStatusResult: function(statusResult, transactionId) {
    if (!statusResult.ok || !statusResult.data) {
      throw new Error('Could not verify payment status. Please retry.');
    }

    var state = String(statusResult.data.state || '').toLowerCase();
    if (state === 'success') {
      onPaymentSuccess(statusResult.data.paymentId || ('PHONEPE_' + transactionId));
      return;
    }

    if (state === 'failure') {
      showToast('Payment failed. Please retry.', 'error');
      PaymentHandler.setRetryState();
      return;
    }

    showToast('Payment status is pending. Please retry after a moment.', 'info');
    PaymentHandler.setRetryState();
  },

  handleReturnFromGateway: function() {
    if (typeof URLSearchParams === 'undefined') {
      return false;
    }

    var params = new URLSearchParams(window.location.search || '');
    var transactionId = params.get('phonepeTxn') || params.get('phonepeOrderId') || '';
    if (!transactionId) {
      return false;
    }

    var pending = this.getPendingBooking();
    this.cleanupReturnQuery(params);

    if (!pending || !pending.phonePeTransactionId || pending.phonePeTransactionId !== transactionId) {
      return false;
    }

    BookingModal.openFromStoredState(pending);

    this.verifyPaymentStatus(transactionId);

    return true;
  },

  fetchPaymentStatus: function(transactionId) {
    return fetch(API_BASE_URL + '/payment/phonepe/status/' + encodeURIComponent(transactionId), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(function(response) {
      return response.json().then(function(data) {
        return { ok: response.ok, data: data };
      });
    });
  },

  setRetryState: function() {
    var payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = 'Retry Payment';
    }
  },

  storePendingBooking: function() {
    try {
      window.localStorage.setItem(BOOKING_PENDING_STORAGE_KEY, JSON.stringify(bookingData));
    } catch (error) {
      // Ignore storage failures and continue.
    }
  },

  clearPendingBooking: function() {
    try {
      window.localStorage.removeItem(BOOKING_PENDING_STORAGE_KEY);
    } catch (error) {
      // Ignore storage cleanup failures.
    }
  },

  getPendingBooking: function() {
    try {
      var raw = window.localStorage.getItem(BOOKING_PENDING_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  },

  cleanupReturnQuery: function(params) {
    params.delete('phonepeTxn');
    params.delete('phonepeOrderId');
    params.delete('phonepeReturn');

    var cleanQuery = params.toString();
    var cleanUrl = window.location.pathname + (cleanQuery ? ('?' + cleanQuery) : '') + (window.location.hash || '');
    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  bindBookSectionServiceSelector();

  if (!PaymentHandler.handleReturnFromGateway()) {
    bootstrapBookingFromQuery();
  }
});

function createInitialBookingState() {
  return {
    serviceKey: '',
    serviceType: '',
    serviceLabel: '',
    serviceSlug: '',
    price: 0,
    date: '',
    details: {},
    contactName: '',
    contactPhone: '',
    note: BOOKING_NOTE,
    paymentId: '',
    phonePeTransactionId: ''
  };
}

function normalizeStoredBookingState(storedState) {
  var defaults = createInitialBookingState();
  var copy = shallowCopy(defaults);
  var source = storedState && typeof storedState === 'object' ? storedState : {};

  for (var key in copy) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      copy[key] = source[key];
    }
  }

  if (!copy.details || typeof copy.details !== 'object') {
    copy.details = {};
  }

  return copy;
}

function bootstrapBookingFromQuery() {
  if (typeof URLSearchParams === 'undefined') {
    return;
  }

  var params = new URLSearchParams(window.location.search || '');
  var shouldStart = params.get('startBooking') === '1';
  var serviceKey = params.get('bookingService') || '';

  if (!shouldStart || !serviceKey) {
    return;
  }

  var options = {
    type: params.get('bookingType') || '',
    label: params.get('bookingLabel') || '',
    slug: params.get('bookingSlug') || ''
  };

  var price = Number(params.get('bookingPrice') || 0);
  openBookingWithService(serviceKey, price, options);

  params.delete('startBooking');
  params.delete('bookingService');
  params.delete('bookingType');
  params.delete('bookingLabel');
  params.delete('bookingSlug');
  params.delete('bookingPrice');

  var cleanQuery = params.toString();
  var cleanUrl = window.location.pathname + (cleanQuery ? ('?' + cleanQuery) : '') + (window.location.hash || '');
  if (window.history && typeof window.history.replaceState === 'function') {
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

function scrollToServicesSection() {
  var target = document.getElementById('services-section') || document.getElementById('services');
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  var navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.remove('open');
  }
}

if (typeof window.scrollToServicesSection !== 'function') {
  window.scrollToServicesSection = scrollToServicesSection;
}

function bindBookSectionServiceSelector() {
  var select = document.getElementById('bookService');
  if (!select) {
    return;
  }

  select.addEventListener('change', updateBookServiceHint);
  updateBookServiceHint();
}

function updateBookServiceHint() {
  var select = document.getElementById('bookService');
  var hint = document.getElementById('bookServiceHint');
  if (!select || !hint) {
    return;
  }

  if (!select.value) {
    hint.textContent = 'Select a service, then continue from the service cards above.';
    return;
  }

  if (select.value === 'Gemstone') {
    hint.textContent = 'Gemstone is available as per requirement and cannot be booked directly.';
    return;
  }

  hint.textContent = 'Booking now starts only from service cards. Please continue from the Services section.';
}

function openBookingModal() {
  showToast('Booking now starts from service cards only. Please choose a service first.', 'info');
  scrollToServicesSection();
}

function closeBookingModal() {
  BookingModal.close();
}

function openBookingWithService(serviceKey, price, options) {
  var context = resolveServiceContext(serviceKey, price, options);
  if (!context) {
    showToast('Selected service is unavailable for booking.', 'error');
    return;
  }

  if (!context.bookable) {
    showToast('This service is available as per requirement. Please contact on WhatsApp.', 'info');
    return;
  }

  BookingModal.openWithService(context);
}

function startBookingFromForm() {
  showToast('Please continue booking from service cards only.', 'info');
  scrollToServicesSection();
}

function bookingNext(fromStep) {
  if (fromStep === 1) {
    if (!StepUserDetails.collectAndValidate()) {
      return;
    }
    BookingModal.showStep(2);
    return;
  }

  if (fromStep === 2) {
    if (!StepDateSelection.validate()) {
      return;
    }
    BookingModal.showStep(3);
    return;
  }

  if (fromStep === 3) {
    BookingModal.showStep(4);
  }
}

function bookingBack(currentVisibleStep) {
  if (currentVisibleStep <= 1) {
    return;
  }
  BookingModal.showStep(currentVisibleStep - 1);
}

function editBookingDetails() {
  BookingModal.showStep(1);
}

function initiateBookingPayment() {
  PaymentHandler.initiate();
}

function onPaymentSuccess(paymentId) {
  bookingData.paymentId = paymentId || '';

  saveBookingToBackend()
    .then(function() {
      showBookingConfirmation();
      PaymentHandler.clearPendingBooking();
    })
    .catch(function() {
      showBookingConfirmation();
      PaymentHandler.clearPendingBooking();
    });

  sendBookingConfirmation(bookingData);
}

function saveBookingToBackend() {
  if (typeof fetch !== 'function') {
    return Promise.resolve();
  }

  return fetch(API_BASE_URL + '/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBookingPayload())
  }).then(function(response) {
    if (!response.ok) {
      throw new Error('Could not save booking.');
    }
    return response.json();
  });
}

function showBookingConfirmation() {
  var payBtn = document.getElementById('payBtn');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = 'Payment Completed';
  }

  var finalState = document.getElementById('bookingFinalState');
  if (finalState) {
    finalState.style.display = 'block';
  }

  var confirmationSummary = document.getElementById('confirmationSummary');
  if (confirmationSummary) {
    confirmationSummary.innerHTML = '' +
      '<div class="booking-summary-row"><span class="label">Service</span><span class="value">' + escapeHtml(bookingData.serviceLabel || bookingData.serviceKey) + '</span></div>' +
      '<div class="booking-summary-row"><span class="label">Date</span><span class="value">' + escapeHtml(bookingData.date) + '</span></div>' +
      '<div class="booking-summary-row"><span class="label">Amount</span><span class="value">' + escapeHtml(bookingData.price > 0 ? formatCurrency(bookingData.price) : 'As Per Requirement') + '</span></div>' +
      '<div class="booking-summary-row"><span class="label">Payment ID</span><span class="value">' + escapeHtml(bookingData.paymentId || 'N/A') + '</span></div>';
  }

  showToast('Booking confirmed successfully.', 'success');
}

function sendBookingConfirmation(data) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || typeof emailjs === 'undefined') {
    return;
  }

  var rows = getSummaryRows();
  var summaryLines = [];

  for (var index = 0; index < rows.length; index++) {
    summaryLines.push(rows[index].label + ': ' + rows[index].value);
  }

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name: data.contactName || 'Booking User',
    from_email: '',
    phone: data.contactPhone || '',
    subject: 'New Booking — ' + (data.serviceLabel || data.serviceKey),
    message: summaryLines.join('\n') + '\nPayment ID: ' + (data.paymentId || 'N/A')
  }).catch(function(error) {
    console.error('Booking email failed:', error);
  });
}

function buildBookingPayload() {
  var details = shallowCopy(bookingData.details);
  var legacyBirth = resolveLegacyBirthFields(details);

  return {
    service: bookingData.serviceLabel || bookingData.serviceKey,
    serviceKey: bookingData.serviceKey,
    serviceType: bookingData.serviceType,
    serviceSlug: bookingData.serviceSlug,
    price: bookingData.price,
    date: bookingData.date,
    paymentId: bookingData.paymentId,
    phonePeTransactionId: bookingData.phonePeTransactionId,
    contactName: bookingData.contactName,
    contactPhone: bookingData.contactPhone,
    details: details,

    // Backward-compatible fields for existing integrations.
    name: bookingData.contactName,
    phone: bookingData.contactPhone,
    dob: legacyBirth.dob,
    tob: legacyBirth.tob,
    pob: legacyBirth.pob,
    slot: ''
  };
}

function resolveLegacyBirthFields(details) {
  return {
    dob: details.dob || details.maleDob || '',
    tob: details.tob || details.maleTob || '',
    pob: details.pob || details.malePob || ''
  };
}

function getSummaryRows() {
  if (!bookingData.serviceKey) {
    return [];
  }

  var rows = [
    { label: 'Selected Service', value: bookingData.serviceLabel || bookingData.serviceKey }
  ];

  var fields = getFieldsForServiceType(bookingData.serviceType);
  for (var index = 0; index < fields.length; index++) {
    var field = fields[index];
    if (field.type === 'heading') {
      continue;
    }

    var value = bookingData.details[field.name];
    if (!value) {
      continue;
    }

    rows.push({ label: field.label, value: value });
  }

  rows.push({ label: 'Selected Date', value: bookingData.date || 'Not selected' });
  rows.push({ label: 'Scheduling Note', value: BOOKING_NOTE });

  return rows;
}

function renderSummaryRows(rows) {
  var html = '';
  for (var index = 0; index < rows.length; index++) {
    html += '' +
      '<div class="booking-summary-row">' +
        '<span class="label">' + escapeHtml(rows[index].label) + '</span>' +
        '<span class="value">' + escapeHtml(rows[index].value) + '</span>' +
      '</div>';
  }
  return html;
}

function renderAmountRow() {
  return '' +
    '<div class="booking-summary-row booking-summary-total">' +
      '<span class="label">Total Amount</span>' +
      '<span class="value">' + escapeHtml(bookingData.price > 0 ? formatCurrency(bookingData.price) : 'As Per Requirement') + '</span>' +
    '</div>';
}

function resolveServiceContext(serviceKey, price, options) {
  var baseService = BOOKING_SERVICE_MAP[serviceKey];
  if (!baseService) {
    return null;
  }

  var explicitType = options && options.type ? String(options.type).trim() : '';
  var normalizedType = normalizeBookingServiceType(explicitType || baseService.type || 'consultation');
  var numericPrice = toNumber(price);
  var resolvedPrice = numericPrice > 0 ? numericPrice : toNumber(baseService.price);
  var label = options && options.label ? String(options.label).trim() : '';
  var slug = options && options.slug ? String(options.slug).trim() : '';

  return {
    serviceKey: baseService.key,
    serviceType: normalizedType,
    serviceLabel: label || baseService.title || baseService.key,
    serviceSlug: slug,
    price: resolvedPrice,
    bookable: baseService.bookable !== false
  };
}

function normalizeBookingServiceType(type) {
  var normalized = String(type || '').toLowerCase();

  if (normalized === 'matchmaking') {
    return 'matchmaking';
  }
  if (normalized === 'vastu') {
    return 'vastu';
  }
  if (normalized === 'puja') {
    return 'puja';
  }

  return 'consultation';
}

function getFieldsForServiceType(serviceType) {
  var normalizedType = normalizeBookingServiceType(serviceType);
  var config = BOOKING_FORM_CONFIG[normalizedType];
  return config ? config.fields : [];
}

function updateDerivedContactFields() {
  var details = bookingData.details || {};
  var serviceType = normalizeBookingServiceType(bookingData.serviceType);

  if (serviceType === 'matchmaking') {
    var pair = [];
    if (details.maleName) {
      pair.push(details.maleName);
    }
    if (details.femaleName) {
      pair.push(details.femaleName);
    }

    bookingData.contactName = pair.join(' & ');
    bookingData.contactPhone = details.contactNumber || '';
    return;
  }

  bookingData.contactName = details.fullName || '';
  bookingData.contactPhone = details.phone || '';
}

function buildBookingReference() {
  var base = (bookingData.serviceSlug || bookingData.serviceKey || 'booking')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  return base + '-' + Date.now();
}

function clearDynamicPickers() {
  while (dynamicPickerInstances.length) {
    var instance = dynamicPickerInstances.pop();
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
  }
}

function shallowCopy(obj) {
  var copy = {};
  if (!obj) {
    return copy;
  }

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = obj[key];
    }
  }

  return copy;
}

function toNumber(value) {
  var parsed = Number(value);
  return isFinite(parsed) ? parsed : 0;
}

function isValidPhone(phone) {
  return /^\+?[0-9\s-]{10,15}$/.test(phone);
}

function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}