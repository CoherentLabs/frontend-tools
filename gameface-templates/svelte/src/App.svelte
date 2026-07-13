<script lang="ts">
  import Achievements from "./components/Achievements.svelte";
  import CarouselMenu from "./components/CarouselMenu.svelte";
  import PlayerStats from "./components/PlayerStats.svelte";
  import {
    achievements,
    FRAMEWORK_LABEL,
    gameModes,
    player,
    systemStats,
  } from "./data/entryPageData";
  import { useResponsiveRootFontSize } from "./composables/useResponsiveRootFontSize";
  import styles from "./App.module.scss";

  let selectedModeId = $state("multiplayer");

  useResponsiveRootFontSize();
</script>

<div class={styles.app}>
  <div class={styles['app__background']}></div>
  <div class="{styles['app__background']} {styles['app__background--secondary']}"></div>
  <div class={styles['app__nebula']}></div>
  <div class={styles['app__content']}>
    <header class={styles['app__header']}>
      <span class={styles['app__title']}>GAMEFACE TEMPLATE</span>
      <span class={styles['app__framework']}>Framework: {@html FRAMEWORK_LABEL}</span>
    </header>

    <div class={styles['app__main-row']}>
      <Achievements items={achievements} />
      <div class={styles['app__spacer']}></div>
      <PlayerStats {player} />
    </div>

    <div class={styles['app__action-row']}>
      <button type="button" class={styles['app__start-button']}> START GAME </button>
    </div>

    <CarouselMenu
      items={gameModes}
      selectedId={selectedModeId}
      onSelect={(id) => {
        selectedModeId = id;
      }}
    />

    <footer class={styles['app__footer']}>
      <span class={styles['app__stat']}>FPS: {@html systemStats.fps}</span>
      <span class={styles['app__stat']}>PING: {@html systemStats.ping}ms</span>
    </footer>
  </div>
</div>
