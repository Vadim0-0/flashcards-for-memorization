<template>
    <button 
        class="menu-open-btn" 
        :class="{ 'off': isOpen }"
        @click="$emit('open-menu')"
    >
        <span></span>
        <span></span>
        <span></span>
    </button>
</template>

<script setup lang="ts">
interface Props {
  isOpen?: boolean
}

defineProps<Props>()

defineEmits<{
  'open-menu': []
}>()
</script>

<style lang="scss">
@use './menuOpen.scss';
</style>