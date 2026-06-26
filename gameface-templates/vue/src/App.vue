<script setup lang="ts">
import { ref } from 'vue';
import Achievements from './components/Achievements.vue';
import CarouselMenu from './components/CarouselMenu.vue';
import PlayerStats from './components/PlayerStats.vue';
import {
  achievements,
  FRAMEWORK_LABEL,
  gameModes,
  player,
  systemStats,
} from './data/entryPageData';
import { useResponsiveRootFontSize } from './composables/useResponsiveRootFontSize';
import styles from './App.module.scss';

const selectedModeId = ref('multiplayer');

useResponsiveRootFontSize();
</script>

<template>
  <div :class="styles.app">
    <div :class="styles['app__background']" />
    <div :class="[styles['app__background'], styles['app__background--secondary']]" />
    <div :class="styles['app__nebula']" />
    <div :class="styles['app__content']">
      <header :class="styles['app__header']">
        <span :class="styles['app__title']">GAMEFACE TEMPLATE</span>
        <span :class="styles['app__framework']">Framework: {{ FRAMEWORK_LABEL }}</span>
      </header>

      <div :class="styles['app__main-row']">
        <Achievements :items="achievements" />
        <div :class="styles['app__spacer']" />
        <PlayerStats :player="player" />
      </div>

      <div :class="styles['app__action-row']">
        <button type="button" :class="styles['app__start-button']">
          START GAME
        </button>
      </div>

      <CarouselMenu
        :items="gameModes"
        :selected-id="selectedModeId"
        @select="selectedModeId = $event"
      />

      <footer :class="styles['app__footer']">
        <span :class="styles['app__stat']">FPS: {{ systemStats.fps }}</span>
        <span :class="styles['app__stat']">PING: {{ systemStats.ping }}ms</span>
      </footer>
    </div>
  </div>
</template>
