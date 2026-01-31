<template>
  <div class="memorization-page">
    <div class="memorization-page__content">
      <div class="memorization-page__content-title">
        <h1>
          {{ t('title') }}
        </h1>
      </div>
      <div class="memorization-page__content-words">
        <Transition
          :name="transitionName"
          mode="out-in"
        >
          <div
            v-if="currentCard"
            :key="currentCard.id"
            class="memorization-page__content-words__card"
          >
            <div class="memorization-page__content-words__card-word">
              <p>{{ currentWord }}</p>
            </div>
          </div>
        </Transition>
      </div>
      <div class="memorization-page__content-choice">
        <button
          v-for="(option, index) in answerOptions"
          :key="index"
          class="memorization-page__content-choice__btn"
          :class="{
            'error': wrongSelectedIndices.includes(index),
            'correctly': correctSelectedIndex === index
          }"
          :disabled="isAnswered"
          @click="handleOptionClick(index, option.isCorrect)"
        >
          {{ option.text }}
        </button>
      </div>
    </div>
    <PaginationControls @change-language="handleChangeLanguage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, nextTick, type Ref } from 'vue'
import { Transition } from 'vue'
import { PaginationControls } from '@/widgets'
import type { WordCard, Language } from '@/shared/types/card'
import type { Theme } from '@/shared/types/theme'
import { getDataUrl, normalizeWordCards, usePageTranslations } from '@/shared/lib'

const selectedThemeId = inject<Ref<string>>('selectedThemeId', ref('all'))
const showLoader = inject<() => void>('showLoader', () => {})
const handleCardsLoaded = inject<(themeId: string) => void>('handleCardsLoaded', () => {})
const { t } = usePageTranslations('memorization')
const words = ref<WordCard[]>([])
const currentIndex = ref(0)
const currentLanguage = ref<Language>('russian')
const transitionName = ref<'slide-left' | 'slide-right'>('slide-right')
const currentThemeId = ref<string>('')
const answerOptions = ref<Array<{ text: string; isCorrect: boolean }>>([])
const wrongSelectedIndices = ref<number[]>([])
const correctSelectedIndex = ref<number | null>(null)
const isAnswered = ref(false)

const currentCard = computed(() => {
  return words.value[currentIndex.value]
})

const currentWord = computed(() => {
  if (!currentCard.value) return ''
  return currentLanguage.value === 'russian' 
    ? currentCard.value.russian 
    : currentCard.value.english.join(', ')
})

// Функция для рандомизации массива
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Генерация вариантов ответа
const generateAnswerOptions = () => {
  if (!currentCard.value) return

  const correctAnswer = currentLanguage.value === 'russian'
    ? currentCard.value.english.join(', ')
    : currentCard.value.russian

  // Получаем случайные неправильные ответы
  const wrongAnswers: string[] = []
  const availableWords = words.value.filter(w => w.id !== currentCard.value!.id)
  
  // Берем случайные слова из списка
  const shuffledWords = shuffleArray([...availableWords])
  for (let i = 0; i < 3 && i < shuffledWords.length; i++) {
    const word = shuffledWords[i]
    const answer = currentLanguage.value === 'russian'
      ? word.english.join(', ')
      : word.russian
    wrongAnswers.push(answer)
  }

  // Создаем массив из правильного и неправильных ответов
  const allAnswers = [
    { text: correctAnswer, isCorrect: true },
    ...wrongAnswers.map(text => ({ text, isCorrect: false }))
  ]

  // Перемешиваем варианты
  answerOptions.value = shuffleArray(allAnswers)
  wrongSelectedIndices.value = []
  correctSelectedIndex.value = null
  isAnswered.value = false
}

