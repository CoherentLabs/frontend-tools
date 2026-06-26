<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import type { GameMode } from '../data/types';
import styles from './CarouselMenu.module.scss';

const props = defineProps<{
  item: GameMode;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

const backgroundStyle = computed<CSSProperties | undefined>(() => (
  props.item.imageUrl
    ? { backgroundImage: `url('${props.item.imageUrl}')` }
    : undefined
));
</script>

<template>
  <button
    type="button"
    :class="[styles['carousel-card'], isSelected ? styles['carousel-card--selected'] : '']"
    @click="emit('select', item.id)"
  >
    <div
      :class="styles['carousel-card__masked-bg']"
      aria-hidden="true"
      :style="backgroundStyle"
    >
      <div v-if="!isSelected" :class="styles['carousel-card__shade']" />
    </div>

    <div v-if="isSelected" :class="styles['carousel-card__pulsing-border']" aria-hidden="true" />

    <div :class="styles['carousel-card__caption']">
      <span :class="[styles['carousel-card__title'], isSelected ? styles['carousel-card__title--selected'] : '']">
        {{ item.title }}
      </span>
    </div>
  </button>
</template>
