import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login_Page() {
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    
    // Временная логика - потом замените на проверку с БД
    const email = document.getElementById('staticEmail2').value;
    const password = document.getElementById('inputPassword2').value;
    
    if (email && password) {
      // Сохраняем данные в localStorage (временно)
      localStorage.setItem('userEmail', email);
      
      // Редирект на личный кабинет
      navigate('/profile');
    } else {
      alert('Заполните все поля!');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Форма входа</h1>
      
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-auto">
          <label htmlFor="staticEmail2" className="visually-hidden">
            введите номер
          </label>
          <input 
            type="text" 
            readOnly 
            className="form-control-plaintext" 
            id="staticEmail2" 
            value="введите номер"
          />
        </div>
        
        <div className="col-auto">
          <label htmlFor="inputPassword2" className="visually-hidden">
            Номер
          </label>
          <input 
            type="password" 
            className="form-control" 
            id="inputPassword2" 
            placeholder="сюда"
          />
        </div>
        
        <div className="col-auto">
          <button type="submit" className="btn btn-primary mb-3">
            Подтвердить
          </button>
        </div>
      </form>
      
      {/* Дополнительные элементы, если нужны */}
      <div className="mt-3">
        <p className="text-muted">
          жду донаты
        </p>
      </div>
    </div>
  );
}

export default Login_Page;
