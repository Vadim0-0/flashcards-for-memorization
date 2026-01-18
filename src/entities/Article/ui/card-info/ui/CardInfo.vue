<template>
    <div class="card-info"
        :class="{ 'is-flipped': isFlipped }"
        @click="handleFlip"
    >
        <div class="card-info__content">
            <!-- Передняя сторона (начальный язык) -->
            <div class="card-info__content-article article-front">
                <div class="card-info__content-article__descr">
                    <p>{{ currentWord }}</p>
                </div>
            </div>
           
           <!-- Задняя сторона (перевод) -->
            <div class="card-info__content-article article-back">
                <div class="card-info__content-article__descr">
                    <p>{{ translatedWord }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { WordCard, Language } from '@/shared/types/card'

interface Props {
  card: WordCard
  currentLanguage: Language
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'flip': []
}>()

const isFlipped = ref(false)

const currentWord = computed(() => {
  return props.currentLanguage === 'russian' 
    ? props.card.russian 
    : props.card.english.join(', ')
})

const translatedWord = computed(() => {
  return props.currentLanguage === 'russian'
    ? props.card.english.join(', ')
    : props.card.russian
})

const handleFlip = () => {
  flip()
}

const flip = () => {
  isFlipped.value = !isFlipped.value
  emit('flip')
}

// Сбрасываем переворот при смене языка или карточки
watch(() => props.currentLanguage, () => {
  isFlipped.value = false
})

watch(() => props.card.id, () => {
  isFlipped.value = false
})

defineExpose({
  flip
})
</script>

<style lang="scss">
@use './cardInfo.scss';
</style>