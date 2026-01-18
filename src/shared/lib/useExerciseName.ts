import { computed } from 'vue'
import { useLanguage } from './useLanguage'

export interface ExerciseName {
  ru: string
  en: string
}

/**
 * Composable для получения переведенного имени упражнения
 */
export function useExerciseName() {
  const { currentLang } = useLanguage()
  
  /**
   * Получает переведенное имя упражнения
   * Функция реактивна благодаря использованию currentLang.value
   * @param name - объект с переводами или строка (для обратной совместимости)
   * @returns переведенное имя
   */
  const getExerciseName = (name: ExerciseName | string): string => {
    if (typeof name === 'string') {
      // Обратная совместимость: если name - строка, возвращаем её
      return name
    }
    
    // Если name - объект с переводами, возвращаем нужный язык
    // Используем currentLang.value для реактивности
    const lang = currentLang.value
    return name[lang] || name.ru || name.en || ''
  }
  
  return {
    getExerciseName,
    currentLang: computed(() => currentLang.value)
  }
}

