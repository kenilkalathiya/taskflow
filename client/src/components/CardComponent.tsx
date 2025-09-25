import React from 'react';
import styles from './CardComponent.module.css';

interface Card {
  _id: string;
  title: string;
}

interface CardComponentProps {
  card: Card;
}

const CardComponent: React.FC<CardComponentProps> = ({ card }) => {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>{card.title}</p>
    </div>
  );
};

export default CardComponent;