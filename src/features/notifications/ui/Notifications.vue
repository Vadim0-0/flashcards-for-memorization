<template>
  <div class="notifications-content">
    <div class="notifications-content__descr">
      <p>
        {{ t('themeSelected') }} "{{ themeName }}"
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/shared/lib'

defineProps<{
  themeName: string
}>()

const { t } = useTranslations(() => import('./notifications.json'))
</script>

<style lang="scss" scoped>
@use './notifications.scss';
</style>
    
    