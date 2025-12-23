#!/bin/bash

# Quick start script for 3D Interactive Globe
# This script helps you get the application running quickly

set -e

echo "🌍 3D Interactive Globe - Quick Start"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask user which mode to run
echo "Select mode:"
echo "  1) Development (with hot-reload)"
echo "  2) Production"
echo ""
read -p "Enter choice [1-2]: " mode

case $mode in
    1)
        echo ""
        echo "🚀 Starting development environment..."
        echo "   - Backend will run on http://localhost:3000"
        echo "   - Frontend will run on http://localhost:5173"
        echo "   - PostgreSQL on localhost:5432"
        echo "   - Redis on localhost:6379"
        echo ""
        
        # Create .env file if it doesn't exist
        if [ ! -f .env ]; then
            echo "📝 Creating .env file from template..."
            cp .env.example .env
        fi
        
        # Start development services
        docker-compose -f docker-compose.dev.yml up -d
        
        echo ""
        echo "⏳ Waiting for services to be healthy..."
        sleep 10
        
        # Show logs
        echo ""
        echo "📋 Service status:"
        docker-compose -f docker-compose.dev.yml ps
        
        echo ""
        echo "✅ Development environment is running!"
        echo ""
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://localhost:3000"
        echo "   Health:   http://localhost:3000/health"
        echo ""
        echo "💡 Tips:"
        echo "   - View logs: docker-compose -f docker-compose.dev.yml logs -f"
        echo "   - Stop: docker-compose -f docker-compose.dev.yml down"
        echo "   - Restart: docker-compose -f docker-compose.dev.yml restart [service]"
        echo ""
        ;;
        
    2)
        echo ""
        echo "🚀 Starting production environment..."
        echo "   - Frontend will run on http://localhost:8080"
        echo "   - Backend will run on http://localhost:3000"
        echo "   - PostgreSQL on localhost:5432"
        echo "   - Redis on localhost:6379"
        echo ""
        
        # Create .env file if it doesn't exist
        if [ ! -f .env ]; then
            echo "📝 Creating .env file from template..."
            cp .env.example .env
        fi
        
        # Build and start production services
        echo "🔨 Building Docker images (this may take a few minutes)..."
        docker-compose build
        
        echo ""
        echo "🚀 Starting services..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Waiting for services to be healthy..."
        sleep 15
        
        # Show logs
        echo ""
        echo "📋 Service status:"
        docker-compose ps
        
        echo ""
        echo "✅ Production environment is running!"
        echo ""
        echo "   Frontend: http://localhost:8080"
        echo "   Backend:  http://localhost:3000"
        echo "   Health:   http://localhost:3000/health"
        echo ""
        echo "💡 Tips:"
        echo "   - View logs: docker-compose logs -f"
        echo "   - Stop: docker-compose down"
        echo "   - Restart: docker-compose restart [service]"
        echo ""
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again and select 1 or 2."
        exit 1
        ;;
esac

# Test health endpoint
echo "🔍 Testing health endpoint..."
sleep 5
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check failed. Check logs: docker-compose logs backend"
fi

echo ""
echo "🎉 Setup complete! Open your browser to get started."
echo ""
