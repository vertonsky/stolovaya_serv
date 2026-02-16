import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function TestPage2() {
  const navigate = useNavigate();
  
  // Данные блюд (должны совпадать с TestPage.jsx)
  const menuItems = [
    {
      id: 1,
      name: "Суп картофельный с бобовыми",
      description: "С горохом",
      weight: "200 г",
      price: 55,
      image: "https://main-cdn.sbermegamarket.ru/big1/hlr-system/156/312/944/111/623/27/100045246787b0.jpg",
    },
    {
      id: 2,
      name: "Салат из свежих помидор и огурцов",
      description: "Овощной салат",
      weight: "100 г",
      price: 65,
      image: "https://avatars.mds.yandex.net/i?id=929e6dd2bd2ca1cc8a5d29a62d62e6bfb4709a90-5255540-images-thumbs&n=13",
    },
    {
      id: 3,
      name: "Салат Цезарь",
      description: "Классический",
      weight: "120 г",
      price: 80,
      image: "https://images-foodtech.magnit.ru/8g3vTR3-SR0-jFPIFjTLplegPoabO_JQbeHKoLXjZI8/rs:fit:1600:1600/plain/s3:/img-dostavka/uf/311/31144c68beed8ef8a6c9d03c33de791c/05f7d67d24f6f9d6b8c96e71cb5a84fd.jpeg@webp",
    },
    {
      id: 4,
      name: "Пирожное «Чоко пай»",
      description: "Шоколадное пирожное",
      weight: "28 г",
      price: 25,
      image: "https://coffeespace.ru/upload/iblock/cf9/jek2k039jp34ixryo6ibkgl1d28b7lsw.jpg",
    }
  ];

  const [cart, setCart] = useState([]);

  // Загружаем корзину из localStorage при загрузке страницы
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Общая сумма корзины
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Увеличение количества товара
  const increaseQuantity = (id) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Уменьшение количества товара
  const decreaseQuantity = (id) => {
    setCart(cart.map(item => 
      item.id === id && item.quantity > 1 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };

  // Удаление товара из корзины
  const removeItem = (id) => {
    if (window.confirm('Удалить этот товар из корзины?')) {
      setCart(cart.filter(item => item.id !== id));
    }
  };

  // Очистка всей корзины
  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Очистить всю корзину?')) {
      setCart([]);
    }
  };

  // Оформление заказа
  const checkout = () => {
    if (cart.length === 0) {
      alert('Корзина пуста! Добавьте товары перед оформлением заказа.');
      return;
    }

    alert(`✅ Заказ оформлен! Сумма: ${totalAmount} ₽`);
    setCart([]);
  };

  // Добавление товара из меню
  const addFromMenu = (itemId) => {
    const menuItem = menuItems.find(item => item.id === itemId);
    if (!menuItem) return;

    // Проверяем, есть ли товар уже в корзине
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
      // Увеличиваем количество
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Добавляем новый товар
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
    
    alert(`"${menuItem.name}" добавлен в корзину!`);
  };

  return (
    <div className="container mt-4">
      {/* Заголовок */}
      <div className="text-center mb-4">
        <h1 className="text-primary">🛒 Корзина покупок</h1>
        <p className="text-muted">Ваши выбранные блюда</p>
      </div>

      {/* Основной контент */}
      <div className="row">
        {/* Левая часть - список товаров */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Ваши товары ({cart.length})</h5>
              {cart.length > 0 && (
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={clearCart}
                >
                  🗑️ Очистить корзину
                </button>
              )}
            </div>
            
            <div className="card-body">
              {cart.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <span className="display-1 text-muted">🛒</span>
                  </div>
                  <h4>Корзина пуста</h4>
                  <p className="text-muted mb-4">Добавьте товары из меню</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/test-page')}
                  >
                    🍽️ Перейти в меню
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr className="table-light">
                        <th width="60">Фото</th>
                        <th>Название</th>
                        <th width="120">Цена</th>
                        <th width="150">Количество</th>
                        <th width="100">Сумма</th>
                        <th width="80"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div 
                              className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden"
                              style={{ width: '50px', height: '50px' }}
                            >
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="img-fluid h-100 w-100"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://via.placeholder.com/50/FF6B6B/FFFFFF?text=${item.name.substring(0, 2)}`;
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{item.name}</strong>
                              <div className="text-muted small">{item.weight}</div>
                            </div>
                          </td>
                          <td>
                            <span className="text-primary">{item.price} ₽</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => decreaseQuantity(item.id)}
                                disabled={item.quantity <= 1}
                                style={{ width: '30px', height: '30px' }}
                              >
                                −
                              </button>
                              <span className="mx-2" style={{ minWidth: '30px', textAlign: 'center' }}>
                                {item.quantity}
                              </span>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => increaseQuantity(item.id)}
                                style={{ width: '30px', height: '30px' }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <strong className="text-success">{item.price * item.quantity} ₽</strong>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.id)}
                              title="Удалить"
                              style={{ width: '30px', height: '30px' }}
                            >
                              ×
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

          {/* Кнопки быстрого добавления из меню */}
          {cart.length === 0 && (
            <div className="card mt-4 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">🍽️ Быстрое добавление из меню</h6>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {menuItems.map(item => (
                    <div key={item.id} className="col-6 col-md-3">
                      <div className="card border">
                        <div className="card-body p-2 text-center">
                          <div className="mb-2">
                            <div 
                              className="rounded mx-auto overflow-hidden"
                              style={{ width: '50px', height: '50px' }}
                            >
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="img-fluid h-100 w-100"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                          <h6 className="small mb-1">{item.name}</h6>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">{item.weight}</small>
                            <strong className="text-primary">{item.price} ₽</strong>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-primary w-100 mt-2"
                            onClick={() => addFromMenu(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Правая часть - итоги */}
        <div className="col-lg-4">
          <div className="card shadow sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Итоги заказа</h5>
            </div>
            
            <div className="card-body">
              {/* Сводка */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Товаров:</span>
                  <span>{cart.length} шт.</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Количество:</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} шт.</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fs-5">
                  <strong>Итого:</strong>
                  <strong className="text-success">{totalAmount} ₽</strong>
                </div>
              </div>

              {/* Кнопка оформления */}
              <button 
                className="btn btn-success btn-lg w-100 py-3 mb-3"
                onClick={checkout}
                disabled={cart.length === 0}
              >
                🚀 Оформить заказ
              </button>

              {/* Дополнительные кнопки */}
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/test-page')}
                >
                  ← Продолжить покупки
                </button>
              </div>
            </div>
          </div>

          {/* История текущего заказа */}
          {cart.length > 0 && (
            <div className="card mt-4 shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">📝 Ваш заказ:</h6>
                <ul className="list-group list-group-flush">
                  {cart.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <div>
                        <span className="small">{item.name}</span>
                        <br />
                        <small className="text-muted">{item.quantity} × {item.price} ₽</small>
                      </div>
                      <span className="text-success">{item.price * item.quantity} ₽</span>
                    </li>
                  ))}
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-top">
                    <strong>Общая сумма:</strong>
                    <strong className="text-success">{totalAmount} ₽</strong>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestPage2;