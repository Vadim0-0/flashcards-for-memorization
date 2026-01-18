import { ref, computed } from 'vue'
import { useLanguage } from './useLanguage'

// Типы
export type PageName = 'main' | 'cards' | 'memorization' | 'selection' | 'spelling'

export interface PageTranslations {
  [key: string]: string | PageTranslations
}

export interface Translations {
  ru: Record<string, any>
  en: Record<string, any>
}

// Динамический импорт переводов для каждой страницы
const pageTranslationsMap: Record<PageName, () => Promise<{ ru: PageTranslations; en: PageTranslations }>> = {
  main: () => import('@/pages/main/ui/main.json'),
  cards: () => import('@/pages/cards/ui/cards.json'),
  memorization: () => import('@/pages/memorization/ui/memorization.json'),
  selection: () => import('@/pages/selection/ui/selection.json'),
  spelling: () => import('@/pages/spelling/ui/spelling.json')
}

/**
 * Универсальный composable для загрузки переводов из JSON файла
 * @param translationLoader - функция для загрузки переводов (динамический импорт)
 */
export function useTranslations(translationLoader: () => Promise<Translations>) {
  const { currentLang } = useLanguage()
  const translations = ref<Translations | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // Загрузка переводов
  const loadTranslations = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const module = await translationLoader()
      // Обрабатываем как default export, так и named export
      translations.value = (module as any).default || module as Translations
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      console.error('Error loading translations:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Получение перевода по ключу (реактивная функция)
  const t = (key: string): string => {
    // Используем currentLang.value для реактивности
    const lang = currentLang.value
    
    if (!translations.value) {
      return key
    }
    
    const langTranslations = translations.value[lang]
    
    if (!langTranslations) {
      return key
    }
    
    // Поддержка вложенных ключей через точку (например, "title.main")
    const keys = key.split('.')
    let value: any = langTranslations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }
  
  // Загружаем переводы при создании
  loadTranslations()
  
  return {
    t,
    translations: computed(() => translations.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentLang: computed(() => currentLang.value),
    reload: loadTranslations
  }
}

/**
 * Composable для загрузки и использования переводов страниц
 * Является оберткой над useTranslations с предопределенными путями для страниц
 */
export function usePageTranslations(pageName: PageName) {
  const loader = pageTranslationsMap[pageName]
  if (!loader) {
    throw new Error(`No translation loader found for page: ${pageName}`)
  }
  return useTranslations(loader)
}
