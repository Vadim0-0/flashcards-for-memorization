<template>
  <div class="selection-page">
    <div class="selection-page__content">
      <div class="selection-page__content-info">
        <div class="selection-page__content-info__title">
          <h1>
            {{ t('title') }}
          </h1>
        </div>
        <div class="selection-page__content-info__descr">
          <p>
            {{ t('description') }}
          </p>
        </div>
      </div>
      <div class="selection-page__content-choice">
        <button
          v-for="(button, index) in buttons"
          :key="button.id"
          class="selection-page__content-choice__btn"
          :class="{
            'active': selectedIndices.includes(index),
            'correctly': correctPairs.includes(button.id),
            'error': errorPairs.includes(button.id),
            'disabled': disabledButtons.includes(button.id),
            'fading-out': fadingOutButtons.includes(button.id)
          }"
          :style="{ animationDelay: `${index * 0.1}s` }"
          :disabled="disabledButtons.includes(button.id) || errorPairs.includes(button.id)"
          @click="handleButtonClick(index, button)"
        >
            <div class="selection-page__content-choice__btn-descr">
                {{ button.text }}
            </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, nextTick, type Ref } from 'vue'
import type { WordCard } from '@/shared/types/card'
import type { Theme } from '@/shared/types/theme'
import { getDataUrl, normalizeWordCards, usePageTranslations } from '@/shared/lib'

const selectedThemeId = inject<Ref<string>>('selectedThemeId', ref('all'))
const showLoader = inject<() => void>('showLoader', () => {})
const handleCardsLoaded = inject<(themeId: string) => void>('handleCardsLoaded', () => {})
const { t } = usePageTranslations('selection')
const words = ref<WordCard[]>([])
const currentThemeId = ref<string>('')
const buttons = ref<Array<{ id: number; text: string; wordId: number; language: 'russian' | 'english'; englishIndex?: number }>>([])
const selectedIndices = ref<number[]>([])
const correctPairs = ref<number[]>([])
const errorPairs = ref<number[]>([])
const disabledButtons = ref<number[]>([])
const fadingOutButtons = ref<number[]>([])

const isAllMatched = computed(() => {
  return correctPairs.value.length === buttons.value.length
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

// Создание кнопок из выбранных слов
const createButtons = () => {
  // Нужна хотя бы одна пара
  if (words.value.length < 1) return

  const shuffledWords = shuffleArray([...words.value])
  // Берём максимум 6 слов, но не больше, чем есть в теме
  const pairsCount = Math.min(6, shuffledWords.length)
  const selectedWords = shuffledWords.slice(0, pairsCount)

  const newButtons: Array<{ id: number; text: string; wordId: number; language: 'russian' | 'english'; englishIndex?: number }> = []

  // Создаем кнопки: 6 русских и 6 английских
  let buttonIdCounter = 0
  selectedWords.forEach((word) => {
    // Русская кнопка
    newButtons.push({
      id: buttonIdCounter++, // Уникальный ID для русской кнопки
      text: word.russian,
      wordId: word.id,
      language: 'russian'
    })

    // Английская кнопка (объединяем все варианты перевода через запятую)
    newButtons.push({
      id: buttonIdCounter++, // Уникальный ID для английской кнопки
      text: word.english.join(', '),
      wordId: word.id,
      language: 'english',
      englishIndex: 0
    })
  })

  // Перемешиваем кнопки
  buttons.value = shuffleArray(newButtons)
  selectedIndices.value = []
  correctPairs.value = []
  errorPairs.value = []
  disabledButtons.value = []
  fadingOutButtons.value = []
}

// Обработка клика на кнопку
const handleButtonClick = (index: number, button: { id: number; wordId: number; language: 'russian' | 'english' }) => {
  if (isAllMatched.value || errorPairs.value.includes(button.id) || correctPairs.value.includes(button.id)) {
    return
  }

  // Если уже выбрана одна кнопка
  if (selectedIndices.value.length === 1) {
    const firstIndex = selectedIndices.value[0]
    const firstButton = buttons.value[firstIndex]

    // Проверяем, правильная ли пара
    if (firstButton.wordId === button.wordId && firstButton.language !== button.language) {
      // Правильная пара
      correctPairs.value.push(firstButton.id, button.id)
      selectedIndices.value = []

      // Добавляем disabled с задержкой 0.5s
      setTimeout(() => {
        disabledButtons.value.push(firstButton.id, button.id)
      }, 1000)

      // Если все пары выбраны, плавно исчезаем и загружаем новые карты
      if (correctPairs.value.length === buttons.value.length) {
        // Ждем 2 секунды, затем начинаем плавно добавлять класс fading-out по очереди
        setTimeout(() => {
          const currentButtons = [...buttons.value]

          currentButtons.forEach((btn, idx) => {
            setTimeout(() => {
              // Добавляем id кнопки в список исчезающих
              if (!fadingOutButtons.value.includes(btn.id)) {
                fadingOutButtons.value.push(btn.id)
              }

              // Когда последняя карточка начала исчезать — ждём окончание анимации и создаём новые
              if (idx === currentButtons.length - 1) {
                setTimeout(() => {
                  createButtons()
                  fadingOutButtons.value = []
                }, 500) // длительность cardDisappear
              }
            }, idx * 100) // шаг между карточками 0.1s
          })
        }, 1000)
      }
    } else {
      // Неправильная пара
      errorPairs.value.push(firstButton.id, button.id)
      setTimeout(() => {
        errorPairs.value = errorPairs.value.filter(id => id !== firstButton.id && id !== button.id)
        selectedIndices.value = []
      }, 1000)
    }
  } else {
    // Выбираем первую кнопку
    selectedIndices.value = [index]
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
    currentThemeId.value = themeId
    createButtons()
    
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
watch(
  () => selectedThemeId.value,
  async (newThemeId, oldThemeId) => {
    // Загружаем слова заново только если тема реально изменилась
    if (oldThemeId !== undefined && newThemeId !== oldThemeId) {
      // Сбрасываем текущую тему и состояние, чтобы не тянуть старые слова
      currentThemeId.value = ''
      words.value = []
      buttons.value = []
      selectedIndices.value = []
      correctPairs.value = []
      errorPairs.value = []
      disabledButtons.value = []

      await loadWordsFromTheme(newThemeId, true, true)
    }
  },
  { immediate: false }
)

onMounted(async () => {
  await nextTick()
  const themeId = selectedThemeId.value || 'all'
  currentThemeId.value = ''
  await loadWordsFromTheme(themeId, true, true)
})
</script>

<style lang="scss" scoped>
@use './selectionPage.scss';
</style>
    
    