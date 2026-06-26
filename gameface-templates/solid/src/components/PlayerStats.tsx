import type { Player } from '../data/types';
import styles from './PlayerStats.module.scss';

type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
  fillModifier: 'health' | 'energy' | 'xp';
};

function ProgressBar(props: ProgressBarProps) {
  const percent = () => Math.round((props.value / props.max) * 100);

  return (
    <div class={styles['progress-bar']}>
      <div class={styles['progress-bar__header']}>
        <span class={styles['progress-bar__label']}>{props.label}</span>
        <span class={styles['progress-bar__value']}>
          {props.value} / {props.max}
        </span>
      </div>
      <div class={styles['progress-bar__track']}>
        <div
          class={`${styles['progress-bar__fill']} ${styles[`progress-bar__fill--${props.fillModifier}`]}`}
          style={{ width: `${percent()}%` }}
        />
      </div>
    </div>
  );
}

type TabButtonProps = {
  label: string;
};

function TabButton(props: TabButtonProps) {
  return (
    <button type="button" class={styles['player-stats__tab-button']}>
      {props.label}
    </button>
  );
}

type PlayerStatsProps = {
  player: Player;
};

export default function PlayerStats(props: PlayerStatsProps) {
  return (
    <div class={styles['player-stats']}>
      <div class={styles['player-stats__panel']}>
        <div class={styles['player-stats__profile-row']}>
          <img
            src={props.player.avatarUrl}
            alt=""
            class={styles['player-stats__avatar']}
          />
          <div class={styles['player-stats__profile-text']}>
            <span class={styles['player-stats__name']}>{props.player.name}</span>
            <span class={styles['player-stats__level']}>LVL {props.player.level}</span>
          </div>
        </div>

        <ProgressBar
          label="HEALTH"
          value={props.player.health}
          max={props.player.maxHealth}
          fillModifier="health"
        />
        <ProgressBar
          label="ENERGY"
          value={props.player.energy}
          max={props.player.maxEnergy}
          fillModifier="energy"
        />
        <ProgressBar
          label="XP"
          value={props.player.xp}
          max={props.player.maxXp}
          fillModifier="xp"
        />

        <div class={styles['player-stats__tabs']}>
          <TabButton label="STATS" />
          <TabButton label="INVENTORY" />
          <TabButton label="SKILLS" />
        </div>
      </div>
    </div>
  );
}
