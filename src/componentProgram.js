export const program = () => ({

    get day1() {
        return this.$store.programStore["day1"];
    },

    get day2Part1() {
        return this.$store.programStore["day2-first-part"];
    },

    get day2Part2() {
        return this.$store.programStore["day2-second-part"];
    }
})