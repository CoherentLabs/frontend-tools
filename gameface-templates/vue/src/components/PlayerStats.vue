<script setup lang="ts">
import type { Player } from '../data/types';
import styles from './PlayerStats.module.scss';
import ProgressBar from './ProgressBar.vue';

defineProps<{
  player: Player;
}>();
</script>

<template>
  <div :class="styles['player-stats']">
    <div :class="styles['player-stats__panel']">
      <div :class="styles['player-stats__profile-row']">
        <img
          :src="player.avatarUrl"
          alt=""
          :class="styles['player-stats__avatar']"
        />
        <div :class="styles['player-stats__profile-text']">
          <span :class="styles['player-stats__name']">{{ player.name }}</span>
          <span :class="styles['player-stats__level']">LVL {{ player.level }}</span>
        </div>
      </div>

      <ProgressBar
        label="HEALTH"
        :value="player.health"
        :max="player.maxHealth"
        fill-modifier="health"
      />
      <ProgressBar
        label="ENERGY"
        :value="player.energy"
        :max="player.maxEnergy"
        fill-modifier="energy"
      />
      <ProgressBar
        label="XP"
        :value="player.xp"
        :max="player.maxXp"
        fill-modifier="xp"
      />

      <div :class="styles['player-stats__tabs']">
        <button type="button" :class="styles['player-stats__tab-button']">STATS</button>
        <button type="button" :class="styles['player-stats__tab-button']">INVENTORY</button>
        <button type="button" :class="styles['player-stats__tab-button']">SKILLS</button>
      </div>
    </div>
  </div>
</template>
