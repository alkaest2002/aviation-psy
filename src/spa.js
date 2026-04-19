export const spa = () => ({
    
    init() {
        this.onClick = e => {
            const a = e.target.closest('a[href]');
            if (!a || a.origin !== location.origin || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
            e.preventDefault();
            this.go(a.href, true);
        };
        this.onPop = () => this.go(location.href, false);
        addEventListener('click', this.onClick, true);
        addEventListener('popstate', this.onPop);
    },

    destroy() {
        removeEventListener('click', this.onClick, true);
        removeEventListener('popstate', this.onPop);
    },

    async go(url, push) {
        console.log(`Navigating to ${url} (push: ${push})`);
        const html = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } }).then(r => r.text());
        const doc = new DOMParser().parseFromString(html, 'text/html');
        document.title = doc.title;
        document.body.replaceWith(doc.body);
        if (push) history.pushState(0, '', url);
    },
})