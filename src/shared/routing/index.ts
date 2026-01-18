import type { RouteRecordRaw } from 'vue-router'
import { MainPage, CardsPage, MemorizationPage, SpellingPage, SelectionPage } from '@/pages'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main',
    component: MainPage,
    meta: {
      title: 'Главная'
    }
  },
  {
    path: '/cards',
    name: 'cards',
    component: CardsPage,
    meta: {
      title: 'Карточки'
    }
  },
  {
    path: '/memorization',
    name: 'memorization',
    component: MemorizationPage,
    meta: {
      title: 'Заучивание'
    }
  },
  {
    path: '/spelling',
    name: 'spelling',
    component: SpellingPage,
    meta: {
      title: 'Написание'
    }
  },
  {
    path: '/selection',
    name: 'selection',
    component: SelectionPage,
    meta: {
      title: 'Подбор'
    }
  }
]

export default routes
