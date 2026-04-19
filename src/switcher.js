export const switcher = () => ({
    isLoading: true,

    init() {
        this.isLoading = false;
    },

    destroy() {
        this.isLoading = false;
    },

    navigate(url) {
        window.location.href = url;
    },

    btnLink: {
        ["@click.prevent"]() {
            if (this.isLoading) return;
            this.isLoading = true;
            const link = this.$el.getAttribute('href');
            link && this.navigate(link);
        }
    }
})  