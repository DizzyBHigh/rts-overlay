(() => {
  const enhance = section => {
    if (!section || section.dataset.rtsCollapseReady === 'true') return;
    const title = section.querySelector(':scope > .rts-ui-title');
    if (!title) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rts-ui-collapse-title';
    button.textContent = title.textContent;
    button.setAttribute('aria-expanded', 'true');
    title.replaceWith(button);

    button.addEventListener('click', () => {
      const collapsed = section.classList.toggle('is-collapsed');
      button.setAttribute('aria-expanded', String(!collapsed));
    });

    section.dataset.rtsCollapseReady = 'true';
  };

  const enhanceAll = root => root.querySelectorAll?.('.rts-ui-section').forEach(enhance);

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
