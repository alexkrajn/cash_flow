#!/bin/bash

# Docker Installation Script for Ubuntu/Debian
# This script installs Docker and Docker Compose on a VPS

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root"
    exit 1
fi

log_info "Installing Docker and Docker Compose..."

# Update package index
log_info "Updating package index..."
apt-get update

# Install required packages
log_info "Installing required packages..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
log_info "Adding Docker's GPG key..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
log_info "Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
log_info "Updating package index..."
apt-get update

# Install Docker Engine
log_info "Installing Docker Engine..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
log_info "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Add current user to docker group (if not root)
if [[ -n "$SUDO_USER" ]]; then
    log_info "Adding $SUDO_USER to docker group..."
    usermod -aG docker "$SUDO_USER"
    log_warning "Please log out and log back in for group changes to take effect"
fi

# Install Docker Compose (standalone)
log_info "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create symlink for docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installation
log_info "Verifying installation..."
docker --version
docker-compose --version

log_success "Docker and Docker Compose installed successfully!"

# Show next steps
log_info "Next steps:"
log_info "1. Log out and log back in (if you were added to docker group)"
log_info "2. Run the deployment script: ./deploy.sh"
