<script lang="ts">
  import styles from './PlayerStats.module.scss';

  let {
    label,
    value,
    max,
    fillModifier,
  }: {
    label: string;
    value: number;
    max: number;
    fillModifier: 'health' | 'energy' | 'xp';
  } = $props();

  const percent = $derived(Math.round((value / max) * 100));
</script>

<div class={styles['progress-bar']}>
  <div class={styles['progress-bar__header']}>
    <span class={styles['progress-bar__label']}>{@html label}</span>
    <span class={styles['progress-bar__value']}>{@html value} / {@html max}</span>
  </div>
  <div class={styles['progress-bar__track']}>
    <div
      class="{styles['progress-bar__fill']} {styles[`progress-bar__fill--${fillModifier}`]}"
      style:width="{percent}%"
    ></div>
  </div>
</div>
