<script lang="ts">
  import type { Achievement } from "../data/types";
  import styles from "./Achievements.module.scss";

  let { items }: { items: Achievement[] } = $props();
</script>

<div class={styles.achievements}>
  {#each items as achievement (achievement.id)}
    <div class={styles['achievements__card']}>
      <img src={achievement.iconUrl} alt="" class={styles['achievements__icon']} />
      <div class={styles['achievements__text']}>
        <span class={styles['achievements__title']}>{@html achievement.title}</span>
        <span class={styles['achievements__subtitle']}>{@html achievement.unlockedAt}</span>
      </div>
    </div>
  {/each}
</div>
