(() => {
  const tagName = 'variant-visibility-scope';

  if (customElements.get(tagName)) return;
  const styleId = 'variant-visibility-scope-style';

  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = 'variant-visibility-scope{display:block}';
    document.head.append(style);
  }

  const instances = new Set();
  const itemSelector = '[data-variant-visibility-item]';

  const parseIds = value => String(value || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  const runScripts = root => {
    root.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(({ name, value }) => {
        newScript.setAttribute(name, value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  };

  const loadDeferredContent = element => {
    if (element.dataset.variantVisibilityLoaded === 'true') return;

    const mount = element.querySelector('[data-variant-visibility-mount]');
    const template = element.querySelector('[data-variant-visibility-template]');

    if (!mount || !template) return;

    mount.append(template.content.cloneNode(true));
    runScripts(mount);
    element.dataset.variantVisibilityLoaded = 'true';
  };

  const selectedVariantId = event => {
    const eventVariant = event?.detail?.variant?.id;
    if (eventVariant) return String(eventVariant);

    const variantInput = document.querySelector('form[action*="/cart/add"] [name="id"]');
    return variantInput?.value ? String(variantInput.value) : '';
  };

  const updateAll = event => {
    const variantId = selectedVariantId(event);
    instances.forEach(instance => instance.update(variantId));
  };

  class VariantVisibilityScope extends HTMLElement {
    connectedCallback() {
      instances.add(this);
      this.update(this.getAttribute('current-variant-id') || selectedVariantId());
    }

    disconnectedCallback() {
      instances.delete(this);
    }

    get items() {
      const items = Array.from(this.querySelectorAll(itemSelector));
      if (this.matches(itemSelector)) items.unshift(this);
      return items;
    }

    update(variantId) {
      const id = String(variantId || this.getAttribute('current-variant-id') || '');

      this.items.forEach(item => {
        const allowedIds = parseIds(item.dataset.variantVisibilityIds);
        const isVisible = allowedIds.length === 0 || allowedIds.includes(id);

        item.hidden = !isVisible;

        if (isVisible) {
          loadDeferredContent(item);
        }
      });

      this.updateGroups();
    }

    updateGroups() {
      this.querySelectorAll('[data-variant-visibility-group]').forEach(group => {
        const items = Array.from(group.children).filter(item => item.matches(itemSelector));
        const visibleCount = items.filter(item => !item.hidden).length;

        group.style.setProperty('--variant-visible-count', visibleCount);
        group.style.setProperty('--certificate-step-count', Math.max(visibleCount, 1));
        group.hidden = items.length > 0 && visibleCount === 0;
      });
    }
  }

  customElements.define(tagName, VariantVisibilityScope);

  document.addEventListener('variant:change', updateAll);
  document.addEventListener('product:variant-change', updateAll);
  document.addEventListener('change', event => {
    if (event.target.matches('form[action*="/cart/add"] [name="id"]')) {
      updateAll(event);
    }
  });
  document.addEventListener('shopify:section:load', updateAll);
})();