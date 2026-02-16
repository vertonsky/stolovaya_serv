import React, { useState, useEffect, useRef } from 'react';
import pb from '../pocketbase';

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    ingredients: '',
    category: 'супы',
    weight: '',
    price: '',
    imageFile: null,
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url', 'file', or 'none'
  
  const fileInputRef = useRef(null);

  const categoryOptions = [
    'супы', 'салаты', 'основные блюда', 'гарниры', 'десерты', 'напитки'
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

  // Загрузка блюд из меню
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('PocketBase сервер не доступен!');
      }
      
      // ВАЖНО: Изменяем название коллекции с 'menu' на 'dishes'
      const records = await pb.collection('dishes').getFullList({
        sort: 'category,name',
        $autoCancel: false
      });
      
      setMenuItems(records);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(`Не могу подключиться к PocketBase! Проверьте:\n1. PocketBase сервер доступен\n2. База данных "dishes" существует\n\nОшибка: ${error.message}`);
      
      // Тестовые данные для демонстрации
      setMenuItems([
        { 
          id: 'test1', 
          name: 'Суп картофельный с бобовыми', 
          description: 'Наваристый суп с горохом и зеленью',
          ingredients: 'Картофель, горох, лук, морковь, зелень, специи',
          category: 'супы', 
          weight: '200 г',
          price: '55',
          image: ''
        },
        { 
          id: 'test2', 
          name: 'Салат из свежих помидор и огурцов', 
          description: 'Свежий овощной салат',
          ingredients: 'Помидоры, огурцы, лук, зелень, растительное масло, соль',
          category: 'салаты', 
          weight: '100 г',
          price: '65',
          image: ''
        },
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  // Обработка выбора файла
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMenuItem({ ...newMenuItem, imageFile: file, imageUrl: '' });
      
      // Создание предпросмотра
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработка изменения URL изображения
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setNewMenuItem({ ...newMenuItem, imageUrl: url, imageFile: null });
    setImagePreview(url);
  };

  // Очистка изображения
  const clearImage = () => {
    setNewMenuItem({ ...newMenuItem, imageFile: null, imageUrl: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Добавление нового блюда
  const addMenuItem = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Валидация
      if (!newMenuItem.name.trim()) {
        alert('Введите название блюда!');
        return;
      }
      
      if (!newMenuItem.description.trim()) {
        alert('Введите описание блюда!');
        return;
      }
      
      if (!newMenuItem.ingredients.trim()) {
        alert('Введите состав блюда!');
        return;
      }
      
      if (!newMenuItem.weight.trim()) {
        alert('Введите вес порции!');
        return;
      }
      
      if (!newMenuItem.price.trim()) {
        alert('Введите цену!');
        return;
      }
      
      const price = parseFloat(newMenuItem.price);
      if (isNaN(price)) {
        alert('Цена должна быть числом! Например: 100');
        return;
      }

      const connected = await checkConnection();
      if (!connected) {
        throw new Error('PocketBase сервер не доступен');
      }

      // Подготавливаем данные для отправки
      const formData = new FormData();
      formData.append('name', newMenuItem.name);
      formData.append('description', newMenuItem.description);
      formData.append('ingredients', newMenuItem.ingredients);
      formData.append('category', newMenuItem.category);
      formData.append('weight', newMenuItem.weight);
      formData.append('price', price); // Число, а не строка
      
      // Добавляем изображение, если есть
      if (newMenuItem.imageFile) {
        formData.append('image', newMenuItem.imageFile);
      } else if (newMenuItem.imageUrl) {
        // Для URL создаем отдельное поле или сохраняем в description
        formData.append('image_url', newMenuItem.imageUrl);
      }

      // ВАЖНО: Изменяем название коллекции с 'menu' на 'dishes'
      let record;
      if (newMenuItem.imageFile) {
        // Если есть файл, используем FormData
        record = await pb.collection('dishes').create(formData);
      } else {
        // Если нет файла, используем обычный объект
        const data = {
          name: newMenuItem.name,
          description: newMenuItem.description,
          ingredients: newMenuItem.ingredients,
          category: newMenuItem.category,
          weight: newMenuItem.weight,
          price: price
        };
        
        // Добавляем URL изображения, если он есть
        if (newMenuItem.imageUrl) {
          data.image_url = newMenuItem.imageUrl;
        }
        
        record = await pb.collection('dishes').create(data);
      }
      
      alert(`✅ Блюдо "${record.name}" добавлено в меню!`);
      
      // Сброс формы
      setNewMenuItem({
        name: '',
        description: '',
        ingredients: '',
        category: 'супы',
        weight: '',
        price: '',
        imageFile: null,
        imageUrl: ''
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Обновляем список
      loadMenuItems();
      
    } catch (error) {
      console.error('Ошибка добавления:', error);
      
      // Более информативные сообщения об ошибках
      if (error.status === 400) {
        alert('❌ Ошибка валидации данных. Проверьте заполнение полей.');
      } else if (error.message.includes('not found')) {
        alert('❌ Ошибка: Коллекция "dishes" не найдена в PocketBase!');
      } else {
        alert(`❌ Ошибка: ${error.message}`);
      }
    }
  };

  // Удаление блюда
  const deleteMenuItem = async (id, name) => {
    if (!window.confirm(`Вы уверены, что хотите удалить блюдо "${name}" из меню?`)) {
      return;
    }

    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('PocketBase сервер не доступен');
      }

      // ВАЖНО: Изменяем название коллекции с 'menu' на 'dishes'
      await pb.collection('dishes').delete(id);
      
      alert('✅ Блюдо удалено из меню!');
      
      loadMenuItems();
      
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert(`❌ Ошибка PocketBase: ${error.message}`);
    }
  };

  // Фильтрация блюд
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = search === '' || 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.ingredients?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Статистика по категориям
  const categoryStats = {};
  menuItems.forEach(item => {
    if (item.category) {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    }
  });

  // Получение URL изображения
  const getImageUrl = (item) => {
    if (!item) return '';
    
    // Если есть поле image и это файл PocketBase
    if (item.image && typeof item.image === 'string') {
      return `https://pb.dev.zavidovo.school/api/files/dishes/${item.id}/${item.image}`;
    }
    
    // Если есть image_url
    if (item.image_url) {
      return item.image_url;
    }
    
    // Если есть поле с именем 'photo' или другим
    if (item.photo) {
      return `https://pb.dev.zavidovo.school/api/files/dishes/${item.id}/${item.photo}`;
    }
    
    return '';
  };

  // Проверка полей в консоли
  useEffect(() => {
    if (menuItems.length > 0) {
      console.log('Первая запись блюда:', menuItems[0]);
      console.log('Доступные поля:', Object.keys(menuItems[0]));
    }
  }, [menuItems]);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Подключение к PocketBase...</p>
        <p className="text-muted small">База данных: dishes</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Заголовок и статус */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-primary mb-1">🍽️ Управление меню</h1>
          <p className="text-muted mb-0">
            PocketBase • Всего блюд: <strong>{menuItems.length}</strong>
            {isConnected ? (
              <span className="badge bg-success ms-2">✓ Подключено</span>
            ) : (
              <span className="badge bg-danger ms-2">✗ Нет подключения</span>
            )}
          </p>
        </div>
        <div>
          <a 
            href="https://pb.dev.zavidovo.school/_/" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-outline-primary btn-sm me-2"
            title="Открыть админку PocketBase"
          >
            📊 Админка
          </a>
          <button
            onClick={loadMenuItems}
            className="btn btn-outline-secondary btn-sm"
            title="Обновить данные"
          >
            🔄 Обновить
          </button>
        </div>
      </div>

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

      <div className="card bg-info text-white mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">PocketBase База данных</h5>
              <p className="card-text mb-0 small">
                Сервер: <strong>https://pb.dev.zavidovo.school</strong> • Коллекция: <strong>dishes</strong>
              </p>
            </div>
            <div className="text-end">
              <div className="small">Категорий: {Object.keys(categoryStats).length}</div>
              <div className="small">Всего блюд: {menuItems.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Форма добавления блюда */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">➕ Добавить новое блюдо в меню</h5>
        </div>
        <div className="card-body">
          <form onSubmit={addMenuItem}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Название блюда *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Например: Суп картофельный"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  required
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Категория *</label>
                <select
                  className="form-select"
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  disabled={!isConnected}
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-12">
                <label className="form-label">Описание блюда *</label>
                <textarea
                  className="form-control"
                  placeholder="Краткое описание блюда..."
                  rows="2"
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                  required
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-12">
                <label className="form-label">Состав (ингредиенты) *</label>
                <textarea
                  className="form-control"
                  placeholder="Перечислите ингредиенты через запятую..."
                  rows="2"
                  value={newMenuItem.ingredients}
                  onChange={(e) => setNewMenuItem({...newMenuItem, ingredients: e.target.value})}
                  required
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Вес порции *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Например: 200 г"
                  value={newMenuItem.weight}
                  onChange={(e) => setNewMenuItem({...newMenuItem, weight: e.target.value})}
                  required
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Цена (в рублях) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Например: 100"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  disabled={!isConnected}
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Изображение блюда</label>
                
                <div className="d-flex gap-2 mb-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${imageInputMode === 'file' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setImageInputMode('file')}
                    disabled={!isConnected}
                  >
                    📁 Загрузить файл
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageInputMode === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setImageInputMode('url')}
                    disabled={!isConnected}
                  >
                    🔗 Вставить ссылку
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={clearImage}
                    disabled={!isConnected}
                  >
                    ✖️ Очистить
                  </button>
                </div>
                
                {imageInputMode === 'file' && (
                  <div className="mb-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={!isConnected}
                    />
                    <small className="text-muted">Поддерживаемые форматы: JPG, PNG, GIF, WebP</small>
                  </div>
                )}
                
                {imageInputMode === 'url' && (
                  <div className="mb-2">
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      placeholder="https://example.com/image.jpg"
                      value={newMenuItem.imageUrl}
                      onChange={handleImageUrlChange}
                      disabled={!isConnected}
                    />
                    <small className="text-muted">Введите полный URL изображения</small>
                  </div>
                )}
                
                {imagePreview && (
                  <div className="mt-3">
                    <p className="mb-1 small">Предпросмотр:</p>
                    <div className="border rounded p-2 bg-light">
                      <img 
                        src={imagePreview} 
                        alt="Предпросмотр" 
                        className="img-fluid rounded"
                        style={{ maxHeight: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Ошибка+загрузки';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              type="submit"
              className="btn btn-success w-100 py-2"
              disabled={!isConnected}
            >
              {isConnected ? '📝 Добавить в меню' : '⏳ Ожидание подключения...'}
            </button>
            
            {!isConnected && (
              <div className="alert alert-danger mt-3 mb-0">
                <small>
                  ❌ PocketBase не доступен. Проверьте подключение к интернету.
                </small>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Остальной код остается таким же, но обновляем URL для изображений */}
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">📋 Список блюд из PocketBase</h5>
            <small className="text-muted">
              {filteredMenuItems.length === menuItems.length 
                ? `Все блюда (${menuItems.length})`
                : `Показано: ${filteredMenuItems.length} из ${menuItems.length}`
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
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <span className="display-1 text-muted">📭</span>
              </div>
              <h5>Ничего не найдено</h5>
              <p className="text-muted">
                {menuItems.length === 0 
                  ? 'Меню пусто. Добавьте первое блюдо!'
                  : 'Попробуйте изменить поисковый запрос или выберите другую категорию'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="80">Изображение</th>
                    <th width="150">Название</th>
                    <th width="150">Описание</th>
                    <th width="180">Состав</th>
                    <th width="100">Категория</th>
                    <th width="80">Вес</th>
                    <th width="80">Цена</th>
                    <th width="100">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuItems.map(item => {
                    const imageUrl = getImageUrl(item);
                    return (
                      <tr key={item.id}>
                        <td>
                          {imageUrl ? (
                            <div className="position-relative" style={{ width: '60px', height: '60px' }}>
                              <img 
                                src={imageUrl}
                                alt={item.name}
                                className="img-fluid rounded border"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/60/FF6B6B/FFFFFF?text=No+Img';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                 style={{ width: '60px', height: '60px' }}>
                              <span className="text-muted">🖼️</span>
                            </div>
                          )}
                        </td>
                        <td className="fw-bold">{item.name || '—'}</td>
                        <td>
                          <small className="text-muted">{item.description || '—'}</small>
                        </td>
                        <td>
                          <small>{item.ingredients || '—'}</small>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.category === 'супы' ? 'bg-info' :
                            item.category === 'салаты' ? 'bg-success' :
                            item.category === 'основные блюда' ? 'bg-warning' :
                            item.category === 'гарниры' ? 'bg-secondary' :
                            item.category === 'десерты' ? 'bg-danger' :
                            'bg-primary'
                          } p-2`}>
                            {item.category || '—'}
                          </span>
                        </td>
                        <td>{item.weight || '—'}</td>
                        <td>
                          <strong className="text-success">{item.price || '—'} ₽</strong>
                        </td>
                        <td>
                          <button
                            onClick={() => deleteMenuItem(item.id, item.name)}
                            className="btn btn-outline-danger btn-sm"
                            title="Удалить блюдо"
                            disabled={!isConnected}
                          >
                            🗑️ Удалить
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuManagement;