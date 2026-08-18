/* Renders the two-month availability grid on booking.html from
   availability.json. Purely informational - no cell is interactive or
   focusable, so the grid carries no ARIA grid/gridcell roles and Tab
   skips straight over it into the form below.

   The whole visual scheme is one signal: open days are the only
   high-contrast thing in the grid. Booked, past, and closed (Sunday/
   Monday - not a working day) all recede identically - a client
   scanning for a gap shouldn't be able to tell "someone else has this
   day" from "this day already happened" from "we're not open then,"
   they all just read as "not this one." Don't add a marker to any of
   them, or a busy month starts reading as a wall instead of a
   scannable gap.

   That contrast is invisible to a screen reader, though, so every day
   cell carries a hidden ".sr-only" span (see style.css) spelling out
   its weekday, date, and - for booked/closed days - why it's
   unavailable. Do NOT use aria-label for this: a bare <span> computes
   to ARIA role "generic", and the spec marks generic's accessible-name
   computation "prohibited" - Chrome (and others) silently drop
   aria-label/aria-labelledby on it, so the label is invisible to every
   screen reader no matter how correct the string is. Nested real text
   isn't a "name", so it isn't subject to that prohibition; it just
   gets read as part of the cell's content. The visible digit is
   aria-hidden so it isn't announced a second time next to the hidden
   text that already repeats it. */

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('availability-calendar');
  if (!container) return;

  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var FULL_WEEKDAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Local-time date key, matching scripts/sync-availability.mjs exactly
  // (Y-M-D, zero-padded). Never use toISOString() here - that converts
  // to UTC and can shift the date by one, which is exactly the off-by-one
  // this calendar has to not have.
  function dateKey(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function buildMonth(year, month, todayKey, booked) {
    var monthEl = document.createElement('div');
    monthEl.className = 'calendar-month';

    var title = document.createElement('h3');
    title.className = 'calendar-month-title';
    title.textContent = MONTH_NAMES[month] + ' ' + year;
    monthEl.appendChild(title);

    // Decorative - hidden from the accessibility tree rather than read
    // out as a meaningless "Su Mo Tu We..." list disconnected from the
    // dates below it. Each day cell carries its own weekday name (see
    // the .sr-only span built below) instead, so the context isn't lost.
    var weekdaysEl = document.createElement('div');
    weekdaysEl.className = 'calendar-weekdays';
    weekdaysEl.setAttribute('aria-hidden', 'true');
    WEEKDAYS.forEach(function (w) {
      var span = document.createElement('span');
      span.textContent = w;
      weekdaysEl.appendChild(span);
    });
    monthEl.appendChild(weekdaysEl);

    var daysEl = document.createElement('div');
    daysEl.className = 'calendar-days';

    var firstWeekday = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    // Leading blanks so day 1 lands in its correct weekday column.
    for (var i = 0; i < firstWeekday; i++) {
      var empty = document.createElement('span');
      empty.className = 'day-empty';
      empty.setAttribute('aria-hidden', 'true');
      daysEl.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var key = dateKey(year, month, d);

      // getDay(): 0 = Sunday, 1 = Monday. Studio doesn't work either,
      // so these are closed regardless of what the calendar feed says -
      // checked ahead of `booked` so a stray Sun/Mon calendar event
      // (there shouldn't be one) can't override it.
      var dow = new Date(year, month, d).getDay();

      var cell = document.createElement('span');

      // The visible digit - hidden from the accessibility tree so it
      // isn't announced a second time next to the .sr-only text below,
      // which already repeats the date.
      var digit = document.createElement('span');
      digit.setAttribute('aria-hidden', 'true');
      digit.textContent = String(d);
      cell.appendChild(digit);

      var status = null; // only booked/closed get a reason suffix
      if (key < todayKey) {
        cell.className = 'day-past';
      } else if (dow === 0 || dow === 1) {
        cell.className = 'day-closed';
        status = 'closed';
      } else if (booked.has(key)) {
        cell.className = 'day-booked';
        status = 'booked';
      } else {
        cell.className = 'day-open';
      }

      var srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = FULL_WEEKDAYS[dow] + ', ' + MONTH_NAMES[month] + ' ' + d +
        (status ? ', ' + status : '');
      cell.appendChild(srText);

      daysEl.appendChild(cell);
    }

    monthEl.appendChild(daysEl);
    return monthEl;
  }

  // no-store: this updates twice a day, and a stale cached response
  // could show a day as open that's actually already booked.
  fetch('/availability.json', { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('availability.json: ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var booked = new Set(Array.isArray(data.booked) ? data.booked : []);
      var today = new Date();
      var year = today.getFullYear();
      var month = today.getMonth();
      var todayKey = dateKey(year, month, today.getDate());

      var nextMonth = month + 1;
      var nextYear = year;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }

      var monthsWrap = document.createElement('div');
      monthsWrap.className = 'calendar-months';
      monthsWrap.appendChild(buildMonth(year, month, todayKey, booked));
      monthsWrap.appendChild(buildMonth(nextYear, nextMonth, todayKey, booked));

      container.appendChild(monthsWrap);
      container.hidden = false;
    })
    .catch(function () {
      // No availability.json (not generated yet, or the fetch failed) -
      // leave the section heading and intro sentence visible and the
      // grid hidden. Never show an empty grid.
    });
});
