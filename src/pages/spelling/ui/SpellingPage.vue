<template>
  <div class="spelling-page">
    <div class="spelling-page__content">
      <div class="spelling-page__content-title">
        <h1>
          {{ t('title') }}
        </h1>
      </div>
      <div class="spelling-page__content-cards">
        <Transition
          :name="transitionName"
          mode="out-in"
        >
          <div
            v-if="currentCard"
            :key="currentCard.id"
            class="card-info"
            :class="{ 'is-flipped': isFlipped }"
          >
            <div class="card-info__content">
              <div class="card-info__content-article article-front">
                <div class="card-info__content-article__descr">
                  <p>{{ currentWord }}</p>
                </div>
              </div>
              <div class="card-info__content-article article-back">
                <div class="card-info__content-article__descr">
                  <p>{{ translatedWord }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <div class="spelling-page__content-field">
        <label class="spelling-page__content-field__label">
          <input
            ref="inputRef"
            v-model="userInput"
            type="text"
            class="spelling-page__content-field__label-input"
            :class="{
              'error': isChecked && !isCorrect,
              'correctly': isChecked && isCorrect
            }"
            :disabled="isChecked"
            :placeholder="t('placeholder')"
            @keyup.enter="handleCheck"
          />
        </label>
        <button
          class="spelling-page__content-field__btn"
          :disabled="isChecked || !userInput.trim()"
          @click="handleCheck"
        >
          {{ t('checkButton') }}
        </button>
      </div>
    </div>
    <PaginationControls
      @change-language="handleChangeLanguage"
      @next-card="handleNextCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, nextTick, type Ref } from 'vue'
import { Transition } from 'vue'
import { PaginationControls } from '@/widgets'
import type { WordCard, Language } from '@/shared/types/card'
import type { Theme } from '@/shared/types/theme'
import { getDataUrl, usePageTranslations } from '@/shared/lib'

const selectedThemeId = inject<Ref<string>>('selectedThemeId', ref('all'))
const showLoader = inject<() => void>('showLoader', () => {})
const handleCardsLoaded = inject<(themeId: string) => void>('handleCardsLoaded', () => {})
const { t } = usePageTranslations('spelling')
const words = ref<WordCard[]>([])
const currentIndex = ref(0)
const currentLanguage = ref<Language>('russian')
const transitionName = ref<'slide-left' | 'slide-right'>('slide-right')
const currentThemeId = ref<string>('')
const userInput = ref('')
const isChecked = ref(false)
const isCorrect = ref(false)
const isFlipped = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const currentCard = computed(() => {
  return words.value[currentIndex.value]
})

const currentWord = computed(() => {
  if (!currentCard.value) return ''
  return currentLanguage.value === 'russian' 
    ? currentCard.value.russian 
    : currentCard.value.english.join(', ')
})

const translatedWord = computed(() => {
  if (!currentCard.value) return ''
  return currentLanguage.value === 'russian'
    ? currentCard.value.english.join(', ')
    : currentCard.value.russian
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

// Проверка введенного слова
const checkAnswer = (): boolean => {
  if (!currentCard.value) return false

  const userAnswer = userInput.value.trim().toLowerCase()
  
  if (currentLanguage.value === 'russian') {
    // Если язык русский, проверяем английские переводы
    const correctAnswers = currentCard.value.english.map(e => e.toLowerCase())
    return correctAnswers.includes(userAnswer)
  } else {
    // Если язык английский, проверяем русский перевод
    const correctAnswer = currentCard.value.russian.toLowerCase()
    return correctAnswer === userAnswer
  }
}

// Переход к следующей карточке
const goToNextCard = () => {
  // Сначала сбрасываем переворот карточки, чтобы избежать конфликта с анимацией
  isFlipped.value = false
  // Ждем завершения анимации переворота перед сменой карточки
  setTimeout(() => {
    transitionName.value = 'slide-right'
    if (currentIndex.value < words.value.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
    // Сбрасываем состояние
    userInput.value = ''
    isChecked.value = false
    isCorrect.value = false
    // Фокусируемся на input
    setTimeout(() => {
      inputRef.value?.focus()
    }, 0)
  }, 600) // Ждем завершения анимации переворота (0.6s)
}

// Обработка проверки
const handleCheck = () => {
  if (!userInput.value.trim() || isChecked.value) return

  isCorrect.value = checkAnswer()
  isChecked.value = true
  isFlipped.value = true
  
  // После переворота карточки автоматически переходим к следующей через 2 секунды
  setTimeout(() => {
    goToNextCard()
  }, 2000)
}

// Обработка смены языка
const handleChangeLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'russian' ? 'english' : 'russian'
  // Сбрасываем состояние
  userInput.value = ''
  isChecked.value = false
  isCorrect.value = false
  isFlipped.value = false
  // Фокусируемся на input
  setTimeout(() => {
    inputRef.value?.focus()
  }, 0)
}

// Обработка перехода к следующей карточке
const handleNextCard = () => {
  // Если карточка не перевернута, переворачиваем её, чтобы показать перевод
  if (!isFlipped.value) {
    isFlipped.value = true
    // После показа перевода переходим к следующей карточке
    setTimeout(() => {
      goToNextCard()
    }, 1000)
  } else {
    // Если карточка уже перевернута, сразу переходим к следующей
    goToNextCard()
  }
}

// Загрузка всех тем
const loadAllThemes = async (): Promise<WordCard[]> => {
  try {
    const themesResponse = await fetch(getDataUrl('/data/words/themes.json'))
    const themes = await themesResponse.json() as Theme[]
    
    // Загружаем все темы параллельно
    const themePromises = themes
      .filter(theme => theme.path) // Только темы с путем
      .map(theme => 
        fetch(getDataUrl(theme.path!))
          .then(response => response.json() as Promise<WordCard[]>)
          .catch(error => {
            console.error(`Ошибка загрузки темы:`, error)
            return []
          })
      )
    
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
        loadedWords = await response.json() as WordCard[]
      }
    }
    
    words.value = shuffleArray(loadedWords)
    currentIndex.value = 0
    currentThemeId.value = themeId
    // Сбрасываем состояние
    userInput.value = ''
    isChecked.value = false
    isCorrect.value = false
    isFlipped.value = false
    
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

// Следим за изменением темы
watch(() => selectedThemeId.value, async (newThemeId, oldThemeId) => {
  if (oldThemeId === undefined || newThemeId !== oldThemeId) {
    await loadWordsFromTheme(newThemeId, false, true)
  }
}, { immediate: false }) // Убираем immediate, чтобы избежать конфликтов при переходе между страницами

// Сбрасываем состояние при смене карточки
watch(() => currentCard.value?.id, () => {
  if (currentCard.value) {
    userInput.value = ''
    isChecked.value = false
    isCorrect.value = false
    isFlipped.value = false
    setTimeout(() => {
      inputRef.value?.focus()
    }, 0)
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
  setTimeout(() => {
    inputRef.value?.focus()
  }, 0)
})
</script>

<style lang="scss" scoped>
@use './spellingPage.scss';
</style>
  
  