// Загрузка всех тем
const loadAllThemes = async (): Promise<WordCard[]> => {
  try {
    const themesResponse = await fetch(getDataUrl('/data/words/themes.json'))
    const themes = await themesResponse.json() as Theme[]
    
    // Загружаем все темы параллельно
    const themePromises = themes
      .filter(theme => theme.path) // Только темы с путем
      .map(async (theme) => {
        try {
          const response = await fetch(getDataUrl(theme.path!))
          const data = await response.json()
          return normalizeWordCards(data)
        } catch (error) {
          console.error(`Ошибка загрузки темы:`, error)
          return []
        }
      })
    
    const allThemesWords = await Promise.all(themePromises)
    const allWords = allThemesWords.flat()
    
    return allWords
  } catch (error) {
    console.error('Ошибка загрузки тем:', error)
    return []
  }
}

// Загрузка слов из конкретной темы
const loadWordsFromTheme = async (themeId: string, force = false, showLoading = true) => {
  // Проверяем, нужно ли загружать данные (если не принудительно)
  if (!force && currentThemeId.value === themeId && words.value.length > 0) {
    return
  }
  
  if (showLoading) {
    showLoader()
  }
  
  try {
    let loadedWords: WordCard[] = []
    
    if (themeId === 'all') {
      loadedWords = await loadAllThemes()
    } else {
      const themesResponse = await fetch(getDataUrl('/data/words/themes.json'))
      const themes = await themesResponse.json() as Theme[]
      const theme = themes.find(t => t.id === themeId)
      
      if (theme && theme.path) {
        const response = await fetch(getDataUrl(theme.path))
        const data = await response.json()
        loadedWords = normalizeWordCards(data)
      }
    }
    
    words.value = shuffleArray(loadedWords)
    currentIndex.value = 0
    currentThemeId.value = themeId
    generateAnswerOptions()
    
    if (showLoading) {
      handleCardsLoaded(themeId)
    }
  } catch (error) {
    console.error('Ошибка загрузки слов:', error)
    if (showLoading) {
      handleCardsLoaded(themeId)
    }
  }
}

// Обработка клика на вариант ответа
const handleOptionClick = (index: number, isCorrect: boolean) => {
  if (isAnswered.value) return

  if (isCorrect) {
    // Правильный ответ
    correctSelectedIndex.value = index
    isAnswered.value = true
    // Переходим к следующей карточке через небольшую задержку
    setTimeout(() => {
      nextCard()
    }, 1000)
  } else {
    // Неправильный ответ - добавляем в список неправильных, но продолжаем выбор
    if (!wrongSelectedIndices.value.includes(index)) {
      wrongSelectedIndices.value.push(index)
    }
  }
}

// Переход к следующей карточке
const nextCard = () => {
  transitionName.value = 'slide-right'
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
  generateAnswerOptions()
}

// Следим за изменением темы
watch(() => selectedThemeId.value, async (newThemeId, oldThemeId) => {
  if (oldThemeId === undefined || newThemeId !== oldThemeId) {
    await loadWordsFromTheme(newThemeId, false, true)
  }
}, { immediate: false }) // Убираем immediate, чтобы избежать конфликтов при переходе между страницами

// Обработка смены языка
const handleChangeLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'russian' ? 'english' : 'russian'
  // Сбрасываем состояние выбора
  wrongSelectedIndices.value = []
  correctSelectedIndex.value = null
  isAnswered.value = false
  // Генерируем новые варианты ответов
  generateAnswerOptions()
}

// Генерируем варианты при смене карточки
watch(() => currentCard.value?.id, () => {
  if (currentCard.value) {
    generateAnswerOptions()
  }
})

onMounted(async () => {
  // Используем небольшую задержку, чтобы убедиться, что компонент полностью смонтирован
  await nextTick()
  
  // Принудительно загружаем данные при монтировании компонента
  const themeId = selectedThemeId.value || 'all'
  // Всегда загружаем при монтировании, чтобы избежать проблем при переходе между страницами
  // Сбрасываем currentThemeId перед загрузкой, чтобы гарантировать загрузку
  currentThemeId.value = ''
  await loadWordsFromTheme(themeId, true, true)
})
</script>

<style lang="scss" scoped>
@use './memorizationPage.scss';
</style>

