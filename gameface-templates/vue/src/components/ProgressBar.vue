<script setup lang="ts">
import { computed } from 'vue';
import styles from './PlayerStats.module.scss';

const props = defineProps<{
  label: string;
  value: number;
  max: number;
  fillModifier: 'health' | 'energy' | 'xp';
}>();

const percent = computed(() => Math.round((props.value / props.max) * 100));
</script>

<template>
  <div :class="styles['progress-bar']">
    <div :class="styles['progress-bar__header']">
      <span :class="styles['progress-bar__label']">{{ label }}</span>
      <span :class="styles['progress-bar__value']">{{ value }} / {{ max }}</span>
    </div>
    <div :class="styles['progress-bar__track']">
      <div
        :class="[styles['progress-bar__fill'], styles[`progress-bar__fill--${fillModifier}`]]"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
