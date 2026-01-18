<template>
  <button 
    :class="['button', `button--${variant}`, { 'button--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.button--primary {
  background-color: #42b983;
  color: white;
}

.button--primary:hover:not(:disabled) {
  background-color: #35a372;
}

.button--secondary {
  background-color: #6c757d;
  color: white;
}

.button--secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.button--outline {
  background-color: transparent;
  border: 1px solid #42b983;
  color: #42b983;
}

.button--outline:hover:not(:disabled) {
  background-color: #42b983;
  color: white;
}

.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
