import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CardComponent from './CardComponent';
import styles from './ListComponent.module.css';
import { type Card, type List } from '../interfaces/board.interfaces';

interface ListComponentProps {
  list: List;
  onCardCreated: (listId: string, newCard: Card) => void;
}

const ListComponent: React.FC<ListComponentProps> = ({ list, onCardCreated }) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const { userInfo } = useAuth();

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data: newCard } = await axios.post(`/api/lists/${list._id}/cards`, { title: newCardTitle }, config);
      onCardCreated(list._id, newCard);
      setNewCardTitle('');
    } catch (error) {
      console.error('Failed to create card', error);
    }
  };

  return (
    <div className={styles.list}>
      <h3 className={styles.listHeader}>{list.name}</h3>
      <div className={styles.cardsContainer}>
        {list.cards.map((card) => (
          <CardComponent key={card._id} card={card} />
        ))}
      </div>
      <form onSubmit={handleCreateCard} className={styles.addCardForm}>
        <input
          type="text"
          placeholder="Enter a title for this card..."
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
        />
        <button type="submit">Add Card</button>
      </form>
    </div>
  );
};

export default ListComponent;