import type { Player } from '../data/types';
import styles from './PlayerStats.module.scss';

type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
  fillModifier: 'health' | 'energy' | 'xp';
};

function ProgressBar({ label, value, max, fillModifier }: ProgressBarProps) {
  const percent = Math.round((value / max) * 100);

  return (
    <div className={styles['progress-bar']}>
      <div className={styles['progress-bar__header']}>
        <span className={styles['progress-bar__label']}>{label}</span>
        <span className={styles['progress-bar__value']}>
          {value} / {max}
        </span>
      </div>
      <div className={styles['progress-bar__track']}>
        <div
          className={`${styles['progress-bar__fill']} ${styles[`progress-bar__fill--${fillModifier}`]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type TabButtonProps = {
  label: string;
};

function TabButton({ label }: TabButtonProps) {
  return (
    <button type="button" className={styles['player-stats__tab-button']}>
      {label}
    </button>
  );
}

type PlayerStatsProps = {
  player: Player;
};

export default function PlayerStats({ player }: PlayerStatsProps) {
  return (
    <div className={styles['player-stats']}>
      <div className={styles['player-stats__panel']}>
        <div className={styles['player-stats__profile-row']}>
          <img
            src={player.avatarUrl}
            alt=""
            className={styles['player-stats__avatar']}
          />
          <div className={styles['player-stats__profile-text']}>
            <span className={styles['player-stats__name']}>{player.name}</span>
            <span className={styles['player-stats__level']}>LVL {player.level}</span>
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

        <div className={styles['player-stats__tabs']}>
          <TabButton label="STATS" />
          <TabButton label="INVENTORY" />
          <TabButton label="SKILLS" />
        </div>
      </div>
    </div>
  );
}
