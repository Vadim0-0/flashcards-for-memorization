<template>
  <div class="loader">
    <div class="loader__container">
      <div class="loader__container-content">
        <div class="loader__container-content__icon">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="loader__container-content__descr"> 
          <p>
            {{ t('loading') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/shared/lib'

const { t } = useTranslations(() => import('./loader.json'))
</script>

<style lang="scss" scoped>
@use './styles.module.scss';
</style>
    
    