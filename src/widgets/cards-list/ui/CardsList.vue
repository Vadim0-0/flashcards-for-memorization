<template>
  <div class="cards-list">
    <div class="cards-list__container">
      <Transition
        :name="transitionName"
        mode="out-in"
      >
        <CardInfo
          v-if="currentCard"
          ref="cardInfoRef"
          :key="currentIndex"
          :card="currentCard"
          :current-language="currentLanguage"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, nextTick, type Ref } from 'vue'
import { Transition } from 'vue'
import { CardInfo } from '@/entities'
import type { WordCard, Language } from '@/shared/types/card'
import type { Theme } from '@/shared/types/theme'
import { getDataUrl } from '@/shared/lib'

const selectedThemeId = inject<Ref<string>>('selectedThemeId', ref('all'))
const showLoader = inject<() => void>('showLoader', () => {})
const handleCardsLoaded = inject<(themeId: string) => void>('handleCardsLoaded', () => {})
const words = ref<WordCard[]>([])
const currentIndex = ref(0)
const currentLanguage = ref<Language>('russian')
const transitionName = ref<'slide-left' | 'slide-right'>('slide-right')
const cardInfoRef = ref<InstanceType<typeof CardInfo> | null>(null)
const currentThemeId = ref<string>('')

const currentCard = computed(() => {
  return words.value[currentIndex.value]
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
  // Предотвращаем повторную загрузку той же темы (если не принудительно)
  if (!force && currentThemeId.value === themeId && words.value.length > 0) {
    return
  }
  
  if (showLoading) {
    showLoader()
  }
  
  try {
    let loadedWords: WordCard[] = []
    
    if (themeId === 'all') {
      // Загружаем все слова из всех тем
      loadedWords = await loadAllThemes()
    } else {
      // Загружаем слова из конкретной темы
      const themesResponse = await fetch(getDataUrl('/data/words/themes.json'))
      const themes = await themesResponse.json() as Theme[]
      const theme = themes.find(t => t.id === themeId)
      
      if (theme && theme.path) {
        const response = await fetch(getDataUrl(theme.path))
        loadedWords = await response.json() as WordCard[]
      }
    }
    
    // Рандомизируем и устанавливаем слова
    words.value = shuffleArray(loadedWords)
    currentIndex.value = 0
    currentThemeId.value = themeId
    
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
  // Загружаем только если тема действительно изменилась
  if (oldThemeId !== undefined && newThemeId !== oldThemeId) {
    await loadWordsFromTheme(newThemeId, false, true)
  }
})

onMounted(async () => {
  // Используем небольшую задержку, чтобы убедиться, что компонент полностью смонтирован
  await nextTick()
  
  // Всегда загружаем данные при монтировании, чтобы избежать проблем при переходе между страницами
  const themeId = selectedThemeId.value || 'all'
  // Сбрасываем currentThemeId перед загрузкой, чтобы гарантировать загрузку
  currentThemeId.value = ''
  await loadWordsFromTheme(themeId, true, true)
})

const flipCard = () => {
  if (cardInfoRef.value) {
    cardInfoRef.value.flip()
  }
}

const prevCard = () => {
  transitionName.value = 'slide-left'
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = words.value.length - 1
  }
}

const nextCard = () => {
  transitionName.value = 'slide-right'
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const changeLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'russian' ? 'english' : 'russian'
}

defineExpose({
  flipCard,
  prevCard,
  nextCard,
  changeLanguage
})
</script>

<style lang="scss">
    @use './cardsList.scss';
</style>