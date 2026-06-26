<script lang="ts">
  import type { Player } from '../data/types';
  import styles from './PlayerStats.module.scss';
  import ProgressBar from './ProgressBar.svelte';

  let { player }: { player: Player } = $props();
</script>

<div class={styles['player-stats']}>
  <div class={styles['player-stats__panel']}>
    <div class={styles['player-stats__profile-row']}>
      <img
        src={player.avatarUrl}
        alt=""
        class={styles['player-stats__avatar']}
      />
      <div class={styles['player-stats__profile-text']}>
        <span class={styles['player-stats__name']}>{@html player.name}</span>
        <span class={styles['player-stats__level']}>LVL {@html player.level}</span>
      </div>
    </div>

    <ProgressBar
      label="HEALTH"
      value={player.health}
      max={player.maxHealth}
      fillModifier="health"
    />
    <ProgressBar
      label="ENERGY"
      value={player.energy}
      max={player.maxEnergy}
      fillModifier="energy"
    />
    <ProgressBar
      label="XP"
      value={player.xp}
      max={player.maxXp}
      fillModifier="xp"
    />

    <div class={styles['player-stats__tabs']}>
      <button type="button" class={styles['player-stats__tab-button']}>STATS</button>
      <button type="button" class={styles['player-stats__tab-button']}>INVENTORY</button>
      <button type="button" class={styles['player-stats__tab-button']}>SKILLS</button>
    </div>
  </div>
</div>
