import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CardComponent from './CardComponent';
import styles from './ListComponent.module.css';
import { type Card, type List } from '../interfaces/board.interfaces';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface ListComponentProps {
  list: List;
  cards: Card[];
  onCardCreated: (listId: string, newCard: Card) => void;
  // onDataChange: () => void;
}

const ListComponent: React.FC<ListComponentProps> = ({ list, cards, onCardCreated }) => {
  const { setNodeRef } = useDroppable({ id: list._id });
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
      // onCardCreated();
    } catch (error) {
      console.error('Failed to create card', error);
    }
  };

  return (
    <div className={styles.list}>
      <h3 className={styles.listHeader}>{list.name}</h3>
      <SortableContext id={list._id} items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={styles.cardsContainer}>
          {cards.map((card) => (
            <CardComponent key={card._id} card={card} />
          ))}
        </div>
      </SortableContext>
      <form onSubmit={handleCreateCard} className={styles.addCardForm}>
        <input type="text" placeholder="Enter a title for this card..." value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} />
        <button type="submit">Add Card</button>
      </form>
    </div>
  );
};

export default ListComponent;