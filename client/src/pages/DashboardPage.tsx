import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';
import { useSocket } from '../hook/useSocket';

interface Board {
  _id: string;
  name: string;
}

const DashboardPage = () => {
  const { userInfo, logout } = useAuth();
  const socket = useSocket('http://localhost:5000');
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState('');

  const fetchBoards = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get('/api/boards', config);
      setBoards(data);
    } catch (error) {
      console.error("Failed to fetch boards", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchBoards();
    }
  }, [userInfo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // This useEffect will listen for real-time board invitations
  useEffect(() => {
    if (socket) {
      socket.on('addedToBoard', (newBoard: Board) => {
        // Add the new board to the list without a page refresh
        setBoards(prevBoards => [newBoard, ...prevBoards]);
        alert(`You've been added to a new board: ${newBoard.name}`);
      });
    }
    
    // Cleanup the listener
    return () => {
      if (socket) {
        socket.off('addedToBoard');
      }
    };
  }, [socket]);

  const handleCreateBoard = async (e: FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      await axios.post('/api/boards', { name: boardName }, config);
      setBoardName('');
      fetchBoards(); // Refresh the list of boards
    } catch (error) {
      console.error("Failed to create board", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>TaskFlow Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.formContainer}>
          <h2>Create a New Board</h2>
          <form onSubmit={handleCreateBoard}>
            <input
              type="text"
              placeholder="Enter board name..."
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              required
            />
            <button type="submit" className={styles.createButton}>Create</button>
          </form>
        </div>
        
        <h2>Your Boards</h2>
        <div className={styles.boardGrid}>
          {boards.map((board) => (
            <Link key={board._id} to={`/boards/${board._id}`} className={styles.boardCard}>
              {board.name}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;