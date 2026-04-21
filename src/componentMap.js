export const map = () => ({

    get isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    },

    mapUrl(query) {
        const q = encodeURIComponent(query)
        return this.isIOS
            ? `https://maps.apple.com/?q=${q}`
            : `https://maps.google.com/?q=${q}`
    },

    mapLabel() {
        return this.isIOS ? 'apri in apple maps' : 'apri in google maps'
    }

})