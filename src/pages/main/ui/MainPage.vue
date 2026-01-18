<template>
  <div class="main-page">
    <div class="main-page__content">
      <div class="main-page__content-title">
        <h1>
          {{ t('title') }}
        </h1>
      </div>
      <div class="main-page__content-list">
        <button 
          v-for="exercise in processedExercises"
          :key="exercise.id"
          class="main-page__content-list__btn"
          @click="handleExerciseClick(exercise.route)"
        >
          <img 
            v-if="exercise.image && !exercise.svg" 
            :src="exercise.image" 
            :alt="exercise.displayName"
            class="main-page__content-list__btn-image"
          />
          <span 
            v-if="exercise.svg"
            class="main-page__content-list__btn-svg"
            v-html="exercise.svg"
          ></span>
          <div class="main-page__content-list__btn-descr">
            {{ exercise.displayName }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { exercises as exercisesData } from '@/shared/config'
import { usePageTranslations, useExerciseName } from '@/shared/lib'

const router = useRouter()
const exercises = ref(exercisesData)
const showLoader = inject<() => void>('showLoader', () => {})
const { t } = usePageTranslations('main')
const { getExerciseName } = useExerciseName()

// Обрабатываем SVG, удаляя inline атрибуты width и height
const processedExercises = computed(() => {
  return exercises.value.map(exercise => {
    const processedExercise: any = { ...exercise }
    
    if (exercise.svg) {
      // Удаляем атрибуты width и height из SVG
      processedExercise.svg = exercise.svg
        .replace(/\s+width="[^"]*"/gi, '')
        .replace(/\s+height="[^"]*"/gi, '')
    }
    
    // Добавляем переведенное имя
    processedExercise.displayName = getExerciseName(exercise.name)
    
    return processedExercise
  })
})

const handleExerciseClick = (route: string) => {
  showLoader()
  router.push(route)
}
</script>

<style lang="scss" scoped>
  @use './mainPage.scss';
</style>
