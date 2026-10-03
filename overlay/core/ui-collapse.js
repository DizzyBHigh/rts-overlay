(() => {
  const storageKey = title => 'rts-ui-collapse:' + title.trim().toLowerCase().replace(/\s+/g, '-');

  const readState = key => {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? true : value === 'open';
    } catch {
      return true;
    }
  };

  const writeState = (key, open) => {
    try {
      window.localStorage.setItem(key, open ? 'open' : 'closed');
    } catch {
      // Local storage may be unavailable; collapsing still works for this session.
    }
  };

  const enhance = section => {
    if (!section || section.dataset.rtsCollapseReady === 'true') return;
    const title = Array.from(section.children).find(child => child.classList?.contains('rts-ui-title'));
    if (!title) return;

    const text = title.textContent.trim();
    const key = storageKey(text);
    const open = readState(key);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rts-ui-collapse-title';
    button.textContent = text;
    button.setAttribute('aria-expanded', String(open));
    title.replaceWith(button);
    section.classList.toggle('is-collapsed', !open);

    button.addEventListener('click', event => {
      event.stopPropagation();
      const collapsed = section.classList.toggle('is-collapsed');
      const nextOpen = !collapsed;
      button.setAttribute('aria-expanded', String(nextOpen));
      writeState(key, nextOpen);
    });

    section.dataset.rtsCollapseReady = 'true';
  };

  const enhanceAll = root => {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('.rts-ui-section').forEach(enhance);
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches?.('.rts-ui-section')) enhance(node);
      enhanceAll(node);
    }));
  });

  const start = () => {
    enhanceAll(document);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
