import type { Achievement } from '../data/types';
import styles from './Achievements.module.scss';

type AchievementsProps = {
  items: Achievement[];
};

export default function Achievements({ items }: AchievementsProps) {
  return (
    <div className={styles.achievements}>
      {items.map((achievement) => (
        <div key={achievement.id} className={styles['achievements__card']}>
          <img
            src={achievement.iconUrl}
            alt=""
            className={styles['achievements__icon']}
          />
          <div className={styles['achievements__text']}>
            <span className={styles['achievements__title']}>{achievement.title}</span>
            <span className={styles['achievements__subtitle']}>{achievement.unlockedAt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
