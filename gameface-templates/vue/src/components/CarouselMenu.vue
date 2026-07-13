<script setup lang="ts">
import type { GameMode } from '../data/types';
import styles from './CarouselMenu.module.scss';
import CarouselCard from './CarouselCard.vue';

defineProps<{
  items: GameMode[];
  selectedId: string;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div :class="styles['carousel-menu']">
    <CarouselCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      :is-selected="item.id === selectedId"
      @select="emit('select', $event)"
    />
  </div>
</template>
