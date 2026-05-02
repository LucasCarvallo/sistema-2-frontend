import { defineStore } from 'pinia';

const DEFAULT_LOADING_MESSAGE = 'Cargando...';

export const useUiStore = defineStore('ui', {
    state: () => ({
        loadingCount: 0,
        loadingMessage: DEFAULT_LOADING_MESSAGE,
    }),

    getters: {
        isLoading: (state) => state.loadingCount > 0,
    },

    actions: {
        beginLoading(message = DEFAULT_LOADING_MESSAGE) {
            this.loadingCount += 1;
            this.loadingMessage = message || DEFAULT_LOADING_MESSAGE;
        },

        endLoading() {
            if (this.loadingCount > 0) {
                this.loadingCount -= 1;
            }
            if (this.loadingCount === 0) {
                this.loadingMessage = DEFAULT_LOADING_MESSAGE;
            }
        },
    },
});
