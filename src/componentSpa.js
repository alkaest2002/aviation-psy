export const spa = () => ({

    init() {
        this.onClick = e => {
            const a = e.target.closest('a[href]');
            if (!a || a.origin !== location.origin || a.target || e.metaKey
                || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
            e.preventDefault();
            this.href = a.href;
            this.go(a.href, true);
        };
        this.onPop = () => this.go(location.href, false);
        addEventListener('click', this.onClick, true);
        addEventListener('popstate', this.onPop);
    },

    destroy() {
        removeEventListener('click', this.onClick, true);
        removeEventListener('popstate', this.onPop);
        this.clearAll();
    },

    isLoading: false,
    href: null,
    controller: null,

    clearAll() {
        this.controller?.abort();
        this.controller = null;
        this.href = null;
        this.isLoading = false;
    },

    async go(url, push) {
        this.isLoading = true;
        this.controller?.abort();
        const controller = this.controller = new AbortController();
        try {
            const res = await fetch(url, {
                signal: controller.signal,
                headers: { 'X-Requested-With': 'fetch' }
            });
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            document.title = doc.title;
            if (push) history.pushState(0, '', url);
            document.body.replaceWith(doc.body);
            scrollTo(0, 0);
            Alpine.initTree(document.body);
        } catch (e) {
            if (e.name !== 'AbortError') throw e;
        } finally {
            if (this.controller === controller) this.clearAll();
        }
    },
})