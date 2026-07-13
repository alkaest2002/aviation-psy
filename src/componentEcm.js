export const ecm = () => ({

    // Easter egg: when true, the correct option of every item is highlighted.
    revealed: false,

    // Long-press bookkeeping (per active pointer).
    _timer: null,
    _startX: 0,
    _startY: 0,

    // Hold duration and how far the finger/cursor may drift before we
    // treat the gesture as a scroll/drag and cancel the press.
    HOLD_MS: 3000,
    MOVE_TOLERANCE: 12,

    isCorrect(item, opt) {
        return this.revealed && item.key === opt;
    },

    // Bound onto each item container. Pointer events cover mouse + touch.
    itemPress: {
        ["@pointerdown"](e) {
            // Only react to primary button / touch / pen.
            if (e.button && e.button !== 0) return;
            this._startX = e.clientX;
            this._startY = e.clientY;
            clearTimeout(this._timer);
            this._timer = setTimeout(() => { this.revealed = true; }, this.HOLD_MS);
        },
        ["@pointermove"](e) {
            const dx = Math.abs(e.clientX - this._startX);
            const dy = Math.abs(e.clientY - this._startY);
            if (dx > this.MOVE_TOLERANCE || dy > this.MOVE_TOLERANCE) {
                clearTimeout(this._timer);
            }
        },
        ["@pointerup"]() { clearTimeout(this._timer); },
        ["@pointercancel"]() { clearTimeout(this._timer); },
        ["@pointerleave"]() { clearTimeout(this._timer); },
        // Suppress the mobile long-press callout / context menu so the
        // gesture feels like a deliberate hold rather than a text selection.
        ["@contextmenu.prevent"]() {},
    },
})
