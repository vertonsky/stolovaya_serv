import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Импортируем компоненты страниц
import MenuManagement from "./pages/MenuManagement";  // Управление меню и просмотр
import Cart from "./pages/Cart";                      // Корзина
import HistoryOrder from "./pages/HistoryOrder";      // История заказов
import LoginPage from "./pages/LoginPage";            // Вход
import UserProfile from "./pages/UserProfile";        // Профиль
import Users from "./pages/Users";                    // Управление учениками

function App() {
  return (
    <div>
      {/* Навигационная панель */}
      <nav style={{ 
        padding: '15px', 
        background: '#2c3e50',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <Link to="/users" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>
          🎓 Ученики
        </Link>
        <Link to="/menu-management" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>
          🍽️ Меню
        </Link>
        <Link to="/cart" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>
          🛒 Корзина
        </Link>
        <Link to="/history-order" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>
          📜 История заказов
        </Link>
        <Link to="/login-page" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>
          🔐 Вход
        </Link>
        <Link to="/profile" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>
          👤 Профиль
        </Link>
      </nav>
      
      {/* Определение маршрутов */}
      <Routes>
        <Route path="/" element={<MenuManagement />} />           {/* Главная страница - меню */}
        <Route path="/users" element={<Users />} />               {/* Управление учениками */}
        <Route path="/menu-management" element={<MenuManagement />} /> {/* Меню (дублирует главную) */}
        <Route path="/cart" element={<Cart />} />                 {/* Корзина */}
        <Route path="/history-order" element={<HistoryOrder />} /> {/* История заказов */}
        <Route path="/login-page" element={<LoginPage />} />      {/* Вход */}
        <Route path="/profile" element={<UserProfile />} />       {/* Профиль */}
      </Routes>
    </div>
  );
}

export default App;