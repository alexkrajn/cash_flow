#!/bin/bash

# Cash Flow Application Deployment Script
# This script automates the deployment process on a VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="cashflow"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Functions
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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning ".env file not found. Creating from template..."
        if [[ -f "env.example" ]]; then
            cp env.example "$ENV_FILE"
            log_warning "Please edit $ENV_FILE with your configuration before running again"
            exit 1
        else
            log_error "No env.example file found. Please create a .env file manually."
            exit 1
        fi
    fi
    log_success "Environment file found"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    mkdir -p logs/backend
    mkdir -p ssl
    mkdir -p nginx/conf.d
    log_success "Directories created"
}

# Pull latest changes (if git repository)
pull_changes() {
    if [[ -d ".git" ]]; then
        log_info "Pulling latest changes from git..."
        git pull origin main
        log_success "Latest changes pulled"
    else
        log_warning "Not a git repository, skipping git pull"
    fi
}

# Build and start services
deploy_services() {
    log_info "Building and starting services..."
    
    # Stop existing services
    docker-compose down --remove-orphans
    
    # Build and start services
    docker-compose up -d --build
    
    log_success "Services deployed successfully"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Wait for services to start
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services are running"
    else
        log_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Setup SSL with Let's Encrypt (optional)
setup_ssl() {
    if [[ -n "$DOMAIN" && -n "$SSL_EMAIL" ]]; then
        log_info "Setting up SSL with Let's Encrypt..."
        
        # Install certbot if not present
        if ! command -v certbot &> /dev/null; then
            log_info "Installing certbot..."
            sudo apt-get update
            sudo apt-get install -y certbot
        fi
        
        # Get SSL certificate
        sudo certbot certonly --standalone -d "$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive
        
        # Copy certificates to ssl directory
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/cert.pem
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/key.pem
        sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
        
        log_success "SSL certificate installed"
    else
        log_warning "Domain or SSL email not configured, skipping SSL setup"
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment of $PROJECT_NAME..."
    
    check_root
    check_docker
    check_env_file
    create_directories
    pull_changes
    deploy_services
    check_health
    
    # Load environment variables
    source "$ENV_FILE"
    
    # Setup SSL if configured
    setup_ssl
    
    log_success "Deployment completed successfully!"
    log_info "Application should be available at: https://focus-goal.com"
    
    log_info "To view logs: docker-compose logs -f"
    log_info "To stop services: docker-compose down"
}

# Run main function
main "$@"
