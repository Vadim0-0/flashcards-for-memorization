
import { createPinia, type Pinia } from 'pinia';

let piniaInstance: Pinia | null = null;

export function createStore(): Pinia {
	if (!piniaInstance) {
		piniaInstance = createPinia();
	}
	return piniaInstance;
}

export function getStore(): Pinia {
	return createStore();
}