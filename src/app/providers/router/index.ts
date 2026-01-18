import routes from '@/shared/routing'
import { createRouter, createWebHashHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
	linkActiveClass: 'active',
})

// Simple navigation history to toggle slide/slide-back transitions
const navHistory: Array<{ path: string }> = []
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
	const index = navHistory.findIndex((r) => r.path === to.path)
	if (index !== -1) {
		// back
		navHistory.splice(index + 1)
		;(to.meta as { transition?: string }).transition = 'slide-back'
	} else {
		// forward
		navHistory.push({ path: to.path })
		;(to.meta as { transition?: string }).transition = 'slide'
	}
	next()
})


