# Cash Flow Application - Deployment Guide

Это руководство поможет вам развернуть приложение Cash Flow на VPS хостинге с использованием Docker и Docker Compose.

## Требования

### Системные требования
- Ubuntu 20.04+ или Debian 11+
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске
- Root доступ или пользователь с sudo правами

### Сетевые требования
- Открытые порты: 80 (HTTP), 443 (HTTPS)
- Домен (опционально, для SSL)

## Быстрое развертывание

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker и Docker Compose
sudo ./scripts/install-docker.sh
```

### 2. Настройка окружения

```bash
# Копирование файла окружения
cp env.example .env

# Редактирование конфигурации
nano .env
```

Основные параметры в `.env`:
```bash
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://focus-goal.com
DOMAIN=focus-goal.com
SSL_EMAIL=your-email@example.com
```

### 3. Развертывание

```bash
# Запуск автоматического развертывания
./deploy.sh
```

## Ручное развертывание

### 1. Установка Docker

```bash
# Обновление пакетов
sudo apt update

# Установка зависимостей
sudo apt install -y ca-certificates curl gnupg lsb-release

# Добавление GPG ключа Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Запуск Docker
sudo systemctl start docker
sudo systemctl enable docker

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

### 2. Клонирование проекта

```bash
# Клонирование репозитория
git clone <your-repo-url> cashflow
cd cashflow

# Или загрузка файлов проекта
```

### 3. Настройка окружения

```bash
# Создание файла окружения
cp env.example .env

# Редактирование конфигурации
nano .env
```

### 4. Сборка и запуск

```bash
# Создание необходимых директорий
mkdir -p logs/backend ssl nginx/conf.d

# Сборка и запуск сервисов
docker-compose up -d --build

# Проверка статуса
docker-compose ps
```

## Структура развертывания

```
cashflow/
├── backend/                 # Backend приложение
│   ├── Dockerfile          # Docker конфигурация для backend
│   ├── package.json        # Зависимости Node.js
│   └── index.js            # Основной файл приложения
├── frontend/               # Frontend приложение
│   ├── Dockerfile          # Docker конфигурация для frontend
│   ├── nginx.conf          # Nginx конфигурация для frontend
│   └── package.json        # Зависимости Vue.js
├── nginx/                  # Nginx конфигурация
│   ├── nginx.conf          # Основная конфигурация Nginx
│   └── conf.d/             # Дополнительные конфигурации
├── scripts/                # Скрипты развертывания
│   ├── install-docker.sh   # Установка Docker
│   └── update.sh           # Обновление приложения
├── docker-compose.yml      # Оркестрация сервисов
├── deploy.sh              # Автоматическое развертывание
└── env.example            # Шаблон переменных окружения
```

## Управление приложением

### Основные команды

```bash
# Запуск сервисов
docker-compose up -d

# Остановка сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f

# Просмотр статуса
docker-compose ps

# Перезапуск сервиса
docker-compose restart <service-name>
```

### Обновление приложения

```bash
# Автоматическое обновление
./scripts/update.sh

# Откат к предыдущей версии
./scripts/update.sh rollback
```

### Мониторинг

```bash
# Использование ресурсов
docker stats

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## Настройка SSL (HTTPS)

### Автоматическая настройка с Let's Encrypt

1. Убедитесь, что домен указывает на ваш сервер
2. Настройте переменные в `.env`:
   ```bash
   DOMAIN=focus-goal.com
   SSL_EMAIL=your-email@example.com
   ```
3. Запустите развертывание:
   ```bash
   ./deploy.sh
   ```

### Ручная настройка SSL

1. Получите SSL сертификат:
   ```bash
   sudo certbot certonly --standalone -d focus-goal.com
   ```

2. Скопируйте сертификаты:
   ```bash
   sudo cp /etc/letsencrypt/live/focus-goal.com/fullchain.pem ssl/cert.pem
   sudo cp /etc/letsencrypt/live/focus-goal.com/privkey.pem ssl/key.pem
   sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
   ```

3. Раскомментируйте HTTPS блок в `nginx/conf.d/default.conf`

4. Перезапустите сервисы:
   ```bash
   docker-compose restart nginx
   ```

## Безопасность

### Рекомендации по безопасности

1. **Firewall**: Настройте UFW или iptables
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **SSH**: Отключите root логин и используйте ключи
   ```bash
   sudo nano /etc/ssh/sshd_config
   # PermitRootLogin no
   # PasswordAuthentication no
   sudo systemctl restart ssh
   ```

3. **Обновления**: Регулярно обновляйте систему
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Мониторинг**: Настройте мониторинг логов
   ```bash
   # Установка fail2ban
   sudo apt install fail2ban
   ```

## Устранение неполадок

### Частые проблемы

1. **Сервисы не запускаются**
   ```bash
   # Проверка логов
   docker-compose logs
   
   # Проверка конфигурации
   docker-compose config
   ```

2. **Проблемы с портами**
   ```bash
   # Проверка занятых портов
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :443
   ```

3. **Проблемы с SSL**
   ```bash
   # Проверка сертификатов
   openssl x509 -in ssl/cert.pem -text -noout
   ```

4. **Проблемы с Docker**
   ```bash
   # Перезапуск Docker
   sudo systemctl restart docker
   
   # Очистка Docker
   docker system prune -a
   ```

### Логи и отладка

```bash
# Подробные логи
docker-compose logs --tail=100 -f

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Вход в контейнер для отладки
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Резервное копирование

### Автоматическое резервное копирование

```bash
# Создание резервной копии
./scripts/backup.sh

# Восстановление из резервной копии
./scripts/restore.sh backup-20240101_120000
```

### Ручное резервное копирование

```bash
# Создание архива проекта
tar -czf cashflow-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  .

# Резервное копирование базы данных (если используется)
docker-compose exec db pg_dump -U username database_name > backup.sql
```

## Масштабирование

### Горизонтальное масштабирование

```bash
# Увеличение количества экземпляров backend
docker-compose up -d --scale backend=3

# Настройка load balancer в nginx
```

### Вертикальное масштабирование

```bash
# Ограничение ресурсов в docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs`
2. Проверьте статус сервисов: `docker-compose ps`
3. Проверьте конфигурацию: `docker-compose config`
4. Обратитесь к документации Docker и Docker Compose

## Заключение

Этот гайд покрывает основные аспекты развертывания приложения Cash Flow. Для production окружения рекомендуется дополнительно настроить:

- Мониторинг (Prometheus, Grafana)
- Логирование (ELK Stack)
- Резервное копирование
- Автоматические обновления
- CI/CD пайплайн
