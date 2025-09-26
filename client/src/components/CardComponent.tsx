import React from 'react';
import styles from './CardComponent.module.css';
import { type Card } from '../interfaces/board.interfaces';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardComponentProps {
  card: Card;
}

const CardComponent: React.FC<CardComponentProps> = ({ card }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.card}>
      <p className={styles.cardTitle}>{card.title}</p>
    </div>
  );
};

export default CardComponent;