<template>
    <div class="cards-page">
      <CardsList ref="cardsListRef" />
      <PaginationControls
        @prev-card="handlePrevCard"
        @next-card="handleNextCard"
        @flip-card="handleFlipCard"
        @change-language="handleChangeLanguage"
      />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CardsList, PaginationControls } from '@/widgets'

const cardsListRef = ref<InstanceType<typeof CardsList> | null>(null)

const handlePrevCard = () => {
cardsListRef.value?.prevCard()
}

const handleNextCard = () => {
cardsListRef.value?.nextCard()
}

const handleFlipCard = () => {
cardsListRef.value?.flipCard()
}

const handleChangeLanguage = () => {
cardsListRef.value?.changeLanguage()
}

// Главная страница
</script>

<style lang="scss" scoped>
    @use './cardsPage.scss';
</style>
  