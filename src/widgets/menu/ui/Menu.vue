<template>
    <div class="menu" @click.stop>
        <button class="menu__close-btn" @click="$emit('close-menu')">
            <span></span>
            <span></span>
        </button>
        <div class="menu__language">
          <button 
            class="menu__language-btn"
            :class="{ 'active': currentLanguage === 'russian' }"
            @click="handleLanguageChange('russian')"
          >
            RU
          </button>
          <button 
            class="menu__language-btn"
            :class="{ 'active': currentLanguage === 'english' }"
            @click="handleLanguageChange('english')"
          >
            EN
          </button>
        </div>
        <div class="menu__content">
            <div class="menu__content-block">
                <div class="menu__content-block__title">
                    <h2>
                        {{ t('themes') }}
                    </h2>
                </div>
                <div class="menu__content-block__list">
                    <div class="block-list">
                        <button 
                            v-for="theme in themes"
                            :key="theme.id"
                            class="block-list__btn"
                            :class="{ 'active': selectedThemeId === theme.id }"
                            @click="handleThemeSelect(theme.id)"
                        >
                            {{ getThemeName(theme.name) }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="menu__content-block">
                <div class="menu__content-block__title">
                    <h2>
                        {{ t('exerciseType') }}
                    </h2>
                </div>
                <div class="menu__content-block__list">
                    <div class="block-list">
                        <button 
                            v-for="exercise in exercisesWithMain"
                            :key="exercise.id"
                            class="block-list__btn"
                            :class="{ 'active': currentRoute === exercise.route }"
                            @click="handleExerciseClick(exercise.route)"
                        >
                            <img 
                                v-if="exercise.image && !exercise.svg" 
                                :src="exercise.image" 
                                :alt="exercise.displayName"
                                class="block-list__btn__image"
                            />
                            <span 
                                v-if="exercise.svg"
                                class="block-list__btn__svg"
                                v-html="exercise.svg"
                            ></span>
                            <span>{{ exercise.displayName }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Theme } from '@/shared/types/theme'
import type { Language } from '@/shared/types/card'
import { exercises as exercisesData } from '@/shared/config'
import { getDataUrl, useExerciseName, useThemeName, useTranslations } from '@/shared/lib'

const emit = defineEmits<{
  'close-menu': []
  'theme-selected': [themeId: string]
}>()

const route = useRoute()
const router = useRouter()

// Пробуем взять список тем из App.vue через provide/inject,
// чтобы они были предзагружены ещё до открытия меню
const injectedThemes = inject<Ref<Theme[]> | null>('themes', null)
const themes = injectedThemes ?? ref<Theme[]>([])
const exercises = ref(exercisesData)
// Используем selectedThemeId из App.vue через inject
const selectedThemeId = inject<Ref<string>>('selectedThemeId', ref('all'))
const { getExerciseName } = useExerciseName()
const { getThemeName } = useThemeName()
const { t } = useTranslations(() => import('./menu.json'))

const currentRoute = computed(() => route.path)

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
  
  // По умолчанию
  return 'russian'
}

const currentLanguage = ref<Language>(getDefaultLanguage())

// Функция для обновления атрибута lang в HTML
const updateHtmlLang = (lang: Language) => {
  const htmlLang = lang === 'russian' ? 'ru' : 'en'
  document.documentElement.setAttribute('lang', htmlLang)
}

// Сохраняем язык по умолчанию в localStorage при первой загрузке, если его там нет
if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage.value)
}

// Устанавливаем начальный язык в HTML
updateHtmlLang(currentLanguage.value)

// Обработчик смены языка
const handleLanguageChange = (lang: Language) => {
  currentLanguage.value = lang
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  updateHtmlLang(lang)
}

// Добавляем главную страницу в начало списка упражнений
const exercisesWithMain = computed(() => {
  const mainPage = {
    id: 'main',
    name: { ru: 'Главная', en: 'Main' },
    displayName: getExerciseName({ ru: 'Главная', en: 'Main' }),
    route: '/',
    image: null,
    svg: "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M10 0C7.34783 0 4.8043 1.05357 2.92893 2.92893C1.05357 4.8043 0 7.34783 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C4.8043 18.9464 7.34783 20 10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 7.34783 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0ZM10 2C11.1042 2 12 2.89667 12 4C11.9998 4.53013 11.789 5.03848 11.4142 5.41333C11.2686 5.55927 11.1013 5.68183 10.9183 5.77667L13.4 15.9992L10 18.0017L6.6 15.9992L9.08167 5.77667C8.89924 5.68168 8.73256 5.55913 8.5875 5.41333C8.21283 5.03869 8.00213 4.53068 8.00167 4.00083C8.00145 3.47054 8.21183 2.96188 8.58657 2.58667C8.9613 2.21146 9.46971 2.00044 10 2Z\" fill=\"\"/></svg>"
  }
  
  const exercisesWithNames = exercises.value.map(exercise => ({
    ...exercise,
    displayName: getExerciseName(exercise.name)
  }))
  
  return [mainPage, ...exercisesWithNames]
})

const loadThemes = async () => {
  try {
    // Если темы уже предзагружены в App.vue, просто используем их
    if (themes.value.length === 0) {
      const response = await fetch(getDataUrl('/data/words/themes.json'))
      const data = await response.json() as Theme[]
      themes.value = data
    }
    // Автоматически выбираем "Все" только если тема еще не выбрана
    if (themes.value.length > 0 && (!selectedThemeId.value || selectedThemeId.value === '')) {
      selectedThemeId.value = 'all'
      emit('theme-selected', 'all')
    }
  } catch (error) {
    console.error('Ошибка загрузки тем:', error)
  }
}

const handleThemeSelect = (themeId: string) => {
  selectedThemeId.value = themeId
  emit('theme-selected', themeId)
  emit('close-menu')
}

const handleExerciseClick = (exerciseRoute: string) => {
  router.push(exerciseRoute)
  emit('close-menu')
}

onMounted(() => {
  loadThemes()
})
</script>

<style lang="scss">
@use './menu.scss';
</style>