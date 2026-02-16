import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function TestPage3() {
  // Данные заказов
  const [orders, setOrders] = useState([
    {
      id: 1001,
      date: '15.03.2024',
      time: '12:30',
      total: 165,
      status: 'выполнен',
      items: [
        { name: 'Суп картофельный с бобовыми', quantity: 1, price: 55 },
        { name: 'Салат из свежих помидор и огурцов', quantity: 1, price: 65 },
        { name: 'Пирожное «Чоко пай»', quantity: 2, price: 25 }
      ]
    },
    {
      id: 1002,
      date: '14.03.2024',
      time: '13:15',
      total: 80,
      status: 'выполнен',
      items: [
        { name: 'Салат Цезарь', quantity: 1, price: 80 }
      ]
    },
    {
      id: 1003,
      date: '13.03.2024',
      time: '11:45',
      total: 120,
      status: 'отменен',
      items: [
        { name: 'Суп картофельный с бобовыми', quantity: 2, price: 55 },
        { name: 'Компот', quantity: 1, price: 10 }
      ]
    }
  ]);

  // Состояние для фильтров
  const [statusFilter, setStatusFilter] = useState('все');

  // Функция для получения статуса заказа с цветом
  const getStatusBadge = (status) => {
    switch(status) {
      case 'выполнен':
        return <span className="badge bg-success">Выполнен</span>;
      case 'в обработке':
        return <span className="badge bg-warning">В обработке</span>;
      case 'отменен':
        return <span className="badge bg-danger">Отменен</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    return statusFilter === 'все' || order.status === statusFilter;
  });

  // Функция для повтора заказа
  const repeatOrder = (order) => {
    if (window.confirm(`Повторить заказ №${order.id}?`)) {
      alert('Товары из заказа добавлены в корзину!');
      setTimeout(() => {
        window.location.href = '/test-page2';
      }, 1000);
    }
  };

  // Функция для отмены заказа (если в обработке)
  const cancelOrder = (orderId) => {
    if (window.confirm('Отменить этот заказ?')) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'отменен' } : order
      ));
      alert('Заказ отменен');
    }
  };

  return (
    <div className="container mt-4">
      {/* Заголовок */}
      <div className="text-center mb-4">
        <h1 className="text-primary">📜 История заказов</h1>
        <p className="text-muted">Ваши предыдущие заказы</p>
      </div>

      {/* Фильтры */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Фильтр по статусу:</h5>
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${statusFilter === 'все' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStatusFilter('все')}
            >
              Все
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'выполнен' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setStatusFilter('выполнен')}
            >
              Выполненные
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'в обработке' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setStatusFilter('в обработке')}
            >
              В обработке
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'отменен' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setStatusFilter('отменен')}
            >
              Отмененные
            </button>
          </div>
        </div>
      </div>

      {/* Список заказов */}
      <div className="card shadow">
        <div className="card-header bg-light">
          <h5 className="mb-0">Список заказов</h5>
        </div>
        
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <span className="display-1 text-muted">📭</span>
              </div>
              <h4>Заказы не найдены</h4>
              <p className="text-muted mb-4">Измените фильтр или оформите новый заказ</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/test-page'}
              >
                Перейти в меню
              </button>
            </div>
          ) : (
            <div className="accordion" id="ordersAccordion">
              {filteredOrders.map((order) => (
                <div className="accordion-item border mb-3" key={order.id}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${order.id}`}
                      aria-expanded="false"
                    >
                      <div className="d-flex justify-content-between align-items-center w-100 me-3">
                        <div>
                          <strong>Заказ #{order.id}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <div>{getStatusBadge(order.status)}</div>
                          <div className="text-end">
                            <div className="text-success">{order.total} ₽</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </h2>
                  
                  <div
                    id={`collapse${order.id}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#ordersAccordion"
                  >
                    <div className="accordion-body">
                      {/* Детали заказа */}
                      <div className="row">
                        <div className="col-md-8">
                          <h6>Состав заказа:</h6>
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Товар</th>
                                <th className="text-center">Кол-во</th>
                                <th className="text-end">Цена</th>
                                <th className="text-end">Сумма</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.name}</td>
                                  <td className="text-center">{item.quantity}</td>
                                  <td className="text-end">{item.price} ₽</td>
                                  <td className="text-end">{item.price * item.quantity} ₽</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <th colSpan="3" className="text-end">Итого:</th>
                                <th className="text-end text-success">{order.total} ₽</th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        
                        <div className="col-md-4">
                          <h6>Действия:</h6>
                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => repeatOrder(order)}
                            >
                              Повторить заказ
                            </button>
                            
                            {order.status === 'в обработке' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => cancelOrder(order.id)}
                              >
                                Отменить заказ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Быстрое меню */}
      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/test-page'}
              >
                Сделать новый заказ
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <button 
                className="btn btn-success"
                onClick={() => window.location.href = '/test-page2'}
              >
                Перейти в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPage3;