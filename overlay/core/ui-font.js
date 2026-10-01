(() => {
  const UI = RTS.core.ui;
  const CATALOG_URL = 'https://raw.githubusercontent.com/fontsource/google-font-metadata/main/data/api-response.json';
  const cacheKey = 'rts-google-font-catalog-v4';
  let catalogPromise;

  UI.fontPicker = options => {
    const wrap = document.createElement('div');
    wrap.className = 'rts-ui-font-picker';

    const search = UI.textbox({ placeholder: 'Search Google Fonts...' });
    const results = document.createElement('div');
    results.className = 'rts-ui-font-results';
    const variant = UI.dropdown({ value: options.variant || '400' });
    const status = document.createElement('small');
    status.className = 'rts-ui-description';
    const preview = document.createElement('div');
    preview.className = 'rts-ui-font-preview';

    wrap.append(search, results, UI.field('Variant', variant), status, preview);

    let families = [];
    let selectedFamily = options.value || '';
    let selectedVariant = options.variant || '400';

    const renderResults = filter => {
      const needle = String(filter || '').trim().toLowerCase();
      results.replaceChildren();
      const matches = families
        .filter(item => item.family.toLowerCase().includes(needle))
        .slice(0, 100);

      matches.forEach(item => {
        const button = UI.button(item.family, {
          onClick: () => selectFamily(item.family)
        });
        button.classList.add('font-result');
        button.style.fontFamily = "'" + item.family.replace(/'/g, '') + "', sans-serif";
        if (item.family === selectedFamily) button.classList.add('selected');
        results.append(button);
      });

      status.textContent = needle
        ? matches.length + ' matching fonts'
        : families.length + ' Google Fonts available';
    };

    const selectFamily = name => {
      selectedFamily = name;
      selectedVariant = '400';
      renderVariants();
      renderResults(search.value);
    };

    const renderVariants = () => {
      const item = families.find(entry => entry.family === selectedFamily);
      variant.replaceChildren();
      (item?.variants || ['400']).forEach(value => {
        variant.append(UI.el('option', {
          value,
          text: variantLabel(value)
        }));
      });
      variant.value = selectedVariant;
      if (!variant.value && variant.options.length) {
        variant.selectedIndex = 0;
        selectedVariant = variant.value;
      }
      updatePreview();
    };

    const updatePreview = () => {
      selectedVariant = variant.value || '400';
      const parsed = parseVariant(selectedVariant);
      preview.textContent = selectedFamily || 'Road to Somewhere';
      preview.style.fontFamily = selectedFamily
        ? "'" + selectedFamily.replace(/'/g, '') + "', sans-serif"
        : '';
      preview.style.fontWeight = parsed.weight;
      preview.style.fontStyle = parsed.style;
      if (selectedFamily) loadFont(selectedFamily, selectedVariant);
      options.onChange?.(selectedFamily, selectedVariant, wrap);
      renderResults(search.value);
    };

    search.addEventListener('input', () => renderResults(search.value));

    variant.addEventListener('change', updatePreview);

    catalog().then(items => {
      families = items;
      if (selectedFamily && !families.some(item => item.family === selectedFamily))
        selectedFamily = '';
      renderResults(search.value);
      if (selectedFamily) {
        renderVariants();
      } else if (families.length) {
        selectFamily(families[0].family);
      }
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
        .then(response => response.text())
        .then(text => JSON.parse(text.replace(/^\)\]\}',?\s*/, '')))
        .then(data => (Array.isArray(data) ? data : (data.familyMetadataList || []))
          .filter(item => item.family && Array.isArray(item.variants))
          .map(item => ({
            family: item.family,
            variants: [...new Set(item.variants)].sort(compareVariants)
          }))
          .sort((a, b) => a.family.localeCompare(b.family)))
        .then(items => {
          localStorage.setItem(cacheKey, JSON.stringify(items));
          return items;
        });
    }
    return catalogPromise;
  }

  function variantLabel(value) {
    const italic = String(value).endsWith('i');
    const weight = parseInt(String(value).replace('i', ''), 10);
    const names = {
      100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular',
      500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold',
      900: 'Black'
    };
    return (names[weight] || value) + ' (' + weight + ')' + (italic ? ' Italic' : '');
  }

  function parseVariant(value) {
    const italic = String(value).endsWith('i');
    const weight = parseInt(String(value).replace('i', ''), 10) || 400;
    return { weight, style: italic ? 'italic' : 'normal' };
  }

  function compareVariants(a, b) {
    const pa = parseVariant(a), pb = parseVariant(b);
    return pa.weight - pb.weight || pa.style.localeCompare(pb.style);
  }

  function loadFont(family, variant) {
    const parsed = parseVariant(variant);
    const id = 'rts-font-' + family.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + variant;
    if (document.getElementById(id)) return;
    const style = parsed.style === 'italic'
      ? 'ital,wght@1,' + parsed.weight
      : 'wght@' + parsed.weight;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' +
      encodeURIComponent(family).replace(/%20/g, '+') + ':' + style +
      '&display=swap';
    document.head.append(link);
  }
})();
