import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hook/useSocket';
import ListComponent from '../components/ListComponent';
import Header from '../components/Header';
import styles from './BoardPage.module.css';
import { type Card, type List, type BoardData } from '../interfaces/board.interfaces';



const BoardPage = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const { userInfo } = useAuth();
  const socket = useSocket('http://localhost:5000');
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (socket && boardId) {
      socket.emit('joinBoard', boardId);
    }

    if (socket) {
      // ✅ FIX IS HERE: This listener now checks for duplicates
      socket.on('listCreated', (newList: List) => {
        setBoardData(prevBoard => {
          if (!prevBoard) return null;
          // Check if a list with this ID already exists
          const listExists = prevBoard.lists.some(list => list._id === newList._id);
          // If it exists, do nothing. Otherwise, add it.
          if (listExists) {
            return prevBoard;
          }
          return { ...prevBoard, lists: [...prevBoard.lists, { ...newList, cards: [] }] };
        });
      });

      socket.on('cardCreated', (newCard: Card) => {
        setBoardData(prevBoard => {
          if (!prevBoard) return null;
          const cardExists = prevBoard.lists.some(list => 
            list.cards.some(card => card._id === newCard._id)
          );
          if (cardExists) {
            return prevBoard;
          }
          const newLists = prevBoard.lists.map(list => {
            if (list._id === newCard.list) {
              return { ...list, cards: [...list.cards, newCard] };
            }
            return list;
          });
          return { ...prevBoard, lists: newLists };
        });
      });
    }

    const fetchBoardData = async () => {
      if (!userInfo || !boardId) return;
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/boards/${boardId}`, config);
        setBoardData(data);
      } catch (error) {
        console.error("Failed to fetch board data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();

    return () => {
      if (socket) {
        socket.off('listCreated');
        socket.off('cardCreated');
      }
    };
  }, [boardId, userInfo, socket]);
  
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !boardId || !userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data: newList } = await axios.post(`/api/boards/${boardId}/lists`, { name: newListName }, config);
      // This is our "optimistic" update for a fast UI
      setBoardData(prevBoard => {
        if (!prevBoard) return null;
        return { ...prevBoard, lists: [...prevBoard.lists, { ...newList, cards: [] }] };
      });
      setNewListName('');
    } catch (error) {
      console.error('Failed to create list', error);
    }
  };

  const addCardToList = (listId: string, newCard: Card) => {
    setBoardData(prevBoard => {
      if (!prevBoard) return null;
      const newLists = prevBoard.lists.map(list => {
        if (list._id === listId) {
          return { ...list, cards: [...list.cards, newCard] };
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
  };

  if (loading) return <div>Loading board...</div>;
  if (!boardData) return <div>Board not found. <Link to="/dashboard">Go back to dashboard.</Link></div>;

  return (
    <div className={styles.boardPage}>
      <Header title={boardData.name} />
      <main className={styles.listsContainer}>
        {boardData.lists.map((list) => (
          <ListComponent 
            key={list._id} 
            list={list}
            onCardCreated={addCardToList} 
          />
        ))}
        {/* Form to create new lists */}
        <div className={styles.list}>
          <form onSubmit={handleCreateList}>
            <input
              type="text"
              placeholder="Enter list title..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <button type="submit" style={{ marginTop: '8px', width: '100%' }}>Add List</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BoardPage;