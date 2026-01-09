// Регистрация/вход пользователя
document.addEventListener('DOMContentLoaded', function() {
    // Переключение между формами регистрации и входа
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    
    if (loginToggle) {
        loginToggle.addEventListener('click', function(e) {
            e.preventDefault();
            registrationForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }
    
    if (registerToggle) {
        registerToggle.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registrationForm.classList.remove('hidden');
        });
    }
    
    // Обработка регистрации
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Простая валидация
            if (password !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }
            
            if (password.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }
            
            // Сохраняем данные пользователя
            const user = {
                name: name,
                email: email,
                password: password,
                jars: []
            };
            
            localStorage.setItem('smartJarUser', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            
            alert('Регистрация успешна!');
            window.location.href = 'dashboard.html';
        });
    }
    
    // Обработка входа
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Проверяем наличие пользователя (в реальном приложении здесь был бы запрос к серверу)
            const savedUser = localStorage.getItem('smartJarUser');
            
            if (savedUser) {
                const user = JSON.parse(savedUser);
                
                if (user.email === email && user.password === password) {
                    localStorage.setItem('isLoggedIn', 'true');
                    alert('Вход выполнен успешно!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Неверный email или пароль');
                }
            } else {
                alert('Пользователь с таким email не найден');
            }
        });
    }
    
    // Проверка авторизации на странице dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = 'index.html';
            return;
        }
        
        // Загружаем данные пользователя
        const user = JSON.parse(localStorage.getItem('smartJarUser'));
        if (user && document.getElementById('userName')) {
            document.getElementById('userName').textContent = user.name;
        }
        
        // Загружаем банки пользователя
        loadUserJars();
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }
    
    // Модальное окно для добавления банки
    const addJarBtn = document.getElementById('addJarBtn');
    const addFirstJarBtn = document.getElementById('addFirstJarBtn');
    const addJarModal = document.getElementById('addJarModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addJarForm = document.getElementById('addJarForm');
    
    function openModal() {
        if (addJarModal) {
            addJarModal.style.display = 'flex';
        }
    }
    
    function closeModal() {
        if (addJarModal) {
            addJarModal.style.display = 'none';
        }
    }
    
    if (addJarBtn) {
        addJarBtn.addEventListener('click', openModal);
    }
    
    if (addFirstJarBtn) {
        addFirstJarBtn.addEventListener('click', openModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        if (addJarModal && e.target === addJarModal) {
            closeModal();
        }
    });
    
    // Обработка добавления новой банки
    if (addJarForm) {
        addJarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const jarName = document.getElementById('jarName').value;
            const jarType = document.getElementById('jarType').value;
            const jarSize = parseInt(document.getElementById('jarSize').value);
            const jarId = document.getElementById('jarId').value;
            
            // Генерируем случайный уровень заполнения (в реальном приложении это данные с датчика)
            const fillLevel = Math.floor(Math.random() * 100);
            
            const newJar = {
                id: Date.now(),
                name: jarName,
                type: jarType,
                size: jarSize,
                sensorId: jarId,
                fillLevel: fillLevel,
                lastUpdated: new Date().toLocaleString()
            };
            
            // Сохраняем банку
            saveJar(newJar);
            
            // Закрываем модальное окно и обновляем список
            closeModal();
            loadUserJars();
            
            // Очищаем форму
            addJarForm.reset();
        });
    }
});

// Функция загрузки банок пользователя
function loadUserJars() {
    const jarsContainer = document.querySelector('.jars-container');
    const noJarsMessage = document.getElementById('noJarsMessage');
    
    if (!jarsContainer) return;
    
    // Очищаем контейнер
    jarsContainer.innerHTML = '';
    
    // Получаем банки из localStorage
    const user = JSON.parse(localStorage.getItem('smartJarUser'));
    const jars = user?.jars || [];
    
    // Если банок нет, показываем сообщение
    if (jars.length === 0) {
        if (noJarsMessage) {
            jarsContainer.appendChild(noJarsMessage);
            noJarsMessage.classList.remove('hidden');
        }
        return;
    }
    
    // Скрываем сообщение "нет банок"
    if (noJarsMessage) {
        noJarsMessage.classList.add('hidden');
    }
    
    // Отображаем каждую банку
    jars.forEach(jar => {
        const jarCard = createJarCard(jar);
        jarsContainer.appendChild(jarCard);
    });
}

