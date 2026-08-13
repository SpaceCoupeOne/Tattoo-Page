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

   That contrast is invisible to a screen reader, though, so every
   booked or closed cell (and only those - open/past days rely on
   their plain visible number as the accessible name) carries an
   aria-label spelling out why. Those labels are the only thing
   telling a non-visual user a day isn't available - don't remove
   them. */

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('availability-calendar');
  if (!container) return;

  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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

    // Decorative - the day cells below are the only thing a screen
    // reader needs, so the weekday initials are hidden from it rather
    // than read out as a meaningless "Su Mo Tu We..." list.
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
      var cell = document.createElement('span');
      cell.textContent = String(d);

      // getDay(): 0 = Sunday, 1 = Monday. Studio doesn't work either,
      // so these are closed regardless of what the calendar feed says -
      // checked ahead of `booked` so a stray Sun/Mon calendar event
      // (there shouldn't be one) can't override it.
      var dow = new Date(year, month, d).getDay();

      if (key < todayKey) {
        cell.className = 'day-past';
      } else if (dow === 0 || dow === 1) {
        cell.className = 'day-closed';
        cell.setAttribute('aria-label', MONTH_NAMES[month] + ' ' + d + ', closed');
      } else if (booked.has(key)) {
        cell.className = 'day-booked';
        cell.setAttribute('aria-label', MONTH_NAMES[month] + ' ' + d + ', booked');
      } else {
        cell.className = 'day-open';
      }

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
