/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Astrology Calculators
   Numerology, Moon Sign, Love Compatibility, Dasha,
   Kundali placeholder, Panchang Today
   ═══════════════════════════════════════════════════════════ */

var CALC_DEFAULT_LAT = '10.214747';
var CALC_DEFAULT_LNG = '78.097626';
var CALC_DEFAULT_TIMEZONE = '+05:30';
var CALC_DEFAULT_YEAR_LENGTH = '1';

function getCalculatorApiBaseUrl() {
  if (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) {
    return API_BASE_URL.trim();
  }

  if (window.location && window.location.origin && window.location.origin !== 'null') {
    return window.location.origin + '/api';
  }

  return '/api';
}

function toDateTimeLocalValue(dateObj) {
  var timezoneOffsetMs = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function toApiDateTime(datetimeLocal, timezoneOffset) {
  if (!datetimeLocal || !timezoneOffset) return '';

  var normalized = datetimeLocal.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
    return '';
  }

  if (normalized.length === 16) {
    normalized += ':00';
  }

  return normalized + timezoneOffset;
}

function escapeCalcHtml(value) {
  if (value === null || value === undefined) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(value)));
  return div.innerHTML;
}

function getSafeResultValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return escapeCalcHtml(value);
}

function isValidCoordinate(value, min, max) {
  var parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
}

function getTimezoneSelectHTML(fieldId, selectedOffset) {
  var offsets = ['+05:30', '+00:00', '+01:00', '-05:00'];
  var optionsHtml = offsets.map(function(offset) {
    var selected = offset === selectedOffset ? ' selected' : '';
    return '<option value="' + offset + '"' + selected + '>' + offset + '</option>';
  }).join('');

  return '' +
    '<div class="f-field">' +
      '<label class="f-label">Timezone Offset</label>' +
      '<select class="f-input" id="' + fieldId + '">' + optionsHtml + '</select>' +
    '</div>';
}

async function callCalculatorApi(path, params) {
  var queryString = new URLSearchParams(params).toString();
  var endpoint = getCalculatorApiBaseUrl() + path + (queryString ? ('?' + queryString) : '');
  var response = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  var payload = {};
  try {
    payload = await response.json();
  } catch (err) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || ('Request failed with status ' + response.status));
  }

  return payload;
}

// ══════════════ INIT PANCHANG WIDGET ══════════════
document.addEventListener('DOMContentLoaded', function() {
  renderPanchangWidget();
});

