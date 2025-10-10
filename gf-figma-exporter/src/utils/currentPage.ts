export const currentPageSize = {
    width: 0,
    height: 0,
    get() {
        return { width: this.width, height: this.height };
    },
    set({ width, height }: { width: number; height: number }) {
        this.width = width;
        this.height = height;
    }
};