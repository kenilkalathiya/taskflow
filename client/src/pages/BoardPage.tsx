import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hook/useSocket';
import ListComponent from '../components/ListComponent';
import Header from '../components/Header';
import styles from './BoardPage.module.css';
import { type Card, type List, type BoardData } from '../interfaces/board.interfaces';
import { DndContext, type DragEndEvent, closestCorners } from '@dnd-kit/core';

const BoardPage = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const { userInfo } = useAuth();
  const socket = useSocket('http://localhost:5000');
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');

  // --- Data Fetching and Real-Time Listeners ---
  useEffect(() => {
    if (socket && boardId) {
      socket.emit('joinBoard', boardId);
    }

    if (socket) {
      socket.on('listCreated', (newList: List) => {
        setBoardData(prev => {
          if (!prev || prev.lists.some(l => l._id === newList._id)) return prev;
          return { ...prev, lists: [...prev.lists, { ...newList, cards: [] }] };
        });
      });
      socket.on('cardCreated', (newCard: Card) => {
        addCardToList(newCard.list, newCard);
      });
      socket.on('cardMoved', (newBoardState: BoardData) => {
        setBoardData(newBoardState);
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

  // --- Handler Functions ---
  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !boardId || !userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data: newList } = await axios.post(`/api/boards/${boardId}/lists`, { name: newListName }, config);
      setBoardData(prev => prev ? { ...prev, lists: [...prev.lists, { ...newList, cards: [] }] } : null);
      setNewListName('');
    } catch (error) {
      console.error('Failed to create list', error);
    }
  };

  const addCardToList = (listId: string, newCard: Card) => {
    setBoardData(prev => {
        if (!prev) return null;
        const newLists = prev.lists.map(list => {
          if (list._id === newCard.list) {
            // Avoid adding duplicates
            if (!list.cards.some(card => card._id === newCard._id)) {
              return { ...list, cards: [...list.cards, newCard] };
            }
          }
          return list;
        });
        return { ...prev, lists: newLists };
      });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !boardData) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const newBoardData = JSON.parse(JSON.stringify(boardData)); // Deep copy
    const activeList = newBoardData.lists.find((l: List) => l.cards.some((c: Card) => c._id === activeId));
    const overList = newBoardData.lists.find((l: List) => l._id === overId || l.cards.some((c: Card) => c._id === overId));

    if (!activeList || !overList) return;

    const activeIndex = activeList.cards.findIndex((c: Card) => c._id === activeId);
    const [draggedCard] = activeList.cards.splice(activeIndex, 1);
    
    let overIndex = overList.cards.findIndex((c: Card) => c._id === overId);
    if (overId === overList._id) { // Dropping on the list container
      overIndex = overList.cards.length;
    }

    overList.cards.splice(overIndex, 0, draggedCard);
    setBoardData(newBoardData); // Optimistic UI update

    // API Call to Persist Changes
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      axios.put(`/api/boards/${boardId}/cards/reorder`, {
        sourceListId: activeList._id,
        destListId: overList._id,
        sourceOrder: activeList.cards.map((c: Card) => c._id),
        destOrder: overList.cards.map((c: Card) => c._id),
      }, config);
      
      // Broadcast the new state to other users
      if (socket) {
        socket.emit('cardMoved', { boardId, boardData: newBoardData });
      }
    } catch (error) {
      console.error("Failed to reorder card", error);
      // Optional: Revert UI change on error
    }
  };


  if (loading) return <div>Loading board...</div>;
  if (!boardData) return <div>Board not found.</div>;

  return (
    <div className={styles.boardPage}>
      <Header title={boardData.name} />
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <main className={styles.listsContainer}>
          {boardData.lists.map((list) => (
            <ListComponent
              key={list._id}
              list={list}
              cards={list.cards}
              onCardCreated={(listId, newCard) => addCardToList(listId, newCard)}
            />
          ))}
          <div className={styles.list}>
            <form onSubmit={handleCreateList}>
              <input type="text" placeholder="Enter list title..." value={newListName} onChange={(e) => setNewListName(e.target.value)} />
              <button type="submit" style={{ marginTop: '8px', width: '1hundredpercent' }}>Add List</button>
            </form>
          </div>
        </main>
      </DndContext>
    </div>
  );
};

export default BoardPage;