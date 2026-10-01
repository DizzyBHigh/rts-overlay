(() => {
  const UI = RTS.core.ui;
  const CATALOG_URL = 'https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv';
  const cacheKey = 'rts-google-font-catalog';
  let catalogPromise;

  UI.fontPicker = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-font-picker';
    const search = UI.textbox({ placeholder: 'Search Google Fonts...' });
    const select = UI.el('select', { className: 'rts-ui-input rts-ui-select' });
    const status = UI.el('small', { className: 'rts-ui-description', text: 'Loading Google Fonts catalog...' });
    const preview = document.createElement('div', {});

    preview.className = 'rts-ui-font-preview';
    preview.textContent = options.value || 'Road to Somewhere';
    wrap.append(search, select, status, preview);

    let families = [];
    let selected = options.value || '';

    const render = filter => {
      const needle = String(filter || '').toLowerCase();
      select.replaceChildren();
      families.filter(name => name.toLowerCase().includes(needle)).slice(0, 500).forEach(name => {
        select.append(UI.el('option', { value: name, text: name }));
      });
      select.value = selected;
      if (!select.value && select.options.length) select.selectedIndex = 0;
      update(select.value);
    };

    const update = value => {
      selected = value || '';
      preview.textContent = selected || 'Road to Somewhere';
      preview.style.fontFamily = selected ? "'" + selected.replace(/'/g, '') + "', sans-serif" : '';
      if (selected) loadFont(selected);
      options.onChange?.(selected, wrap);
    };

    search.addEventListener('input', () => render(search.value));
    select.addEventListener('change', () => update(select.value));

    catalog().then(items => {
      families = items;
      status.textContent = families.length + ' Google Fonts available';
      render('');
    }).catch(error => {
      status.textContent = 'Google Fonts catalog unavailable';
      console.error(error);
    });

    return wrap;
  };

  function catalog() {
    if (catalogPromise) return catalogPromise;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (Array.isArray(cached) && cached.length) catalogPromise = Promise.resolve(cached);
    } catch (_) {}
    if (!catalogPromise) {
      catalogPromise = fetch(CATALOG_URL)
        .then(response => response.ok ? response.text() : Promise.reject(new Error('Font catalog request failed')))
        .then(text => {
          const items = [...new Set(
            text.split('\n').slice(1)
              .map(line => line.trim())
              .filter(Boolean)
              .map(line => line.split(',')[0].replace(/^"|"$/g, ''))
              .filter(name => name && name !== 'Family')
          )].sort((a, b) => a.localeCompare(b));
          localStorage.setItem(cacheKey, JSON.stringify(items));
          return items;
        });
    }
    return catalogPromise;
  }

  function loadFont(family) {
    const id = 'rts-font-' + family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(family).replace(/%20/g, '+') + '&display=swap';
    document.head.append(link);
  }
})();
