import { For } from 'solid-js';
import type { Achievement } from '../data/types';
import styles from './Achievements.module.scss';

type AchievementsProps = {
  items: Achievement[];
};

export default function Achievements(props: AchievementsProps) {
  return (
    <div class={styles.achievements}>
      <For each={props.items}>
        {(achievement) => (
          <div class={styles['achievements__card']}>
            <img
              src={achievement.iconUrl}
              alt=""
              class={styles['achievements__icon']}
            />
            <div class={styles['achievements__text']}>
              <span class={styles['achievements__title']}>{achievement.title}</span>
              <span class={styles['achievements__subtitle']}>{achievement.unlockedAt}</span>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
