<template>
  <div id="app">

    <!-- Информационное окно: Загрузка -->
    <transition name="loader-fade">
      <Loader 
        v-if="isLoaderVisible"/>
    </transition>

    <!-- Уведомление -->
    <transition name="notifications-slide">
      <Notifications 
        v-if="isNotificationVisible"
        :theme-name="notificationThemeName"/>
    </transition>

    <!-- Кнопка для переключения темы -->
    <ThemeToggle />

    <!-- Кнопка для открытия меню -->
    <MenuOpen :is-open="isMenuOpen" @open-menu="isMenuOpen = true" />

    <!-- Меню -->
    <Transition name="menu-slide">
      <Menu 
        v-if="isMenuOpen" 
        @close-menu="isMenuOpen = false"
        @theme-selected="handleThemeSelected"
      />
    </Transition>

    <!-- Затемнение фона при открытии меню -->
    <Transition name="menu-overlay-fade">
      <div 
        v-if="isMenuOpen"
        class="menu-overlay"
        @click="isMenuOpen = false"
      ></div>
    </Transition>

    <router-view v-slot="{ Component, route }">
      <transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ThemeToggle, MenuOpen, Notifications } from '@/features'
import { Menu } from '@/widgets'
import { Loader } from '@/shared/ui'
import type { Theme } from '@/shared/types/theme'
import type { Language } from '@/shared/types/card'
import { getDataUrl, useLanguage, useThemeName } from '@/shared/lib'

const route = useRoute()

// Управление языком
const LANGUAGE_STORAGE_KEY = 'app-language'

// Функция для получения языка по умолчанию
const getDefaultLanguage = (): Language => {
  // Сначала проверяем localStorage
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
  if (savedLanguage && (savedLanguage === 'russian' || savedLanguage === 'english')) {
    return savedLanguage
  }
  
  // Если нет сохраненного языка, определяем по языку браузера
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('en')) {
    return 'english'
  }
  
  // По умолчанию русский
  return 'russian'
}

// Функция для обновления атрибута lang в HTML
const updateHtmlLang = (lang: Language) => {
  const htmlLang = lang === 'russian' ? 'ru' : 'en'
  document.documentElement.setAttribute('lang', htmlLang)
}

// Устанавливаем язык при инициализации приложения
const initialLanguage = getDefaultLanguage()
updateHtmlLang(initialLanguage)

// Сохраняем язык по умолчанию в localStorage при первой загрузке, если его там нет
if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, initialLanguage)
}

const isMenuOpen = ref(false)
const selectedThemeId = ref<string>('all')
const themes = ref<Theme[]>([])
const { currentLang } = useLanguage()
const { getThemeName } = useThemeName()

// Функция для получения перевода "Все темы"
const getAllThemesText = computed(() => {
  return currentLang.value === 'ru' ? 'Все темы' : 'All themes'
})

const isNotificationVisible = ref(false)
const notificationThemeName = ref<string>('')
const isLoaderVisible = ref(false)

// Функция для показа загрузчика
const showLoader = () => {
  isLoaderVisible.value = true
  
  // Автоматически скрыть loader через 5 секунд, если он не скроется раньше
  const timeoutId = setTimeout(() => {
    isLoaderVisible.value = false
  }, 5000)
  
  // Сохраняем ID для возможности отмены (если нужно)
  ;(window as any).__loaderTimeoutId = timeoutId
}

// Функция для скрытия загрузчика
const hideLoader = () => {
  isLoaderVisible.value = false
}

// Функция для показа уведомления
const showNotification = (themeName: string) => {
  notificationThemeName.value = themeName
  isNotificationVisible.value = true
  
  // Автоматически скрываем уведомление через 2 секунды
  setTimeout(() => {
    isNotificationVisible.value = false
  }, 2000)
}

// Функция для обработки завершения загрузки карточек с показом уведомления
const handleCardsLoaded = (themeId: string) => {
  setTimeout(() => {
    hideLoader()
    
    const allThemesText = getAllThemesText.value
    const theme = themes.value.find(t => t.id === themeId) || { id: 'all', name: allThemesText }
    const themeName = themeId === 'all' ? allThemesText : getThemeName(theme.name)
    
    // Показываем уведомление с задержкой 300ms после скрытия loader
    setTimeout(() => {
      showNotification(themeName)
    }, 300)
  }, 300)
}

const handleThemeSelected = (themeId: string) => {
  selectedThemeId.value = themeId
}

// Отслеживаем изменение темы и показываем loader если мы на странице с карточками
watch(() => selectedThemeId.value, (newThemeId, oldThemeId) => {
  if (oldThemeId !== undefined && newThemeId !== oldThemeId && route.path !== '/') {
    showLoader()
  }
})

// Отслеживаем переходы на страницы с карточками
watch(() => route.path, (newPath, oldPath) => {
  if (oldPath !== undefined && newPath !== '/' && oldPath !== newPath) {
    showLoader()
  }
})

// Предоставляем выбранную тему и список тем для дочерних компонентов
provide('selectedThemeId', selectedThemeId)
provide('themes', themes)
provide('showLoader', showLoader)
provide('hideLoader', hideLoader)
provide('showNotification', showNotification)
provide('handleCardsLoaded', handleCardsLoaded)

const loadThemes = async () => {
  try {
    const response = await fetch(getDataUrl('/data/words/themes.json'))
    const data = await response.json() as Theme[]
    themes.value = data
  } catch (error) {
    console.error('Ошибка предзагрузки тем:', error)
  }
}

onMounted(() => {
  loadThemes()
})
</script>

<style lang="scss" scoped>

// Переходы для роутера
// .fade-enter-active,
// .fade-leave-active {
  // transition: opacity 0.3s ease;
// }
// 
// .fade-enter-from,
// .fade-leave-to {
  // opacity: 0;
// }
// 
// .slide-enter-active,
// .slide-leave-active {
  // transition: transform 0.3s ease;
// }
// 
// .slide-enter-from {
  // transform: translateX(100%);
// }
// 
// .slide-leave-to {
  // transform: translateX(-100%);
// }
// 
// .slide-back-enter-active,
// .slide-back-leave-active {
  // transition: transform 0.3s ease;
// }
// 
// .slide-back-enter-from {
  // transform: translateX(-100%);
// }
// 
// .slide-back-leave-to {
  // transform: translateX(100%);
// }

// Анимация меню
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.3s ease;
  opacity: 1;
}

.menu-slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.menu-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

// Анимация overlay
.menu-overlay-fade-enter-active,
.menu-overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-overlay-fade-enter-from,
.menu-overlay-fade-leave-to {
  opacity: 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

// Анимация loader
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

// Анимация notifications
.notifications-slide-enter-active,
.notifications-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.notifications-slide-enter-from {
  transform: translate(-50%, -100%);
  opacity: 0;
}

.notifications-slide-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
</style>
