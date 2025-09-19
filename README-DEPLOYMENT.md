# 🚀 Cash Flow Application - Автоматическое развертывание

Этот проект настроен для автоматического развертывания на VPS хостинге с использованием Docker и Docker Compose.

## 📋 Что включено

### 🐳 Docker конфигурация
- **Backend Dockerfile** - Node.js приложение с оптимизированным образом
- **Frontend Dockerfile** - Vue.js приложение с Nginx для статических файлов
- **Docker Compose** - Оркестрация всех сервисов
- **Nginx** - Reverse proxy с SSL поддержкой

### 🔧 Скрипты автоматизации
- **`deploy.sh`** - Полное автоматическое развертывание
- **`scripts/install-docker.sh`** - Установка Docker и Docker Compose
- **`scripts/update.sh`** - Обновление приложения с zero-downtime
- **`scripts/backup.sh`** - Резервное копирование

### 📁 Структура развертывания
```
cashflow/
├── 🐳 docker-compose.yml          # Оркестрация сервисов
├── 🚀 deploy.sh                   # Автоматическое развертывание
├── 📄 env.example                 # Шаблон переменных окружения
├── 📚 DEPLOYMENT.md               # Подробная документация
├── backend/
│   ├── 🐳 Dockerfile             # Backend контейнер
│   └── 📄 env.example            # Backend переменные
├── frontend/
│   ├── 🐳 Dockerfile             # Frontend контейнер
│   └── 🌐 nginx.conf             # Nginx конфигурация
├── nginx/
│   ├── 🌐 nginx.conf             # Основная конфигурация
│   └── conf.d/default.conf       # Виртуальные хосты
└── scripts/
    ├── 🔧 install-docker.sh      # Установка Docker
    ├── 🔄 update.sh              # Обновление приложения
    └── 💾 backup.sh              # Резервное копирование
```

## ⚡ Быстрый старт

### 1️⃣ Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker (автоматически)
sudo ./scripts/install-docker.sh
```

### 2️⃣ Настройка окружения
```bash
# Копирование конфигурации
cp env.example .env

# Редактирование настроек
nano .env
```

**Основные параметры в `.env`:**
```bash
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://focus-goal.com
DOMAIN=focus-goal.com
SSL_EMAIL=your-email@example.com
```

### 3️⃣ Развертывание
```bash
# Автоматическое развертывание
./deploy.sh
```

**Готово!** 🎉 Приложение доступно по адресу `https://focus-goal.com`

## 🔄 Управление приложением

### Основные команды
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Логи
docker-compose logs -f

# Статус
docker-compose ps
```

### Обновление
```bash
# Автоматическое обновление
./scripts/update.sh

# Откат
./scripts/update.sh rollback
```

### Резервное копирование
```bash
# Создание резервной копии
./scripts/backup.sh
```

## 🔒 SSL/HTTPS настройка

### Автоматическая настройка
1. Настройте домен в `.env`:
   ```bash
   DOMAIN=focus-goal.com
   SSL_EMAIL=your-email@example.com
   ```
2. Запустите развертывание:
   ```bash
   ./deploy.sh
   ```

### Ручная настройка
```bash
# Получение SSL сертификата
sudo certbot certonly --standalone -d focus-goal.com

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/focus-goal.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/focus-goal.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem

# Перезапуск
docker-compose restart nginx
```

## 🛡️ Безопасность

### Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSH
```bash
# Отключение root логина
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
sudo systemctl restart ssh
```

## 📊 Мониторинг

### Проверка здоровья
```bash
# Статус сервисов
docker-compose ps

# Использование ресурсов
docker stats

# Логи
docker-compose logs -f
```

### Health checks
- Frontend: `https://focus-goal.com/health`
- Backend: `https://focus-goal.com/api/health`

## 🔧 Устранение неполадок

### Сервисы не запускаются
```bash
# Проверка логов
docker-compose logs

# Проверка конфигурации
docker-compose config

# Перезапуск Docker
sudo systemctl restart docker
```

### Проблемы с портами
```bash
# Проверка занятых портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Очистка Docker
```bash
# Очистка неиспользуемых ресурсов
docker system prune -a

# Очистка volumes
docker volume prune
```

## 📈 Масштабирование

### Горизонтальное масштабирование
```bash
# Увеличение backend экземпляров
docker-compose up -d --scale backend=3
```

### Ограничение ресурсов
```yaml
# В docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🎯 Особенности

### ✅ Что работает из коробки
- ✅ Автоматическое развертывание
- ✅ SSL/HTTPS поддержка
- ✅ Health checks
- ✅ Zero-downtime обновления
- ✅ Резервное копирование
- ✅ Логирование
- ✅ Безопасность (non-root пользователи)
- ✅ Оптимизация производительности
- ✅ Gzip сжатие
- ✅ Кэширование статических файлов

### 🔧 Настройки по умолчанию
- **Backend**: Node.js 20, порт 5001
- **Frontend**: Vue.js + Nginx, порт 80
- **Nginx**: Reverse proxy с SSL
- **Health checks**: Каждые 30 секунд
- **Logs**: Ротация и архивирование
- **Backups**: Автоматическая очистка старых

## 📞 Поддержка

При возникновении проблем:

1. **Проверьте логи**: `docker-compose logs`
2. **Проверьте статус**: `docker-compose ps`
3. **Проверьте конфигурацию**: `docker-compose config`
4. **Обратитесь к документации**: `DEPLOYMENT.md`

## 🎉 Заключение

Ваше приложение Cash Flow готово к production развертыванию! 

**Следующие шаги:**
1. Настройте домен и SSL
2. Настройте мониторинг
3. Настройте автоматические обновления
4. Настройте резервное копирование

**Удачного развертывания!** 🚀