// ══════════════ OPEN/CLOSE CALCULATOR MODAL ══════════════
function openCalculator(type) {
  var modal = document.getElementById('calcModal');
  var content = document.getElementById('calcModalContent');
  if (!modal || !content) return;

  content.innerHTML = getCalculatorHTML(type);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCalcModal() {
  document.getElementById('calcModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ══════════════ CALCULATOR HTML TEMPLATES ══════════════
function getCalculatorHTML(type) {
  switch(type) {
    case 'numerology': return getNumerologyHTML();
    case 'moonsign': return getMoonSignHTML();
    case 'love': return getLoveHTML();
    case 'dasha': return getDashaHTML();
    case 'kundali': return getKundaliHTML();
    case 'panchang': return getPanchangHTML();
    default: return '<p>Calculator not found.</p>';
  }
}

// ──────────── NUMEROLOGY CALCULATOR ────────────
function getNumerologyHTML() {
  var defaultDateTime = toDateTimeLocalValue(new Date(2000, 0, 1, 0, 0, 0));

  return '' +
    '<div class="form-title">🔢 Numerology Birthday Number</div>' +
    '<div class="f-field"><label class="f-label">Date & Time</label><input class="f-input" id="numDatetime" type="datetime-local" value="' + defaultDateTime + '"></div>' +
    getTimezoneSelectHTML('numTimezone', CALC_DEFAULT_TIMEZONE) +
    '<button class="btn-next" onclick="calculateNumerology()">Generate Numerology Report →</button>' +
    '<div id="numResult"></div>';
}

async function calculateNumerology() {
  var datetimeInput = document.getElementById('numDatetime');
  var timezoneInput = document.getElementById('numTimezone');
  var resultEl = document.getElementById('numResult');
  if (!datetimeInput || !timezoneInput || !resultEl) return;

  var datetime = toApiDateTime(datetimeInput.value, timezoneInput.value);
  if (!datetime) {
    showToast('Please provide a valid date and time.', 'error');
    return;
  }

  resultEl.innerHTML = '<div class="form-sub" style="margin-top:12px;">Fetching numerology report...</div>';

  try {
    var report = await callCalculatorApi('/numerology', { datetime: datetime });
    resultEl.innerHTML = '' +
      '<div class="calc-result-box">' +
        '<h3>Birthday Number Report</h3>' +
        '<div class="calc-result-item"><div class="num-label">Birthday Number</div><div class="num-value">' + getSafeResultValue(report.number) + '</div></div>' +
        '<p>' + getSafeResultValue(report.description) + '</p>' +
      '</div>';
    showToast('Numerology report generated successfully.', 'success');
  } catch (error) {
    resultEl.innerHTML = '' +
      '<div class="calc-result-box">' +
        '<h3>Unable to Generate Report</h3>' +
        '<p>' + escapeCalcHtml(error.message) + '</p>' +
      '</div>';
    showToast(error.message, 'error');
  }
}

function sumDigits(str) {
  var sum = 0;
  for (var i = 0; i < str.length; i++) {
    var d = parseInt(str[i]);
    if (!isNaN(d)) sum += d;
  }
  return sum;
}

function sumLetters(str) {
  var sum = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str[i].toUpperCase();
    if (c >= 'A' && c <= 'Z') {
      sum += c.charCodeAt(0) - 64; // A=1, B=2, ...
    }
  }
  return sum;
}

function reduceToMaster(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = sumDigits(num.toString());
  }
  return num;
}

function getNumberMeaning(num) {
  var meanings = {
    1: 'The Leader — Independence, ambition, and new beginnings. You are a pioneer with strong willpower.',
    2: 'The Diplomat — Cooperation, sensitivity, and balance. You are a natural peacemaker and partner.',
    3: 'The Creative — Expression, joy, and inspiration. You have artistic talent and optimism.',
    4: 'The Builder — Stability, hard work, and order. You are practical, disciplined, and dependable.',
    5: 'The Adventurer — Freedom, change, and versatility. You thrive on new experiences and adaptability.',
    6: 'The Nurturer — Love, responsibility, and harmony. You are caring, protective, and family-oriented.',
    7: 'The Seeker — Wisdom, introspection, and spirituality. You are analytical and drawn to deeper truths.',
    8: 'The Powerhouse — Achievement, wealth, and authority. You have strong business sense and material mastery.',
    9: 'The Humanitarian — Compassion, wisdom, and selflessness. You are idealistic and globally minded.',
    11: 'Master Number 11 — The Intuitive. Heightened spiritual awareness, visionary insight, and inspiration. A powerful channel for divine energy.',
    22: 'Master Number 22 — The Master Builder. Ability to turn grand visions into reality. Combines spiritual insight with practical achievement.',
    33: 'Master Number 33 — The Master Teacher. Ultimate expression of compassion, healing, and spiritual upliftment. A rare blessing of cosmic knowledge.'
  };
  return meanings[num] || 'A unique vibration with its own cosmic significance.';
}

// ──────────── MOON SIGN (RASHI) CALCULATOR ────────────
// API UPGRADE: For accurate Vedic Moon Sign based on exact birth time and place, integrate Vedic Rishi API or Astro-Seek API — add API_KEY to .env
function getMoonSignHTML() {
  return '' +
    '<div class="form-title">☀️ Sun Sign (Rashi) Calculator</div>' +
    '<div class="form-sub">Find your approximate Rashi based on your date of birth</div>' +
    '<p style="font-size:11px; color:var(--muted); margin-bottom:16px; line-height:1.6;">Note: This uses simplified Sun-sign date ranges as an indicator. </p>' +
    '<div class="f-field"><label class="f-label">Date of Birth</label><input class="f-input" id="moonDob" placeholder="DD/MM/YYYY" type="text"></div>' +
    '<button class="btn-next" onclick="calculateMoonSign()">Find My Rashi →</button>' +
    '<div id="moonResult"></div>';
}

function calculateMoonSign() {
  var dob = document.getElementById('moonDob').value.trim();
  if (!dob) { showToast('Please enter your date of birth.', 'error'); return; }

  var parts = dob.split(/[\/\-\.]/);
  if (parts.length !== 3) { showToast('Please enter date in DD/MM/YYYY format.', 'error'); return; }

  var day = parseInt(parts[0]);
  var month = parseInt(parts[1]);

  var rashi = getRashiFromDate(day, month);

  document.getElementById('moonResult').innerHTML = '' +
    '<div class="calc-result-box">' +
    '<h3>' + rashi.symbol + ' ' + rashi.name + ' (' + rashi.hindi + ')</h3>' +
    '<div class="calc-result-item"><div class="num-label">Ruling Planet</div><div class="num-value">' + rashi.planet + '</div></div>' +
    '<div class="calc-result-item"><div class="num-label">Element</div><div class="num-value">' + rashi.element + '</div></div>' +
    '<p>' + rashi.traits + '</p>' +
    '</div>';
}

function getRashiFromDate(day, month) {
  var rashis = [
    { name:'Aries', hindi:'Mesha (मेष)', symbol:'♈', planet:'Mars', element:'Fire', traits:'Bold, ambitious, courageous, and confident. Natural leaders who love challenges and adventure. Quick to act, passionate, and fiercely independent.', start:[3,21], end:[4,19] },
    { name:'Taurus', hindi:'Vrishabha (वृषभ)', symbol:'♉', planet:'Venus', element:'Earth', traits:'Reliable, patient, practical, and devoted. Lovers of beauty, comfort, and stability. Strong-willed and deeply grounded in their values.', start:[4,20], end:[5,20] },
    { name:'Gemini', hindi:'Mithuna (मिथुन)', symbol:'♊', planet:'Mercury', element:'Air', traits:'Adaptable, outgoing, intelligent, and curious. Excellent communicators with dual nature. Quick learners who thrive on variety and social interaction.', start:[5,21], end:[6,20] },
    { name:'Cancer', hindi:'Karka (कर्क)', symbol:'♋', planet:'Moon', element:'Water', traits:'Intuitive, emotional, nurturing, and protective. Deeply connected to home and family. Empathetic with strong emotional intelligence.', start:[6,21], end:[7,22] },
    { name:'Leo', hindi:'Simha (सिंह)', symbol:'♌', planet:'Sun', element:'Fire', traits:'Dramatic, confident, generous, and warm-hearted. Natural born leaders with magnetic charisma. Creative souls who love being in the spotlight.', start:[7,23], end:[8,22] },
    { name:'Virgo', hindi:'Kanya (कन्या)', symbol:'♍', planet:'Mercury', element:'Earth', traits:'Analytical, kind, hardworking, and practical. Detail-oriented perfectionists with strong service orientation. Excellent problem-solvers with sharp minds.', start:[8,23], end:[9,22] },
    { name:'Libra', hindi:'Tula (तुला)', symbol:'♎', planet:'Venus', element:'Air', traits:'Diplomatic, fair-minded, social, and gracious. Seekers of balance and harmony in all things. Artistic with refined taste and love for partnerships.', start:[9,23], end:[10,22] },
    { name:'Scorpio', hindi:'Vrishchika (वृश्चिक)', symbol:'♏', planet:'Mars/Pluto', element:'Water', traits:'Resourceful, powerful, passionate, and brave. Deeply intuitive with penetrating insight. Transformative energy with unmatched determination.', start:[10,23], end:[11,21] },
    { name:'Sagittarius', hindi:'Dhanu (धनु)', symbol:'♐', planet:'Jupiter', element:'Fire', traits:'Generous, idealistic, great sense of humor, and adventurous. Philosophical seekers of truth and freedom. Optimistic travelers of both world and mind.', start:[11,22], end:[12,21] },
    { name:'Capricorn', hindi:'Makara (मकर)', symbol:'♑', planet:'Saturn', element:'Earth', traits:'Responsible, disciplined, self-controlled, and ambitious. Masters of long-term planning and perseverance. Practical wisdom with deep reserves of patience.', start:[12,22], end:[1,19] },
    { name:'Aquarius', hindi:'Kumbha (कुंभ)', symbol:'♒', planet:'Saturn/Uranus', element:'Air', traits:'Progressive, original, independent, and humanitarian. Visionary thinkers ahead of their time. Champions of individuality and social change.', start:[1,20], end:[2,18] },
    { name:'Pisces', hindi:'Meena (मीन)', symbol:'♓', planet:'Jupiter/Neptune', element:'Water', traits:'Compassionate, artistic, intuitive, and gentle. Deeply empathetic dreamers with rich inner worlds. Spiritual souls with boundless imagination.', start:[2,19], end:[3,20] }
  ];

  for (var i = 0; i < rashis.length; i++) {
    var r = rashis[i];
    var s = r.start;
    var e = r.end;

    if (s[0] <= e[0]) {
      // Normal range (same year)
      if ((month === s[0] && day >= s[1]) || (month === e[0] && day <= e[1]) || (month > s[0] && month < e[0])) {
        return r;
      }
    } else {
      // Wraps around year (Capricorn: Dec-Jan)
      if ((month === s[0] && day >= s[1]) || (month === e[0] && day <= e[1]) || month > s[0] || month < e[0]) {
        return r;
      }
    }
  }
  return rashis[0]; // Default to Aries
}

// ──────────── LOVE COMPATIBILITY ────────────
function getLoveHTML() {
  return '' +
    '<div class="form-title">💑 Love Compatibility</div>' +
    '<div class="form-sub">Check astrological compatibility between two people</div>' +
    '<div class="f-field"><label class="f-label">Person 1 — Date of Birth</label><input class="f-input" id="loveDob1" placeholder="DD/MM/YYYY" type="text"></div>' +
    '<div class="f-field"><label class="f-label">Person 2 — Date of Birth</label><input class="f-input" id="loveDob2" placeholder="DD/MM/YYYY" type="text"></div>' +
    '<button class="btn-next" onclick="calculateLove()">Check Compatibility →</button>' +
    '<div id="loveResult"></div>';
}

function calculateLove() {
  var dob1 = document.getElementById('loveDob1').value.trim();
  var dob2 = document.getElementById('loveDob2').value.trim();
  if (!dob1 || !dob2) { showToast('Please enter both dates of birth.', 'error'); return; }

  var lp1 = reduceToMaster(sumDigits(dob1.replace(/\D/g, '')));
  var lp2 = reduceToMaster(sumDigits(dob2.replace(/\D/g, '')));

  // Compatibility based on Life Path harmony
  var compatibilityMap = {
    '1-1':75, '1-2':65, '1-3':88, '1-4':55, '1-5':90, '1-6':70, '1-7':80, '1-8':60, '1-9':85,
    '2-2':80, '2-3':75, '2-4':88, '2-5':55, '2-6':92, '2-7':70, '2-8':82, '2-9':65,
    '3-3':78, '3-4':50, '3-5':90, '3-6':85, '3-7':65, '3-8':55, '3-9':93,
    '4-4':72, '4-5':45, '4-6':88, '4-7':75, '4-8':90, '4-9':55,
    '5-5':80, '5-6':50, '5-7':85, '5-8':65, '5-9':88,
    '6-6':85, '6-7':55, '6-8':78, '6-9':90,
    '7-7':82, '7-8':50, '7-9':70,
    '8-8':72, '8-9':55,
    '9-9':85
  };

  var key1 = Math.min(lp1, lp2) + '-' + Math.max(lp1, lp2);
  // Handle master numbers
  var lp1r = (lp1 === 11 || lp1 === 22 || lp1 === 33) ? reduceToMaster(sumDigits(lp1.toString())) : lp1;
  var lp2r = (lp2 === 11 || lp2 === 22 || lp2 === 33) ? reduceToMaster(sumDigits(lp2.toString())) : lp2;
  if (lp1r > 9) lp1r = sumDigits(lp1r.toString());
  if (lp2r > 9) lp2r = sumDigits(lp2r.toString());

  var key = Math.min(lp1r, lp2r) + '-' + Math.max(lp1r, lp2r);
  var score = compatibilityMap[key] || 70;

  // Add bonus for master numbers
  if (lp1 === 11 || lp1 === 22 || lp1 === 33 || lp2 === 11 || lp2 === 22 || lp2 === 33) {
    score = Math.min(score + 5, 98);
  }

  var message = '';
  if (score >= 85) message = 'Excellent Match! You share a deep and harmonious connection. Your energies complement each other beautifully, creating a bond that is both stable and inspiring.';
  else if (score >= 70) message = 'Good Compatibility! You have solid potential for a lasting relationship. With mutual understanding and effort, this bond can grow into something truly beautiful.';
  else if (score >= 55) message = 'Moderate Match. There are differences that need understanding, but these can also bring growth and learning. Communication and patience are key.';
  else message = 'Challenging Pairing. While the connection may require extra effort, some of the greatest love stories are built through overcoming differences. Focus on shared values.';

  document.getElementById('loveResult').innerHTML = '' +
    '<div class="calc-result-box">' +
    '<h3>Compatibility: ' + score + '%</h3>' +
    '<div class="calc-result-item"><div class="num-label">Person 1 Life Path</div><div class="num-value">' + lp1 + '</div></div>' +
    '<div class="calc-result-item"><div class="num-label">Person 2 Life Path</div><div class="num-value">' + lp2 + '</div></div>' +
    '<p>' + message + '</p>' +
    '</div>';
}

// ──────────── DASHA CALCULATOR ────────────
function getDashaHTML() {
  var defaultDateTime = toDateTimeLocalValue(new Date(2004, 3, 28, 7, 40, 0));

  return '' +
    '<div class="form-title">⏳ Dasha Periods</div>' +
    '<div class="form-sub">API: /api/dasha (lat, lng, datetime, year_length)</div>' +
    '<div class="f-row">' +
      '<div class="f-field"><label class="f-label">Latitude (lat)</label><input class="f-input" id="dashaLat" type="number" step="any" value="' + CALC_DEFAULT_LAT + '"></div>' +
      '<div class="f-field"><label class="f-label">Longitude (lng)</label><input class="f-input" id="dashaLng" type="number" step="any" value="' + CALC_DEFAULT_LNG + '"></div>' +
    '</div>' +
    '<div class="f-field"><label class="f-label">Date & Time</label><input class="f-input" id="dashaDatetime" type="datetime-local" value="' + defaultDateTime + '"></div>' +
    getTimezoneSelectHTML('dashaTimezone', CALC_DEFAULT_TIMEZONE) +
    '<div class="f-field"><label class="f-label">Year Length</label><input class="f-input" id="dashaYearLength" type="number" min="1" max="120" value="' + CALC_DEFAULT_YEAR_LENGTH + '"></div>' +
    '<button class="btn-next" onclick="calculateDasha()">Fetch Current Dasha →</button>' +
    '<div id="dashaResult"></div>';
}

async function calculateDasha() {
  var latInput = document.getElementById('dashaLat');
  var lngInput = document.getElementById('dashaLng');
  var datetimeInput = document.getElementById('dashaDatetime');
  var timezoneInput = document.getElementById('dashaTimezone');
  var yearLengthInput = document.getElementById('dashaYearLength');
  var resultEl = document.getElementById('dashaResult');
  if (!latInput || !lngInput || !datetimeInput || !timezoneInput || !yearLengthInput || !resultEl) return;

  var lat = latInput.value.trim();
  var lng = lngInput.value.trim();
  var datetime = toApiDateTime(datetimeInput.value, timezoneInput.value);
  var yearLength = yearLengthInput.value.trim();

  if (!isValidCoordinate(lat, -90, 90)) {
    showToast('Latitude must be between -90 and 90.', 'error');
    return;
  }

  if (!isValidCoordinate(lng, -180, 180)) {
    showToast('Longitude must be between -180 and 180.', 'error');
    return;
  }

  if (!datetime) {
    showToast('Please provide a valid date and time.', 'error');
    return;
  }

  var yearLengthNumber = Number(yearLength);
  if (!Number.isInteger(yearLengthNumber) || yearLengthNumber < 1 || yearLengthNumber > 120) {
    showToast('Year length must be an integer between 1 and 120.', 'error');
    return;
  }

  resultEl.innerHTML = '<div class="form-sub" style="margin-top:12px;">Fetching dasha details...</div>';

  try {
    var report = await callCalculatorApi('/dasha', {
      lat: lat,
      lng: lng,
      datetime: datetime,
      year_length: String(yearLengthNumber)
    });

    resultEl.innerHTML = '' +
      '<div class="calc-result-box">' +
        '<h3>Current Running Dasha</h3>' +
        '<div class="calc-result-item"><div class="num-label">Current Dasha</div><div class="num-value">' + getSafeResultValue(report.current_dasha) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Current Antardasha</div><div class="num-value">' + getSafeResultValue(report.current_antardasha) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Current Pratyantardasha</div><div class="num-value">' + getSafeResultValue(report.current_pratyantardasha) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Start</div><div class="num-value">' + getSafeResultValue(report.start) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">End</div><div class="num-value">' + getSafeResultValue(report.end) + '</div></div>' +
      '</div>';
    showToast('Dasha report generated successfully.', 'success');
  } catch (error) {
    resultEl.innerHTML = '' +
      '<div class="calc-result-box">' +
        '<h3>Unable to Fetch Dasha</h3>' +
        '<p>' + escapeCalcHtml(error.message) + '</p>' +
      '</div>';
    showToast(error.message, 'error');
  }
}

// ──────────── KUNDALI / BIRTH CHART (placeholder) ────────────
// API UPGRADE: Integrate Astro-Seek API or Vedic Rishi API with ASTRO_API_KEY in .env for full chart
function getKundaliHTML() {
  return '' +
    '<div class="form-title">📅 Kundali / Birth Chart</div>' +
    '<div class="form-sub">Generate your Janam Kundali</div>' +
    '<div style="background:var(--offwhite); border:1px solid var(--border); border-radius:16px; padding:32px; text-align:center; margin-top:20px;">' +
    '<div style="font-size:48px; margin-bottom:16px;">🪬</div>' +
    '<h3 style="font-family:Libre Baskerville,serif; font-size:20px; color:var(--red); margin-bottom:10px;">Full Kundali Coming Soon</h3>' +
    '<p style="font-size:13px; color:var(--muted); line-height:1.7; max-width:400px; margin:0 auto 20px;">Kundali generation requires precise astronomical calculations based on your exact birth time, date, and place.</p>' +
    '<p style="font-size:11px; color:var(--muted); line-height:1.6;">In the meantime, book a personal consultation with Arvind Rai Ji for a detailed hand-crafted Kundali analysis.</p>' +
    '<button class="btn-next" style="max-width:300px; margin:20px auto 0;" onclick="closeCalcModal(); scrollToServicesSection();"> Book Kundali Reading</button>' +
    '</div>';
}

// ──────────── PANCHANG TODAY ────────────
function getPanchangHTML() {
  var defaultDateTime = toDateTimeLocalValue(new Date());

  var today = new Date();
  var dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return '' +
    '<div class="form-title">🪐 Panchang Today</div>' +
    '<div class="form-sub">API: /api/panchang (lat, lng, datetime) · ' + dateStr + '</div>' +
    '<div class="f-row">' +
      '<div class="f-field"><label class="f-label">Latitude (lat)</label><input class="f-input" id="panchangLat" type="number" step="any" value="' + CALC_DEFAULT_LAT + '"></div>' +
      '<div class="f-field"><label class="f-label">Longitude (lng)</label><input class="f-input" id="panchangLng" type="number" step="any" value="' + CALC_DEFAULT_LNG + '"></div>' +
    '</div>' +
    '<div class="f-field"><label class="f-label">Date & Time</label><input class="f-input" id="panchangDatetime" type="datetime-local" value="' + defaultDateTime + '"></div>' +
    getTimezoneSelectHTML('panchangTimezone', CALC_DEFAULT_TIMEZONE) +
    '<button class="btn-next" onclick="calculatePanchang()">Fetch Panchang →</button>' +
    '<div id="panchangResult"></div>';
}

async function calculatePanchang() {
  var latInput = document.getElementById('panchangLat');
  var lngInput = document.getElementById('panchangLng');
  var datetimeInput = document.getElementById('panchangDatetime');
  var timezoneInput = document.getElementById('panchangTimezone');
  var resultEl = document.getElementById('panchangResult');
  if (!latInput || !lngInput || !datetimeInput || !timezoneInput || !resultEl) return;

  var lat = latInput.value.trim();
  var lng = lngInput.value.trim();
  var datetime = toApiDateTime(datetimeInput.value, timezoneInput.value);

  if (!isValidCoordinate(lat, -90, 90)) {
    showToast('Latitude must be between -90 and 90.', 'error');
    return;
  }

  if (!isValidCoordinate(lng, -180, 180)) {
    showToast('Longitude must be between -180 and 180.', 'error');
    return;
  }

  if (!datetime) {
    showToast('Please provide a valid date and time.', 'error');
    return;
  }

  resultEl.innerHTML = '<div class="form-sub" style="margin-top:12px;">Fetching panchang details...</div>';

  try {
    var panchang = await callCalculatorApi('/panchang', {
      lat: lat,
      lng: lng,
      datetime: datetime
    });

    resultEl.innerHTML = '' +
      '<div class="calc-result-box">' +
        '<h3>Panchang Details</h3>' +
        '<div class="calc-result-item"><div class="num-label">Day</div><div class="num-value">' + getSafeResultValue(panchang.day) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Nakshatra</div><div class="num-value">' + getSafeResultValue(panchang.nakshatra) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Tithi</div><div class="num-value">' + getSafeResultValue(panchang.tithi) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Yoga</div><div class="num-value">' + getSafeResultValue(panchang.yoga) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Karana</div><div class="num-value">' + getSafeResultValue(panchang.karana) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Sunrise</div><div class="num-value">' + getSafeResultValue(panchang.sunrise) + '</div></div>' +
        '<div class="calc-result-item"><div class="num-label">Sunset</div><div class="num-value">' + getSafeResultValue(panchang.sunset) + '</div></div>' +
      '</div>';
    showToast('Panchang fetched successfully.', 'success');
  } catch (error) {
    resultEl.innerHTML = '' +
      '<div class="calc-result-box">' +
        '<h3>Unable to Fetch Panchang</h3>' +
        '<p>' + escapeCalcHtml(error.message) + '</p>' +
      '</div>';
    showToast(error.message, 'error');
  }
}

async function renderPanchangWidget() {
  var today = new Date();
  var dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  var titleEl = document.getElementById('panchangTitle');
  var subEl = document.getElementById('panchangSub');
  var dataEl = document.getElementById('panchangData');
  var muhurtaEl = document.getElementById('panchangMuhurta');

  if (titleEl) titleEl.textContent = '📅 Today\'s Panchang — ' + dateStr;
  if (subEl) subEl.textContent = 'Auspicious timings and lunar details for today';

  try {
    var datetime = toApiDateTime(toDateTimeLocalValue(today), CALC_DEFAULT_TIMEZONE);
    var panchang = await callCalculatorApi('/panchang', {
      lat: CALC_DEFAULT_LAT,
      lng: CALC_DEFAULT_LNG,
      datetime: datetime
    });

    if (dataEl) {
      dataEl.innerHTML = '' +
        '<div class="f-field"><label class="f-label">Tithi</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + getSafeResultValue(panchang.tithi) + '</div></div>' +
        '<div class="f-field"><label class="f-label">Nakshatra</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + getSafeResultValue(panchang.nakshatra) + '</div></div>' +
        '<div class="f-field"><label class="f-label">Yoga</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + getSafeResultValue(panchang.yoga) + '</div></div>' +
        '<div class="f-field"><label class="f-label">Karana</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + getSafeResultValue(panchang.karana) + '</div></div>';
    }

    if (muhurtaEl) {
      muhurtaEl.textContent = 'Sunrise: ' + getSafeResultValue(panchang.sunrise) + ' · Sunset: ' + getSafeResultValue(panchang.sunset);
    }
  } catch (error) {
    var fallback = getApproximatePanchang(today);

    if (dataEl) {
      dataEl.innerHTML = '' +
        '<div class="f-field"><label class="f-label">Tithi</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + fallback.tithi + '</div></div>' +
        '<div class="f-field"><label class="f-label">Nakshatra</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + fallback.nakshatra + '</div></div>' +
        '<div class="f-field"><label class="f-label">Yoga</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + fallback.yoga + '</div></div>' +
        '<div class="f-field"><label class="f-label">Rahu Kaal</label><div class="f-input" style="background:var(--offwhite); color:var(--text); display:flex; align-items:center;">' + fallback.rahuKaal + '</div></div>';
    }

    if (muhurtaEl) {
      muhurtaEl.textContent = fallback.muhurta;
    }
  }
}

function getApproximatePanchang(date) {
  // Approximate Panchang calculations based on day-of-year
  var dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

  var tithis = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'];
  var nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var yogas = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  var karans = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
  var days = ['Ravivaar (Sunday)', 'Somvaar (Monday)', 'Mangalvaar (Tuesday)', 'Budhvaar (Wednesday)', 'Guruvaar (Thursday)', 'Shukravaar (Friday)', 'Shanivaar (Saturday)'];

  // Rahu Kaal by day of week (approximate)
  var rahuKaals = ['4:30 PM – 6:00 PM', '7:30 AM – 9:00 AM', '3:00 PM – 4:30 PM', '12:00 PM – 1:30 PM', '1:30 PM – 3:00 PM', '10:30 AM – 12:00 PM', '9:00 AM – 10:30 AM'];
  var muhurtas = [
    '6:30 AM – 8:00 AM · 2:00 PM – 3:30 PM',
    '7:30 AM – 9:00 AM · 3:00 PM – 4:30 PM',
    '6:00 AM – 7:30 AM · 1:30 PM – 3:00 PM',
    '7:00 AM – 8:30 AM · 2:30 PM – 4:00 PM',
    '6:30 AM – 8:00 AM · 3:30 PM – 5:00 PM',
    '7:00 AM – 8:30 AM · 2:00 PM – 3:30 PM',
    '6:00 AM – 7:30 AM · 4:00 PM – 5:30 PM'
  ];

  return {
    tithi: tithis[dayOfYear % tithis.length],
    nakshatra: nakshatras[dayOfYear % nakshatras.length],
    yoga: yogas[dayOfYear % yogas.length],
    karan: karans[dayOfYear % karans.length],
    day: days[date.getDay()],
    rahuKaal: rahuKaals[date.getDay()],
    muhurta: muhurtas[date.getDay()]
  };
}
