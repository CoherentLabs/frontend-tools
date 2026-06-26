<script lang="ts">
  import type { GameMode } from '../data/types';
  import styles from './CarouselMenu.module.scss';

  let {
    item,
    isSelected,
    onSelect,
  }: {
    item: GameMode;
    isSelected: boolean;
    onSelect: (id: string) => void;
  } = $props();
</script>

<button
  type="button"
  class="{styles['carousel-card']}{isSelected ? ` ${styles['carousel-card--selected']}` : ''}"
  onclickcapture={() => onSelect(item.id)}
>
  <div
    class={styles['carousel-card__masked-bg']}
    aria-hidden="true"
    style={item.imageUrl ? `background-image: url('${item.imageUrl}')` : undefined}
  >
    {#if !isSelected}
      <div class={styles['carousel-card__shade']}></div>
    {/if}
  </div>

  {#if isSelected}
    <div class={styles['carousel-card__pulsing-border']} aria-hidden="true"></div>
  {/if}

  <div class={styles['carousel-card__caption']}>
    <span class="{styles['carousel-card__title']}{isSelected ? ` ${styles['carousel-card__title--selected']}` : ''}">
      {@html item.title}
    </span>
  </div>
</button>
