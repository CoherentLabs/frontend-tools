class MessageBus {
    private listeners: Map<string, ((data: unknown) => void)[]> = new Map();
    private initialized = false;

    private initializeListener() {
        if (this.initialized) return;
        
        onmessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;
            const callbacks = this.listeners.get(msg.type);
            if (callbacks) {
                callbacks.forEach(callback => callback(msg.data));
            }
        };
        
        this.initialized = true;
    }

    on(message: string, callback: (data: unknown) => void) {
        this.initializeListener();
        
        if (!this.listeners.has(message)) {
            this.listeners.set(message, []);
        }

        this.listeners.get(message)!.push(callback);
    }

    postMessage(message: string, data: unknown) {
        parent.postMessage({pluginMessage:{ type: message, data }}, '*');
    }
}

export default new MessageBus();