import MessageBus from '../MessageBus/MessageBus';

export const progress = {
    current: 0,
    descendants: 0,
    update(name: string) {
        const progressSegment = this.descendants > 0 ? 100 / this.descendants : 100;
        this.current += progressSegment;
        MessageBus.postMessage('export-progress', {
            name,
            progress: Math.min(this.current, 100),
        });
    },
    setDescendants(descendants: number) {
        this.descendants = descendants;
    },
};
