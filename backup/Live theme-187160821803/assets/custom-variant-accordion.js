if (!customElements.get('custom-variant-accordion')) {
  customElements.define('custom-variant-accordion', class extends HTMLElement {
    connectedCallback() {
      this.currentVariant = this.dataset.variant;
      this.onVariant = event => {
        const id = event.detail?.variant?.id || (event.target.matches?.('form[action*="/cart/add"] [name="id"]') ? event.target.value : null);
        if (id) this.update(String(id));
      };
      this.onHistory = () => this.update(new URL(location.href).searchParams.get('variant') || this.dataset.variant);
      this.onBlockSelect = event => {
        const block = this.querySelector(`[data-block-id="${CSS.escape(event.detail.blockId)}"]`);
        if (block) { block.hidden = false; block.open = true; }
      };
      this.onToggle = event => {
        if (!this.hasAttribute('single-open') || !event.target.open) return;
        this.querySelectorAll('details[open]').forEach(item => { if (item !== event.target) item.open = false; });
      };
      ['variant:change', 'product:variant-change', 'change'].forEach(name => document.addEventListener(name, this.onVariant));
      window.addEventListener('popstate', this.onHistory);
      this.addEventListener('shopify:block:select', this.onBlockSelect);
      this.addEventListener('toggle', this.onToggle, true);
      const input = document.querySelector('form[action*="/cart/add"] [name="id"]');
      if (input?.value) this.update(input.value);
    }

    disconnectedCallback() {
      ['variant:change', 'product:variant-change', 'change'].forEach(name => document.removeEventListener(name, this.onVariant));
      window.removeEventListener('popstate', this.onHistory);
      this.removeEventListener('shopify:block:select', this.onBlockSelect);
      this.removeEventListener('toggle', this.onToggle, true);
      this.request?.abort();
    }

    async update(id) {
      if (!id || id === this.currentVariant) return;
      this.currentVariant = id;
      this.request?.abort();
      const request = this.request = new AbortController();
      const url = new URL(this.dataset.productUrl || location.pathname, location.origin);
      const currentUrl = new URL(location.href);
      ['view', 'preview_theme_id'].forEach(key => {
        if (currentUrl.searchParams.has(key)) url.searchParams.set(key, currentUrl.searchParams.get(key));
      });
      url.searchParams.set('variant', id);
      url.searchParams.set('section_id', this.dataset.sectionId);
      this.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(url, { signal: request.signal });
        if (!response.ok) throw new Error(`Accordion response ${response.status}`);
        const page = new DOMParser().parseFromString(await response.text(), 'text/html');
        const next = page.querySelector('custom-variant-accordion');
        if (!next || next.dataset.sectionId !== this.dataset.sectionId) throw new Error('Accordion section missing');
        if (request.signal.aborted) return;
        const states = new Map([...this.querySelectorAll('details')].map(item => [item.dataset.blockId, item.open]));
        next.querySelectorAll('details').forEach(item => {
          if (states.has(item.dataset.blockId)) item.open = states.get(item.dataset.blockId);
        });
        this.querySelector('[data-accordion-body]').replaceWith(next.querySelector('[data-accordion-body]'));
        this.dataset.variant = id;
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.currentVariant = this.dataset.variant;
          console.error('Could not update variant accordion', error);
        }
      } finally {
        if (this.request === request) this.removeAttribute('aria-busy');
      }
    }
  });
}
