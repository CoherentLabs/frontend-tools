<script setup lang="ts">
import type { Achievement } from '../data/types';
import styles from './Achievements.module.scss';

defineProps<{
  items: Achievement[];
}>();
</script>

<template>
  <div :class="styles.achievements">
    <div
      v-for="achievement in items"
      :key="achievement.id"
      :class="styles['achievements__card']"
    >
      <img
        :src="achievement.iconUrl"
        alt=""
        :class="styles['achievements__icon']"
      />
      <div :class="styles['achievements__text']">
        <span :class="styles['achievements__title']">{{ achievement.title }}</span>
        <span :class="styles['achievements__subtitle']">{{ achievement.unlockedAt }}</span>
      </div>
    </div>
  </div>
</template>
