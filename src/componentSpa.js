export const spa = () => ({

    isLoading: false,
    href: null,
    controller: null,
    listenerController: null,

    init() {
        this.onClick = e => {
            const a = e.target.closest("a[href]");
            if (!a || a.origin !== location.origin || a.target || e.metaKey
                || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
            e.preventDefault();
            this._go(a.href, true);
        };

        this.onPop = () => {
            this._go(location.href, false);
        };

        // Use an AbortController tied to the component lifetime so
        // we have a single place to remove both listeners on destroy.
        this.listenerController = new AbortController();
        const { signal } = this.listenerController;

        addEventListener("click", this.onClick, { capture: true, signal });
        addEventListener("popstate", this.onPop, { signal });
    },

    destroy() {
        // Removes both DOM listeners in one shot - no need to keep
        // references to the handler functions for removeEventListener.
        this.listenerController?.abort();
        this._abortNavigation();
    },

    shouldShowSpinner() {
        return this.isLoading
            && this.href?.includes(this.$el.closest("a").getAttribute("href"));
    },

    shouldShowRegularIcon() {
        return !this.shouldShowSpinner(); 
    },

    async _go(url, push) {
        this._abortNavigation();

        const controller = this.controller = new AbortController();
        this.href = url;
        this.isLoading = true;

        const doSwap = async () => {
            try {
                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: { "X-Requested-With": "fetch" },
                });

                if (!res.ok) throw new Error(`Navigation failed: ${res.status} ${res.statusText}`);

                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, "text/html");
                const incoming = doc.body.innerHTML;

                document.title = doc.title;
                push && history.pushState({ url }, "", url);

                Alpine.destroyTree(document.body);
                document.body.innerHTML = incoming;
                Alpine.initTree(document.body);

                this._scrollToHashOrTop(url);

            } catch (e) {
                if (e.name === "AbortError") return;
                this.$dispatch("spa-error", { url, error: e });
                location.assign(url);
            } finally {
                if (this.controller === controller) this._clearAll();
            }
        };

        // Use View Transitions when supported, plain swap otherwise
        if (document.startViewTransition) {
            document.startViewTransition(() => doSwap());
        } else {
            await doSwap();
        }
    },

    _scrollToHashOrTop(url) {
        const hash = new URL(url, location.origin).hash;

        if (!hash) {
            scrollTo(0, 0);
            return;
        }

        const id = decodeURIComponent(hash.slice(1));
        const target =
            document.getElementById(id) ??
            document.querySelector(`[name="${CSS.escape(id)}"]`);

        target ? target.scrollIntoView({ block: "start" }) : scrollTo(0, 0);
    },

    _abortNavigation() {
        this.controller?.abort();
        this.controller = null;
    },

    _clearAll() {
        this.controller = null;
        this.href = null;
        this.isLoading = false;
    },
})