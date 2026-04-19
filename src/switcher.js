export const switcher = () => ({
    isLoading: true,

    init() {
        this.isLoading = false;
    },

    destroy() {
        this.isLoading = false;
    },

    btnLink: {
        ["@click.prevent"]() {
            if (this.isLoading) return;
            this.isLoading = true;
            const link = this.$el.getAttribute('href');
            if (link) {
                window.location.href = link;
            }
        }
    }
})  