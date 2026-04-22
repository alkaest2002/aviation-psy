export const spa = () => ({

    isLoading: false,
    href: null,
    controller: null,

    init() {
        this.onClick = e => {
            const a = e.target.closest("a[href]");
            if (!a || a.origin !== location.origin || a.target || e.metaKey
                || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
            this.href = a.href ?? "/";
            e.preventDefault();
            this.go(a.href, true);
        };
        this.onPop = () => this.go(location.href, false);
        addEventListener("click", this.onClick, true);
        addEventListener("popstate", this.onPop);
    },

    destroy() {
        removeEventListener("click", this.onClick, true);
        removeEventListener("popstate", this.onPop);
        this.clearAll();
    },

    async go(url, push) {
        this.isLoading = true;
        this.controller?.abort();
        const controller = this.controller = new AbortController();
        try {
            const res = await fetch(url, {
                signal: controller.signal,
                headers: { "X-Requested-With": "fetch" }
            });
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            document.title = doc.title;
            if (push) history.pushState(0, "", url);
            document.body.innerHTML = doc.body.innerHTML;
            Alpine.initTree(document.body);
            this.scrollToHashOrTop(url);
        } catch (e) {
            if (e.name !== "AbortError") throw e;
        } finally {
            if (this.controller === controller) this.clearAll();
        }
    },

    scrollToHashOrTop(url) {
        const hash = new URL(url, location.origin).hash;

        if (!hash) {
            scrollTo(0, 0);
            return;
        }

        // decode in case of encoded IDs in URL
        const id = decodeURIComponent(hash.slice(1));
        const targetById = document.getElementById(id);

        // Fallback to name anchors for legacy markup
        const targetByName = !targetById
            ? document.querySelector(`[name="${CSS.escape(id)}"]`)
            : null;

        const target = targetById || targetByName;

        if (target) {
            target.scrollIntoView({ block: "start" });
        } else {
            scrollTo(0, 0);
        }
    },

    shouldShowSpinner() {
        return this.isLoading
            && this.href?.includes(this.$el.closest("a").getAttribute("href"));
    },

    shouldShowRegularIcon() {
        return !this.shouldShowSpinner();
    },

    clearAll() {
        this.controller = null;
        this.href = null;
        this.isLoading = false;
    },
})