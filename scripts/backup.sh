#!/bin/bash

# Backup Script for Cash Flow Application
# This script creates backups of the application data and configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="cashflow-backup-$TIMESTAMP"
PROJECT_NAME="cashflow"

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    log_success "Backup directory created: $BACKUP_DIR/$BACKUP_NAME"
}

# Backup configuration files
backup_config() {
    log_info "Backing up configuration files..."
    
    # Copy configuration files
    cp docker-compose.yml "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || log_warning "docker-compose.yml not found"
    cp .env "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || log_warning ".env not found"
    cp env.example "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || log_warning "env.example not found"
    
    # Copy nginx configuration
    if [[ -d "nginx" ]]; then
        cp -r nginx "$BACKUP_DIR/$BACKUP_NAME/"
    fi
    
    # Copy scripts
    if [[ -d "scripts" ]]; then
        cp -r scripts "$BACKUP_DIR/$BACKUP_NAME/"
    fi
    
    log_success "Configuration files backed up"
}

# Backup application code
backup_code() {
    log_info "Backing up application code..."
    
    # Create archive of source code (excluding node_modules, logs, etc.)
    tar -czf "$BACKUP_DIR/$BACKUP_NAME/source-code.tar.gz" \
        --exclude=node_modules \
        --exclude=logs \
        --exclude=.git \
        --exclude=backups \
        --exclude=dist \
        --exclude=ssl \
        --exclude="*.log" \
        backend/ frontend/ 2>/dev/null || log_warning "Some files could not be archived"
    
    log_success "Application code backed up"
}

# Backup Docker images
backup_images() {
    log_info "Backing up Docker images..."
    
    # Save Docker images
    if docker-compose images -q | grep -q .; then
        docker-compose images -q | xargs -I {} docker save {} | gzip > "$BACKUP_DIR/$BACKUP_NAME/docker-images.tar.gz"
        log_success "Docker images backed up"
    else
        log_warning "No Docker images found to backup"
    fi
}

# Backup volumes (if any)
backup_volumes() {
    log_info "Backing up volumes..."
    
    # Check if there are any named volumes
    if docker volume ls | grep -q "$PROJECT_NAME"; then
        docker run --rm -v "$PROJECT_NAME"_data:/data -v "$(pwd)/$BACKUP_DIR/$BACKUP_NAME":/backup alpine tar czf /backup/volumes.tar.gz -C /data .
        log_success "Volumes backed up"
    else
        log_warning "No named volumes found to backup"
    fi
}

# Backup logs
backup_logs() {
    log_info "Backing up logs..."
    
    if [[ -d "logs" ]]; then
        cp -r logs "$BACKUP_DIR/$BACKUP_NAME/"
        log_success "Logs backed up"
    else
        log_warning "No logs directory found"
    fi
}

# Create backup manifest
create_manifest() {
    log_info "Creating backup manifest..."
    
    cat > "$BACKUP_DIR/$BACKUP_NAME/MANIFEST.txt" << EOF
Cash Flow Application Backup
============================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
Application Version: $(git describe --tags 2>/dev/null || echo "unknown")
Docker Compose Version: $(docker-compose --version 2>/dev/null || echo "unknown")
Docker Version: $(docker --version 2>/dev/null || echo "unknown")

Contents:
- Configuration files (docker-compose.yml, .env, nginx/)
- Application source code (source-code.tar.gz)
- Docker images (docker-images.tar.gz)
- Application logs (logs/)
- Scripts (scripts/)

To restore this backup:
1. Extract source-code.tar.gz
2. Load Docker images: docker load < docker-images.tar.gz
3. Copy configuration files to project root
4. Run: docker-compose up -d

EOF
    
    log_success "Backup manifest created"
}

# Compress backup
compress_backup() {
    log_info "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    cd ..
    
    log_success "Backup compressed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t *.tar.gz | tail -n +11 | xargs -r rm -f
    cd ..
    
    log_success "Old backups cleaned up"
}

# Show backup info
show_backup_info() {
    log_info "Backup completed successfully!"
    echo
    echo "Backup Details:"
    echo "==============="
    echo "Name: $BACKUP_NAME.tar.gz"
    echo "Location: $BACKUP_DIR/"
    echo "Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)"
    echo "Date: $(date)"
    echo
    echo "To restore this backup:"
    echo "1. Extract: tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    echo "2. Follow instructions in MANIFEST.txt"
}

# Main function
main() {
    log_info "Starting backup process..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    create_backup_dir
    backup_config
    backup_code
    backup_images
    backup_volumes
    backup_logs
    create_manifest
    compress_backup
    cleanup_old_backups
    show_backup_info
    
    log_success "Backup process completed!"
}

# Run main function
main "$@"
