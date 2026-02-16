import React, { useState, useEffect } from 'react';
import pb from '../pocketbase';  // Импорт PocketBase из src/pb.js

function Users() {
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    class: '5а',
    student_id: ''
  });
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Опции для классов
  const classOptions = [
    '5а', '5б', '5в', '5г',
    '6а', '6б', '6в',
    '7а', '7б', '7в',
    '8а', '8б',
    '9а', '9б',
    '10', '11'
  ];

  // Проверка подключения к PocketBase
 const checkConnection = async () => {
    try {
      await pb.health.check();
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('PocketBase не доступен:', error);
      setIsConnected(false);
      return false;
    }
  };

  // Загрузка пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Проверяем подключение
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('PocketBase сервер не доступен!');
      }
      
      // Получаем данные из PocketBase
      const records = await pb.collection('users').getFullList({
        sort: 'class,last_name',
        $autoCancel: false
      });
      
      setUsers(records);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(`Не могу подключиться к PocketBase! Проверьте:\n1. PocketBase запущен (порт 8090)\n2. База данных "users" существует\n\nОшибка: ${error.message}`);
      
      // Тестовые данные для демонстрации
      setUsers([
        { id: 'test1', student_id: '101', first_name: 'Иван', last_name: 'Петров', class: '5а' },
        { id: 'test2', student_id: '102', first_name: 'Мария', last_name: 'Сидорова', class: '5а' },
        { id: 'test3', student_id: '103', first_name: 'Алексей', last_name: 'Иванов', class: '6б' },
        { id: 'test4', student_id: '104', first_name: 'Елена', last_name: 'Кузнецова', class: '6б' },
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadUsers();
  }, []);

  // Добавление нового пользователя
  const addUser = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Валидация
      if (!newUser.first_name.trim()) {
        alert('Введите имя ученика!');
        return;
      }
      
      if (!newUser.last_name.trim()) {
        alert('Введите фамилию ученика!');
        return;
      }
      
      if (!newUser.student_id.trim()) {
        alert('Введите ID номер ученика!');
        return;
      }
      
      const studentId = parseInt(newUser.student_id);
      if (isNaN(studentId)) {
        alert('ID должен быть числом! Например: 123');
        return;
      }

      // Проверяем подключение
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('PocketBase сервер не доступен');
      }

      // Создаем запись в PocketBase
      const record = await pb.collection('users').create({
        student_id: newUser.student_id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        class: newUser.class
      });
      
      alert(`✅ Ученик ${record.first_name} ${record.last_name} добавлен в PocketBase!`);
      
      // Сброс формы
      setNewUser({
        first_name: '',
        last_name: '',
        class: '5а',
        student_id: ''
      });
      
      // Обновляем список
      loadUsers();
      
    } catch (error) {
      console.error('Ошибка добавления:', error);
      
      if (error.message.includes('UNIQUE')) {
        alert('❌ Ошибка: Ученик с таким ID уже существует!');
      } else if (error.message.includes('not found')) {
        alert('❌ Ошибка: Коллекция "users" не найдена в PocketBase!');
      } else {
        alert(`❌ Ошибка PocketBase: ${error.message}`);
      }
    }
  };

  // Удаление пользователя
  const deleteUser = async (id, name) => {
    if (!window.confirm(`Вы уверены, что хотите удалить ученика "${name}" из базы данных?`)) {
      return;
    }

    try {
      // Проверяем подключение
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('PocketBase сервер не доступен');
      }

      // Удаляем запись из PocketBase
      await pb.collection('users').delete(id);
      
      alert('✅ Ученик удален из PocketBase!');
      
      // Обновляем список
      loadUsers();
      
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert(`❌ Ошибка PocketBase: ${error.message}`);
    }
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = search === '' || 
      user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      (user.student_id && user.student_id.toString().includes(search));
    
    const matchesClass = selectedClass === 'all' || user.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // Статистика по классам
  const classStats = {};
  users.forEach(user => {
    if (user.class) {
      classStats[user.class] = (classStats[user.class] || 0) + 1;
    }
  });

  // Отображение загрузки
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Подключение к PocketBase...</p>
        <p className="text-muted small">База данных: users</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Заголовок и статус */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-primary mb-1">🎓 Ученики школы</h1>
          <p className="text-muted mb-0">
            PocketBase • Всего учеников: <strong>{users.length}</strong>
            {isConnected ? (
              <span className="badge bg-success ms-2">✓ Подключено</span>
            ) : (
              <span className="badge bg-danger ms-2">✗ Нет подключения</span>
            )}
          </p>
        </div>
        <div>
          <a 
            href="http://127.0.0.1:8090/_/" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-outline-primary btn-sm me-2"
            title="Открыть админку PocketBase"
          >
            📊 Админка
          </a>
          <button
            onClick={loadUsers}
            className="btn btn-outline-secondary btn-sm"
            title="Обновить данные"
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <div className="d-flex">
            <div className="me-3">⚠️</div>
            <div>
              <strong>Проблема с подключением!</strong>
              <div className="mt-1 small">{error.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Информация о PocketBase */}
      <div className="card bg-info text-white mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">PocketBase База данных</h5>
              <p className="card-text mb-0 small">
                Сервер: <strong>http://127.0.0.1:8090</strong> • Коллекция: <strong>users</strong>
              </p>
            </div>
            <div className="text-end">
              <div className="small">ID учеников: {users.filter(u => u.student_id).length}</div>
              <div className="small">Классов: {Object.keys(classStats).length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Форма добавления ученика */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">➕ Добавить нового ученика в PocketBase</h5>
        </div>
        <div className="card-body">
          <form onSubmit={addUser}>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label">Имя *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Иван"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  required
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Фамилия *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Петров"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  required
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Класс *</label>
                <select
                  className="form-select"
                  value={newUser.class}
                  onChange={(e) => setNewUser({...newUser, class: e.target.value})}
                  disabled={!isConnected}
                >
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label">ID номер *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123"
                  value={newUser.student_id}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setNewUser({...newUser, student_id: value});
                  }}
                  required
                  pattern="\d+"
                  title="Только цифры"
                  disabled={!isConnected}
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="btn btn-success w-100 py-2"
              disabled={!isConnected}
            >
              {isConnected ? '📝 Добавить в PocketBase' : '⏳ Ожидание подключения...'}
            </button>
            
            {!isConnected && (
              <div className="alert alert-danger mt-3 mb-0">
                <small>
                  ❌ PocketBase не доступен. Запустите сервер: <code>pocketbase.exe serve</code>
                </small>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">🔍 Поиск и фильтрация</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Поиск по имени, фамилии или ID:</label>
              <div className="input-group">
                <span className="input-group-text">🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Начните вводить для поиска..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setSearch('')}
                >
                  ❌
                </button>
              </div>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Фильтр по классу:</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">Все классы</option>
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>{cls} класс</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика по классам */}
      {Object.keys(classStats).length > 0 && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h6 className="card-title mb-3">📊 Статистика по классам (PocketBase)</h6>
            <div className="d-flex flex-wrap gap-2">
              {Object.entries(classStats)
                .sort(([classA], [classB]) => classA.localeCompare(classB))
                .map(([cls, count]) => (
                  <button
                    key={cls}
                    type="button"
                    className={`btn ${selectedClass === cls ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                    onClick={() => setSelectedClass(cls === selectedClass ? 'all' : cls)}
                    title={`Показать ${cls} класс (${count} учеников)`}
                  >
                    {cls}: <span className="badge bg-light text-dark ms-1">{count}</span>
                  </button>
                ))}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedClass('all')}
                disabled={selectedClass === 'all'}
              >
                Все классы
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список учеников */}
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">📋 Список учеников из PocketBase</h5>
            <small className="text-muted">
              {filteredUsers.length === users.length 
                ? `Все ученики (${users.length})`
                : `Показано: ${filteredUsers.length} из ${users.length}`
              }
            </small>
          </div>
          <div>
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? '✓ Подключено' : '✗ Отключено'}
            </span>
          </div>
        </div>
        
        <div className="card-body">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <span className="display-1 text-muted">📭</span>
              </div>
              <h5>Ничего не найдено</h5>
              <p className="text-muted">
                {users.length === 0 
                  ? 'База данных пуста. Добавьте первого ученика!'
                  : 'Попробуйте изменить поисковый запрос или выберите другой класс'}
              </p>
              {users.length === 0 && (
                <button 
                  onClick={() => {
                    setNewUser({
                      first_name: 'Иван',
                      last_name: 'Петров',
                      class: '5а',
                      student_id: '101'
                    });
                  }}
                  className="btn btn-primary"
                >
                  📝 Добавить пример
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="100">ID</th>
                    <th>Фамилия</th>
                    <th>Имя</th>
                    <th width="120">Класс</th>
                    <th width="140">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <code className="bg-light p-1 rounded border">
                          {user.student_id || '—'}
                        </code>
                      </td>
                      <td className="fw-bold">{user.last_name || '—'}</td>
                      <td>{user.first_name || '—'}</td>
                      <td>
                        <span className={`badge ${user.class === '10' || user.class === '11' ? 'bg-danger' : 'bg-success'} p-2`}>
                          {user.class || '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                          className="btn btn-outline-danger btn-sm"
                          title="Удалить ученика"
                          disabled={!isConnected}
                        >
                          🗑️ Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Инструкция по PocketBase */}
      <div className="alert alert-info mt-4">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <span className="fs-4">📦</span>
          </div>
          <div>
            <h5 className="alert-heading">Инструкция по PocketBase</h5>
            <p className="mb-2">
              Это приложение использует <strong>PocketBase</strong> как базу данных.
              Все изменения сохраняются в коллекции <code>users</code>.
            </p>
            <hr />
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1"><strong>Для запуска PocketBase:</strong></p>
                <ol className="mb-0 small">
                  <li>Откройте терминал в папке <code>pocketbase</code></li>
                  <li>Выполните: <code>.\pocketbase.exe serve</code></li>
                  <li>Должно появиться: <code>Server started at http://127.0.0.1:8090</code></li>
                </ol>
              </div>
              <div className="col-md-6">
                <p className="mb-1"><strong>Полезные ссылки:</strong></p>
                <ul className="mb-0 small">
                  <li>
                    <a href="http://127.0.0.1:8090/_/" target="_blank" rel="noreferrer">
                      📊 Админка PocketBase
                    </a>
                  </li>
                  <li>
                    <a href="http://127.0.0.1:8090/api/collections/users/records" target="_blank" rel="noreferrer">
                      🔗 API пользователей (JSON)
                    </a>
                  </li>
                  <li>
                    <a href="https://pocketbase.io/docs" target="_blank" rel="noreferrer">
                      📚 Документация PocketBase
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;