import type { CSSProperties } from 'react';
import type { GameMode } from '../data/types';
import styles from './CarouselMenu.module.scss';

type CarouselCardProps = {
  item: GameMode;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function CarouselCard({ item, isSelected, onSelect }: CarouselCardProps) {
  const backgroundStyle: CSSProperties | undefined = item.imageUrl
    ? { backgroundImage: `url('${item.imageUrl}')` }
    : undefined;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`${styles['carousel-card']}${isSelected ? ` ${styles['carousel-card--selected']}` : ''}`}
    >
      <div
        className={styles['carousel-card__masked-bg']}
        aria-hidden="true"
        style={backgroundStyle}
      >
        {!isSelected && <div className={styles['carousel-card__shade']} />}
      </div>

      {isSelected && <div className={styles['carousel-card__pulsing-border']} aria-hidden="true" />}

      <div className={styles['carousel-card__caption']}>
        <span
          className={`${styles['carousel-card__title']}${isSelected ? ` ${styles['carousel-card__title--selected']}` : ''}`}
        >
          {item.title}
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

export default function CarouselMenu({ items, selectedId, onSelect }: CarouselMenuProps) {
  return (
    <div className={styles['carousel-menu']}>
      {items.map((item) => (
        <CarouselCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
