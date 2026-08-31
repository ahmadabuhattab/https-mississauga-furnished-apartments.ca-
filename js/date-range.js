/* Check-in / check-out range calendar */
(() => {
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const pad = (n) => String(n).padStart(2, '0');
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (key) => {
    const [y, m, day] = key.split('-').map(Number);
    return new Date(y, m - 1, day);
  };
  const startOfToday = () => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };
  const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const sameDay = (a, b) => a && b && toKey(a) === toKey(b);
  const nice = (key) =>
    fromKey(key).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
  const nightCount = (a, b) => Math.round((b - a) / 86400000);
  const eventInside = (e, el) => {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    return path.includes(el) || (e.target && el.contains(e.target));
  };

  function monthGrid(year, month) {
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first.getDay(); i += 1) cells.push(null);
    for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
    return cells;
  }

  function init(root) {
    const checkinBtn = root.querySelector('[data-role="checkin"]');
    const checkoutBtn = root.querySelector('[data-role="checkout"]');
    const checkinInput = root.querySelector('input[name="checkin"]');
    const checkoutInput = root.querySelector('input[name="checkout"]');
    const checkinValue = root.querySelector('[data-display="checkin"]');
    const checkoutValue = root.querySelector('[data-display="checkout"]');
    const panel = root.querySelector('[data-panel]');
    const nightsEl = root.querySelector('[data-nights]');
    if (!checkinBtn || !checkoutBtn || !checkinInput || !checkoutInput || !panel || !nightsEl) return;

    let checkin = null;
    let checkout = null;
    let selecting = 'checkin';
    let view = new Date(startOfToday().getFullYear(), startOfToday().getMonth(), 1);
    let hover = null;
    let open = false;
    let ignoreCloseUntil = 0;

    const rangeEnd = () => checkout || (checkin && hover && hover > checkin ? hover : null);

    const bumpIgnore = () => {
      ignoreCloseUntil = Date.now() + 700;
    };

    const setOpen = (next, role) => {
      open = next;
      panel.hidden = !next;
      if (role) selecting = role;
      checkinBtn.setAttribute('aria-expanded', next && selecting === 'checkin' ? 'true' : 'false');
      checkoutBtn.setAttribute('aria-expanded', next && selecting === 'checkout' ? 'true' : 'false');
      checkinBtn.classList.toggle('is-active', next && selecting === 'checkin');
      checkoutBtn.classList.toggle('is-active', next && selecting === 'checkout');
      if (next) {
        if (checkin && selecting === 'checkout') {
          view = new Date(checkin.getFullYear(), checkin.getMonth(), 1);
        }
        render();
      }
    };

    const syncMode = () => {
      const mode = panel.querySelector('[data-mode]');
      if (!mode) return;
      const isOut = selecting === 'checkout';
      mode.textContent = isOut ? 'Check-out' : 'Check-in';
      mode.classList.toggle('is-checkin', !isOut);
      mode.classList.toggle('is-checkout', isOut);
      panel.setAttribute('aria-label', isOut ? 'Choose check-out date' : 'Choose check-in date');
    };

    const syncFields = () => {
      checkinInput.value = checkin ? toKey(checkin) : '';
      checkoutInput.value = checkout ? toKey(checkout) : '';
      checkinValue.textContent = checkin ? nice(toKey(checkin)) : 'Add date';
      checkoutValue.textContent = checkout ? nice(toKey(checkout)) : 'Add date';
      checkinBtn.classList.toggle('is-filled', Boolean(checkin));
      checkoutBtn.classList.toggle('is-filled', Boolean(checkout));
      if (checkin && checkout) {
        const n = nightCount(checkin, checkout);
        nightsEl.hidden = false;
        nightsEl.textContent = n === 1 ? '1 night' : `${n} nights`;
      } else {
        nightsEl.hidden = true;
        nightsEl.textContent = '';
      }
      const hint = panel.querySelector('[data-hint]');
      if (hint) {
        hint.textContent = !checkin ? 'Select check-in' : checkout ? nightsEl.textContent : 'Select check-out';
      }
      const clearBtn = panel.querySelector('[data-clear]');
      if (clearBtn) clearBtn.hidden = !checkin;
      syncMode();
    };

    const paintDays = () => {
      const end = rangeEnd();
      const today = startOfToday();
      panel.querySelectorAll('[data-day]').forEach((btn) => {
        const day = fromKey(btn.getAttribute('data-day'));
        const isStart = sameDay(day, checkin);
        const isEnd = sameDay(day, checkout) || (!checkout && end && sameDay(day, end));
        const inRange = checkin && end && day > checkin && day < end;
        btn.classList.toggle('is-today', sameDay(day, today));
        btn.classList.toggle('is-start', isStart);
        btn.classList.toggle('is-end', isEnd);
        btn.classList.toggle('is-range-start', isStart && Boolean(end));
        btn.classList.toggle('is-range-end', isEnd && Boolean(checkin) && !isStart);
        btn.classList.toggle('is-in-range', inRange || (isStart && Boolean(end)) || (isEnd && Boolean(checkin)));
        btn.setAttribute('aria-pressed', isStart || isEnd ? 'true' : 'false');
      });
    };

    const pick = (day) => {
      if (day < startOfToday()) return;
      if (selecting === 'checkin' || !checkin || day <= checkin) {
        checkin = day;
        checkout = null;
        hover = null;
        selecting = 'checkout';
        checkinBtn.classList.remove('is-active');
        checkoutBtn.classList.add('is-active');
        checkinBtn.setAttribute('aria-expanded', 'false');
        checkoutBtn.setAttribute('aria-expanded', 'true');
      } else {
        checkout = day;
        hover = null;
        selecting = 'checkin';
        setOpen(false);
      }
      syncFields();
      paintDays();
    };

    const clear = () => {
      checkin = null;
      checkout = null;
      hover = null;
      selecting = 'checkin';
      syncFields();
      paintDays();
      setOpen(true, 'checkin');
      checkinBtn.focus();
    };

    function renderMonth(year, month) {
      const today = startOfToday();
      const days = monthGrid(year, month)
        .map((day) => {
          if (!day) return '<span class="date-range__blank" aria-hidden="true"></span>';
          const disabled = day < today;
          const label = day.toLocaleDateString('en-CA', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });
          return `<button type="button" class="date-range__day" data-day="${toKey(day)}" ${disabled ? 'disabled' : ''} aria-label="${label}">${day.getDate()}</button>`;
        })
        .join('');
      return `<div class="date-range__month">
        <h4 class="date-range__month-title">${MONTHS[month]} ${year}</h4>
        <div class="date-range__weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join('')}</div>
        <div class="date-range__grid">${days}</div>
      </div>`;
    }

    function render() {
      const next = addMonths(view, 1);
      const minView = new Date(startOfToday().getFullYear(), startOfToday().getMonth(), 1);
      const prevDisabled = view <= minView ? 'disabled' : '';
      const isOut = selecting === 'checkout';
      panel.innerHTML = `
        <p class="date-range__mode ${isOut ? 'is-checkout' : 'is-checkin'}" data-mode>${isOut ? 'Check-out' : 'Check-in'}</p>
        <div class="date-range__board">
          <button type="button" class="date-range__nav-btn date-range__nav-btn--prev" data-nav="-1" aria-label="Previous month" ${prevDisabled}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button type="button" class="date-range__nav-btn date-range__nav-btn--next" data-nav="1" aria-label="Next month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div class="date-range__months">
            ${renderMonth(view.getFullYear(), view.getMonth())}
            ${renderMonth(next.getFullYear(), next.getMonth())}
          </div>
        </div>
        <div class="date-range__footer">
          <span class="date-range__hint" data-hint></span>
          <button type="button" class="date-range__clear" data-clear hidden>Clear dates</button>
        </div>`;
      syncFields();
      paintDays();
    }

    const goMonth = (delta) => {
      bumpIgnore();
      view = addMonths(view, delta);
      render();
    };

    panel.addEventListener('pointerup', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (!nav || nav.disabled) return;
      e.preventDefault();
      e.stopPropagation();
      goMonth(Number(nav.getAttribute('data-nav')));
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        e.preventDefault();
        return;
      }
      if (e.target.closest('[data-clear]')) {
        bumpIgnore();
        clear();
        return;
      }
      const dayBtn = e.target.closest('[data-day]');
      if (dayBtn && !dayBtn.disabled) pick(fromKey(dayBtn.getAttribute('data-day')));
    });

    panel.addEventListener('pointerover', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const dayBtn = e.target.closest('[data-day]');
      if (!dayBtn || dayBtn.disabled || !checkin || checkout) return;
      const day = fromKey(dayBtn.getAttribute('data-day'));
      if (!(day > checkin)) return;
      if (hover && sameDay(hover, day)) return;
      hover = day;
      paintDays();
    });

    checkinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bumpIgnore();
      setOpen(!(open && selecting === 'checkin'), 'checkin');
    });
    checkoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bumpIgnore();
      const role = checkin ? 'checkout' : 'checkin';
      setOpen(!(open && selecting === role), role);
    });

    document.addEventListener('click', (e) => {
      if (!open) return;
      if (Date.now() < ignoreCloseUntil) return;
      if (eventInside(e, root)) return;
      setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        (selecting === 'checkout' ? checkoutBtn : checkinBtn).focus();
      }
    });

    syncFields();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-date-range]').forEach(init);
  });
})();
