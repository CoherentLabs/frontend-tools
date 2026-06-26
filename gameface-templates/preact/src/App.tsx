import { useState } from 'preact/hooks';
import Achievements from './components/Achievements';
import CarouselMenu from './components/CarouselMenu';
import PlayerStats from './components/PlayerStats';
import {
  achievements,
  FRAMEWORK_LABEL,
  gameModes,
  player,
  systemStats,
} from './data/entryPageData';
import { useResponsiveRootFontSize } from './hooks/useResponsiveRootFontSize';
import styles from './App.module.scss';

export default function App() {
  const [selectedModeId, setSelectedModeId] = useState('multiplayer');

  useResponsiveRootFontSize();

  return (
    <div className={styles.app}>
      <div className={styles['app__background']} />
      <div className={`${styles['app__background']} ${styles['app__background--secondary']}`} />
      <div className={styles['app__nebula']} />
      <div className={styles['app__content']}>
        <header className={styles['app__header']}>
          <span className={styles['app__title']}>GAMEFACE TEMPLATE</span>
          <span className={styles['app__framework']}>Framework: {FRAMEWORK_LABEL}</span>
        </header>

        <div className={styles['app__main-row']}>
          <Achievements items={achievements} />
          <div className={styles['app__spacer']} />
          <PlayerStats player={player} />
        </div>

        <div className={styles['app__action-row']}>
          <button type="button" className={styles['app__start-button']}>
            START GAME
          </button>
        </div>

        <CarouselMenu
          items={gameModes}
          selectedId={selectedModeId}
          onSelect={setSelectedModeId}
        />

        <footer className={styles['app__footer']}>
          <span className={styles['app__stat']}>FPS: {systemStats.fps}</span>
          <span className={styles['app__stat']}>PING: {systemStats.ping}ms</span>
        </footer>
      </div>
    </div>
  );
}
