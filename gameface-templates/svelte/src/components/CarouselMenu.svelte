<script lang="ts">
  import type { GameMode } from '../data/types';
  import styles from './CarouselMenu.module.scss';
  import CarouselCard from './CarouselCard.svelte';

  let {
    items,
    selectedId,
    onSelect,
  }: {
    items: GameMode[];
    selectedId: string;
    onSelect: (id: string) => void;
  } = $props();
</script>

<div class={styles['carousel-menu']}>
  {#each items as item (item.id)}
    <CarouselCard
      {item}
      isSelected={item.id === selectedId}
      {onSelect}
    />
  {/each}
</div>
