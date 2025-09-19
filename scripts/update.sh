#!/bin/bash

# Update Script for Cash Flow Application
# This script updates the application with zero downtime

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
PROJECT_NAME="cashflow"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Pull latest changes
pull_changes() {
    if [[ -d ".git" ]]; then
        log_info "Pulling latest changes from git..."
        git pull origin main
        log_success "Latest changes pulled"
    else
        log_warning "Not a git repository, skipping git pull"
    fi
}

# Backup current deployment
backup_deployment() {
    log_info "Creating backup of current deployment..."
    
    # Create backup directory with timestamp
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Export current images
    docker-compose images -q | xargs -I {} docker save {} | gzip > "$BACKUP_DIR/images.tar.gz"
    
    # Copy configuration files
    cp docker-compose.yml "$BACKUP_DIR/"
    cp -r nginx "$BACKUP_DIR/" 2>/dev/null || true
    cp .env "$BACKUP_DIR/" 2>/dev/null || true
    
    log_success "Backup created in $BACKUP_DIR"
}

# Update services with zero downtime
update_services() {
    log_info "Updating services with zero downtime..."
    
    # Build new images
    log_info "Building new images..."
    docker-compose build --no-cache
    
    # Update services one by one
    log_info "Updating frontend..."
    docker-compose up -d --no-deps frontend
    
    # Wait for frontend to be healthy
    log_info "Waiting for frontend to be healthy..."
    timeout 60 bash -c 'until docker-compose ps frontend | grep -q "healthy"; do sleep 2; done'
    
    log_info "Updating backend..."
    docker-compose up -d --no-deps backend
    
    # Wait for backend to be healthy
    log_info "Waiting for backend to be healthy..."
    timeout 60 bash -c 'until docker-compose ps backend | grep -q "healthy"; do sleep 2; done'
    
    # Update nginx (if needed)
    log_info "Updating nginx..."
    docker-compose up -d --no-deps nginx
    
    log_success "Services updated successfully"
}

# Clean up old images
cleanup() {
    log_info "Cleaning up old images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 5)
    if [[ -d "backups" ]]; then
        cd backups
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
    fi
    
    log_success "Cleanup completed"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Wait a bit for services to stabilize
    sleep 10
    
    # Check if all services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "All services are running"
        
        # Test endpoints
        log_info "Testing endpoints..."
        
        # Test frontend
        if curl -f https://focus-goal.com/health > /dev/null 2>&1; then
            log_success "Frontend is responding"
        else
            log_warning "Frontend health check failed"
        fi
        
        # Test backend
        if curl -f https://focus-goal.com/api/health > /dev/null 2>&1; then
            log_success "Backend is responding"
        else
            log_warning "Backend health check failed"
        fi
        
    else
        log_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t backups/ | head -n1)
    
    if [[ -z "$LATEST_BACKUP" ]]; then
        log_error "No backup found for rollback"
        exit 1
    fi
    
    log_info "Rolling back to backup: $LATEST_BACKUP"
    
    # Stop current services
    docker-compose down
    
    # Restore from backup
    cd "backups/$LATEST_BACKUP"
    docker load < images.tar.gz
    cd ../..
    
    # Start services
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Main function
main() {
    case "${1:-update}" in
        "update")
            log_info "Starting update process..."
            check_docker
            pull_changes
            backup_deployment
            update_services
            check_health
            cleanup
            log_success "Update completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        *)
            echo "Usage: $0 [update|rollback]"
            echo "  update   - Update the application (default)"
            echo "  rollback - Rollback to previous version"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
