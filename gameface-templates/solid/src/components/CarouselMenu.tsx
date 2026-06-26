import { For } from 'solid-js';
import type { JSX } from 'solid-js';
import type { GameMode } from '../data/types';
import styles from './CarouselMenu.module.scss';

type CarouselCardProps = {
  item: GameMode;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function CarouselCard(props: CarouselCardProps) {
  const backgroundStyle = (): JSX.CSSProperties | undefined => (
    props.item.imageUrl
      ? { 'background-image': `url('${props.item.imageUrl}')` }
      : undefined
  );

  return (
    <button
      type="button"
      onClick={() => props.onSelect(props.item.id)}
      class={`${styles['carousel-card']}${props.isSelected ? ` ${styles['carousel-card--selected']}` : ''}`}
    >
      <div
        class={styles['carousel-card__masked-bg']}
        aria-hidden="true"
        style={backgroundStyle()}
      >
        {!props.isSelected && <div class={styles['carousel-card__shade']} />}
      </div>

      {props.isSelected && <div class={styles['carousel-card__pulsing-border']} aria-hidden="true" />}

      <div class={styles['carousel-card__caption']}>
        <span
          class={`${styles['carousel-card__title']}${props.isSelected ? ` ${styles['carousel-card__title--selected']}` : ''}`}
        >
          {props.item.title}
        </span>
      </div>
    </button>
  );
}

type CarouselMenuProps = {
  items: GameMode[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function CarouselMenu(props: CarouselMenuProps) {
  return (
    <div class={styles['carousel-menu']}>
      <For each={props.items}>
        {(item) => (
          <CarouselCard
            item={item}
            isSelected={item.id === props.selectedId}
            onSelect={props.onSelect}
          />
        )}
      </For>
    </div>
  );
}
