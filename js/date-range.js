/* Stay-date picker. The existing booking fields and submission contract stay unchanged. */
(() => {
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (key) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return null;
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return toKey(date) === key ? date : null;
  };
  const today = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };
  const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const addDays = (d, amount) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + amount);
  const addMonths = (d, amount) => new Date(d.getFullYear(), d.getMonth() + amount, 1);
  const shiftMonth = (d, amount) => {
    const month = addMonths(d, amount);
    return new Date(month.getFullYear(), month.getMonth(), Math.min(d.getDate(), new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()));
  };
  const sameDay = (a, b) => Boolean(a && b && toKey(a) === toKey(b));
  const formatDate = (d) => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  const fullDate = (d) => d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatMonth = (d) => d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  // Calendar days, rather than elapsed hours, keep the count correct across daylight saving time.
  const nights = (start, end) => Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
  const nightLabel = (start, end) => `${nights(start, end)} ${nights(start, end) === 1 ? 'night' : 'nights'}`;
  let nextId = 0;

  function init(root) {
    const checkinBtn = root.querySelector('[data-role="checkin"]');
    const checkoutBtn = root.querySelector('[data-role="checkout"]');
    const checkinInput = root.querySelector('input[name="checkin"]');
    const checkoutInput = root.querySelector('input[name="checkout"]');
    const checkinValue = root.querySelector('[data-display="checkin"]');
    const checkoutValue = root.querySelector('[data-display="checkout"]');
    const panel = root.querySelector('[data-panel]');
    const nightsEl = root.querySelector('[data-nights]');
    if (!checkinBtn || !checkoutBtn || !checkinInput || !checkoutInput || !checkinValue || !checkoutValue || !panel || !nightsEl) return;

    const id = `stay-dates-${++nextId}`;
    let checkin = fromKey(checkinInput.value);
    let checkout = fromKey(checkoutInput.value);
    if (checkin && checkin < today()) checkin = null;
    if (!checkin || (checkout && checkout <= checkin)) checkout = null;
    const initialCheckin = checkin;
    const initialCheckout = checkout;
    let selecting = 'checkin';
    let view = monthStart(checkin || today());
    let focused = checkin || today();
    let hover = null;
    let open = false;
    let opener = checkinBtn;
    let monthCount = root.clientWidth >= 560 ? 2 : 1;
    panel.setAttribute('aria-describedby', `${id}-help`);

    const announce = (message) => {
      const status = panel.querySelector('[data-status]');
      if (status) status.textContent = message;
    };

    function syncFields() {
      checkinInput.value = checkin ? toKey(checkin) : '';
      checkoutInput.value = checkout ? toKey(checkout) : '';
      checkinValue.textContent = checkin ? formatDate(checkin) : 'Add date';
      checkoutValue.textContent = checkout ? formatDate(checkout) : 'Add date';
      checkinBtn.classList.toggle('is-filled', Boolean(checkin));
      checkoutBtn.classList.toggle('is-filled', Boolean(checkout));
      nightsEl.hidden = !(checkin && checkout);
      nightsEl.textContent = checkin && checkout ? nightLabel(checkin, checkout) : '';
      [checkinBtn, checkoutBtn].forEach((button) => {
        const active = open && button.dataset.role === selecting;
        button.setAttribute('aria-expanded', String(active));
        button.classList.toggle('is-active', active);
      });
      panel.setAttribute('aria-label', selecting === 'checkout' ? 'Choose check-out date' : 'Choose check-in date');
      panel.querySelectorAll('[data-select]').forEach((button) => {
        const active = button.dataset.select === selecting;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const arrival = panel.querySelector('[data-summary="checkin"]');
      const departure = panel.querySelector('[data-summary="checkout"]');
      if (arrival) arrival.textContent = checkin ? formatDate(checkin) : 'Add date';
      if (departure) departure.textContent = checkout ? formatDate(checkout) : 'Add date';
      const hint = panel.querySelector('[data-hint]');
      if (hint) hint.textContent = selecting === 'checkout' ? 'Choose your check-out date' : 'Choose your check-in date';
      const clear = panel.querySelector('[data-clear]');
      if (clear) clear.disabled = !checkin;
    }

    function paintDays() {
      const preview = selecting === 'checkout' && !checkout && checkin && hover > checkin ? hover : null;
      const end = checkout || preview;
      panel.querySelectorAll('[data-day]').forEach((button) => {
        const day = fromKey(button.dataset.day);
        const isStart = sameDay(day, checkin);
        const isEnd = sameDay(day, end);
        const inRange = Boolean(checkin && end && day >= checkin && day <= end);
        button.classList.toggle('is-start', isStart);
        button.classList.toggle('is-end', isEnd);
        button.classList.toggle('is-range-start', isStart && Boolean(end));
        button.classList.toggle('is-range-end', isEnd && Boolean(checkin));
        button.classList.toggle('is-in-range', inRange);
        button.classList.toggle('is-preview', Boolean(preview && inRange));
        button.setAttribute('aria-pressed', String(isStart || sameDay(day, checkout)));
        button.setAttribute('aria-label', `${fullDate(day)}${isStart ? ', check-in' : sameDay(day, checkout) ? ', check-out' : ''}`);
        button.tabIndex = !button.disabled && sameDay(day, focused) ? 0 : -1;
      });
      const count = panel.querySelector('[data-preview-nights]');
      if (count) {
        count.hidden = !(checkin && end);
        count.textContent = checkin && end ? nightLabel(checkin, end) : '';
      }
    }

    function renderMonth(month, index) {
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const leading = month.getDay();
      const length = new Date(year, monthIndex + 1, 0).getDate();
      const rows = [];
      for (let row = 0; row < Math.ceil((leading + length) / 7); row += 1) {
        const cells = [];
        for (let column = 0; column < 7; column += 1) {
          const number = row * 7 + column - leading + 1;
          if (number < 1 || number > length) {
            cells.push('<td class="date-range__blank"></td>');
            continue;
          }
          const day = new Date(year, monthIndex, number);
          const current = sameDay(day, today());
          cells.push(`<td><button type="button" class="date-range__day${current ? ' is-today' : ''}" data-day="${toKey(day)}" tabindex="-1" aria-label="${fullDate(day)}"${day < today() ? ' disabled' : ''}${current ? ' aria-current="date"' : ''}>${number}</button></td>`);
        }
        rows.push(`<tr>${cells.join('')}</tr>`);
      }
      return `<section class="date-range__month" aria-labelledby="${id}-month-${index}">
        <h4 class="date-range__month-title" id="${id}-month-${index}">${formatMonth(month)}</h4>
        <table class="date-range__grid" role="grid" aria-labelledby="${id}-month-${index}">
          <thead><tr>${WEEKDAYS.map((day, i) => `<th scope="col"><abbr title="${WEEKDAY_NAMES[i]}">${day}</abbr></th>`).join('')}</tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </section>`;
    }

    function render() {
      const minView = monthStart(today());
      if (view < minView) view = minView;
      if (focused < view || focused >= addMonths(view, monthCount)) focused = view < today() ? today() : view;
      panel.style.setProperty('--date-months', monthCount);
      panel.innerHTML = `
        <div class="date-range__heading">
          <div><span class="date-range__eyebrow">Your stay</span><p class="date-range__title">Choose your dates</p></div>
          <button type="button" class="date-range__close" data-close aria-label="Close date picker"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
        </div>
        <div class="date-range__summary">
          <button type="button" class="date-range__summary-date" data-select="checkin"><span class="date-range__summary-label"><span>01</span> Check-in</span><strong data-summary="checkin"></strong></button>
          <span class="date-range__summary-arrow" aria-hidden="true">&rarr;</span>
          <button type="button" class="date-range__summary-date" data-select="checkout"><span class="date-range__summary-label"><span>02</span> Check-out</span><strong data-summary="checkout"></strong></button>
        </div>
        <div class="date-range__board">
          <div class="date-range__nav">
            <button type="button" class="date-range__nav-btn" data-nav="-1" aria-label="Previous month"${view <= minView ? ' disabled' : ''}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
            <span class="date-range__hint" data-hint></span>
            <button type="button" class="date-range__nav-btn" data-nav="1" aria-label="Next month"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
          </div>
          <div class="date-range__months">${Array.from({ length: monthCount }, (_, index) => renderMonth(addMonths(view, index), index)).join('')}</div>
        </div>
        <div class="date-range__footer"><button type="button" class="date-range__text-btn" data-today>Today's month</button><span class="date-range__night-count" data-preview-nights hidden></span><button type="button" class="date-range__text-btn" data-clear>Clear dates</button></div>
        <p class="date-range__sr-only" id="${id}-help">Use arrow keys to move between dates, Page Up or Page Down to change months, and Enter to select. Home and End move to the start and end of a week. Escape closes the calendar.</p>
        <p class="date-range__sr-only" role="status" aria-live="polite" aria-atomic="true" data-status></p>`;
      syncFields();
      paintDays();
    }

    function focusDay(day) {
      focused = day < today() ? today() : day;
      if (focused < view || focused >= addMonths(view, monthCount)) {
        view = monthStart(focused);
        render();
      }
      paintDays();
      const button = panel.querySelector(`[data-day="${toKey(focused)}"]`);
      if (button) button.focus();
    }

    function close(restoreFocus = false) {
      open = false;
      hover = null;
      panel.hidden = true;
      syncFields();
      if (restoreFocus) opener.focus();
    }

    function show(role, trigger) {
      selecting = role === 'checkout' && checkin ? 'checkout' : 'checkin';
      opener = trigger || (selecting === 'checkout' ? checkoutBtn : checkinBtn);
      focused = selecting === 'checkout' ? checkout || addDays(checkin, 1) : checkin || today();
      if (focused < today()) focused = today();
      view = monthStart(focused);
      monthCount = root.clientWidth >= 560 ? 2 : 1;
      hover = null;
      open = true;
      panel.hidden = false;
      render();
      // Bring the complete picker into view before moving keyboard focus to a day.
      panel.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      focusDay(focused);
    }

    function pick(day) {
      if (day < today()) return;
      hover = null;
      if (selecting === 'checkin' || !checkin || day <= checkin) {
        checkin = day;
        checkout = null;
        selecting = 'checkout';
        syncFields();
        focusDay(addDays(day, 1));
        announce(`Check-in ${fullDate(day)}. Choose a check-out date.`);
      } else {
        checkout = day;
        syncFields();
        paintDays();
        opener = checkoutBtn;
        close(true);
      }
    }

    panel.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      if (button.hasAttribute('data-close')) return close(true);
      if (button.dataset.select) return show(button.dataset.select);
      if (button.dataset.day) return pick(fromKey(button.dataset.day));
      if (button.dataset.nav) {
        const delta = Number(button.dataset.nav);
        view = addMonths(view, delta);
        focused = shiftMonth(focused, delta);
        hover = null;
        render();
        const nextButton = panel.querySelector(`[data-nav="${delta}"]`);
        if (nextButton && !nextButton.disabled) nextButton.focus({ preventScroll: true });
        else focusDay(focused);
        announce(formatMonth(view));
      } else if (button.hasAttribute('data-today')) {
        view = monthStart(today());
        focused = today();
        render();
        focusDay(focused);
      } else if (button.hasAttribute('data-clear')) {
        checkin = null;
        checkout = null;
        hover = null;
        selecting = 'checkin';
        syncFields();
        focusDay(focused);
        announce('Dates cleared. Choose a check-in date.');
      }
    });

    panel.addEventListener('keydown', (event) => {
      const button = event.target.closest('[data-day]');
      if (!button) return;
      const day = fromKey(button.dataset.day);
      let destination;
      switch (event.key) {
        case 'ArrowLeft': destination = addDays(day, -1); break;
        case 'ArrowRight': destination = addDays(day, 1); break;
        case 'ArrowUp': destination = addDays(day, -7); break;
        case 'ArrowDown': destination = addDays(day, 7); break;
        case 'Home': destination = addDays(day, -day.getDay()); break;
        case 'End': destination = addDays(day, 6 - day.getDay()); break;
        case 'PageUp': destination = shiftMonth(day, event.shiftKey ? -12 : -1); break;
        case 'PageDown': destination = shiftMonth(day, event.shiftKey ? 12 : 1); break;
        default: return;
      }
      event.preventDefault();
      focusDay(destination);
    });

    panel.addEventListener('focusin', (event) => {
      const button = event.target.closest('[data-day]');
      if (!button) return;
      focused = fromKey(button.dataset.day);
      hover = selecting === 'checkout' && checkin && !checkout && focused > checkin ? focused : null;
      paintDays();
    });
    panel.addEventListener('pointerover', (event) => {
      if (event.pointerType !== 'mouse' || selecting !== 'checkout' || !checkin || checkout) return;
      const button = event.target.closest('[data-day]');
      const day = button && !button.disabled ? fromKey(button.dataset.day) : null;
      hover = day && day > checkin ? day : null;
      paintDays();
    });
    panel.addEventListener('pointerleave', () => {
      hover = null;
      paintDays();
    });

    [checkinBtn, checkoutBtn].forEach((button) => {
      button.addEventListener('click', () => {
        const role = button === checkoutBtn && checkin ? 'checkout' : 'checkin';
        if (open && selecting === role) close();
        else show(role, button);
      });
    });
    document.addEventListener('pointerdown', (event) => {
      if (open && !root.contains(event.target)) close();
    });
    document.addEventListener('focusin', (event) => {
      if (open && !root.contains(event.target)) close();
    });
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }
    });
    const form = root.closest('form');
    if (form) form.addEventListener('reset', (event) => {
      // Hidden input values also change their native defaults; restore the original dates explicitly.
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        checkin = initialCheckin;
        checkout = initialCheckout;
        close();
      });
    });
    if ('ResizeObserver' in window) new ResizeObserver(() => {
      const count = root.clientWidth >= 560 ? 2 : 1;
      if (count === monthCount) return;
      monthCount = count;
      if (!open) return;
      const active = document.activeElement;
      const hadFocus = panel.contains(active);
      const control = active && (active.hasAttribute('data-nav') ? `[data-nav="${active.dataset.nav}"]` : active.hasAttribute('data-close') ? '[data-close]' : null);
      view = monthStart(focused);
      render();
      if (hadFocus) {
        const target = control && panel.querySelector(control);
        if (target && !target.disabled) target.focus({ preventScroll: true });
        else focusDay(focused);
      }
    }).observe(root);

    syncFields();
  }

  const start = () => document.querySelectorAll('[data-date-range]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