// Создание карточки банки
function createJarCard(jar) {
    const jarCard = document.createElement('div');
    jarCard.className = 'jar-card';
    jarCard.dataset.id = jar.id;
    
    // Определяем цвет уровня заполнения
    let levelClass = 'jar-level-high';
    let levelText = 'Много';
    
    if (jar.fillLevel < 20) {
        levelClass = 'jar-level-low';
        levelText = 'Мало';
    } else if (jar.fillLevel < 60) {
        levelClass = 'jar-level-medium';
        levelText = 'Средне';
    }
    
    jarCard.innerHTML = `
        <div class="jar-header">
            <h3 class="jar-name">${jar.name}</h3>
            <span class="jar-type">${getTypeName(jar.type)}</span>
        </div>
        
        <div class="jar-level-container">
            <div class="jar-level-text">
                <span>Уровень заполнения:</span>
                <span>${jar.fillLevel}% (${levelText})</span>
            </div>
            <div class="jar-level">
                <div class="jar-level-fill ${levelClass}" style="width: ${jar.fillLevel}%"></div>
            </div>
        </div>
        
        <div class="jar-info">
            <div class="jar-info-item">
                <div class="jar-info-label">Объем банки</div>
                <div class="jar-info-value">${jar.size} мл</div>
            </div>
            <div class="jar-info-item">
                <div class="jar-info-label">Примерный остаток</div>
                <div class="jar-info-value">${Math.round(jar.size * jar.fillLevel / 100)} мл</div>
            </div>
        </div>
        
        <div class="jar-info">
            <div class="jar-info-item">
                <div class="jar-info-label">ID датчика</div>
                <div class="jar-info-value">${jar.sensorId.substring(0, 8)}...</div>
            </div>
            <div class="jar-info-item">
                <div class="jar-info-label">Обновлено</div>
                <div class="jar-info-value">${jar.lastUpdated}</div>
            </div>
        </div>
        
        <div class="jar-actions">
            <button class="action-btn update-btn" data-id="${jar.id}">
                <i class="fas fa-sync-alt"></i> Обновить
            </button>
            <button class="action-btn delete-btn" data-id="${jar.id}">
                <i class="fas fa-trash-alt"></i> Удалить
            </button>
        </div>
    `;
    
    // Добавляем обработчики для кнопок
    const updateBtn = jarCard.querySelector('.update-btn');
    const deleteBtn = jarCard.querySelector('.delete-btn');
    
    updateBtn.addEventListener('click', function() {
        updateJarLevel(jar.id);
    });
    
    deleteBtn.addEventListener('click', function() {
        deleteJar(jar.id);
    });
    
    return jarCard;
}

// Получение отображаемого названия типа крупы
function getTypeName(type) {
    const typeNames = {
        'гречка': 'Гречка',
        'рис': 'Рис',
        'овсянка': 'Овсянка',
        'пшено': 'Пшено',
        'перловка': 'Перловка',
        'другое': 'Другое'
    };
    
    return typeNames[type] || type;
}

// Сохранение банки
function saveJar(jar) {
    const user = JSON.parse(localStorage.getItem('smartJarUser'));
    
    if (user) {
        if (!user.jars) {
            user.jars = [];
        }
        
        user.jars.push(jar);
        localStorage.setItem('smartJarUser', JSON.stringify(user));
    }
}

// Обновление уровня заполнения банки
function updateJarLevel(jarId) {
    const user = JSON.parse(localStorage.getItem('smartJarUser'));
    
    if (user && user.jars) {
        const jarIndex = user.jars.findIndex(j => j.id == jarId);
        
        if (jarIndex !== -1) {
            // Имитация получения новых данных с датчика
            const newFillLevel = Math.floor(Math.random() * 100);
            user.jars[jarIndex].fillLevel = newFillLevel;
            user.jars[jarIndex].lastUpdated = new Date().toLocaleString();
            
            localStorage.setItem('smartJarUser', JSON.stringify(user));
            loadUserJars();
            
            alert(`Уровень заполнения обновлен: ${newFillLevel}%`);
        }
    }
}

// Удаление банки
function deleteJar(jarId) {
    if (confirm('Вы уверены, что хотите удалить эту банку?')) {
        const user = JSON.parse(localStorage.getItem('smartJarUser'));
        
        if (user && user.jars) {
            user.jars = user.jars.filter(j => j.id != jarId);
            localStorage.setItem('smartJarUser', JSON.stringify(user));
            loadUserJars();
        }
    }
}
