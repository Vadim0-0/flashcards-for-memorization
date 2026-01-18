import { ref, computed, onMounted, onUnmounted } from 'vue'

export type AppLanguage = 'ru' | 'en'

/**
 * Composable для отслеживания языка из атрибута lang в HTML
 * Реактивно обновляется при изменении атрибута
 */
export function useLanguage() {
  const currentLang = ref<AppLanguage>('ru')
  
  // Функция для получения языка из HTML
  const getLanguageFromHtml = (): AppLanguage => {
    const htmlLang = document.documentElement.getAttribute('lang') || 'ru'
    return (htmlLang.startsWith('en') ? 'en' : 'ru') as AppLanguage
  }
  
  // Обновляем текущий язык
  const updateLanguage = () => {
    currentLang.value = getLanguageFromHtml()
  }
  
  // Наблюдатель за изменениями атрибута lang
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
        updateLanguage()
      }
    })
  })
  
  onMounted(() => {
    // Устанавливаем начальное значение
    updateLanguage()
    
    // Начинаем наблюдение за изменениями атрибута lang
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    })
  })
  
  onUnmounted(() => {
    // Останавливаем наблюдение при размонтировании
    observer.disconnect()
  })
  
  return {
    currentLang: computed(() => currentLang.value),
    isRussian: computed(() => currentLang.value === 'ru'),
    isEnglish: computed(() => currentLang.value === 'en')
  }
}

