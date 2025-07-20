#!/bin/bash

# Database Switch Script
# Easily switch between mock and Aurora PostgreSQL database

set -e

echo "🔄 Database Configuration Switcher"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Function to switch to mock database
switch_to_mock() {
    echo "🔧 Switching to Mock Database..."
    sed -i.bak 's/^DATABASE_TYPE=postgresql/# DATABASE_TYPE=postgresql/' .env
    sed -i.bak 's/^# DATABASE_TYPE=mock/DATABASE_TYPE=mock/' .env
    echo "✅ Switched to Mock Database"
    echo "📝 Mock database is great for:"
    echo "   - Quick development without network dependencies"
    echo "   - Testing business logic"
    echo "   - Offline development"
}

# Function to switch to Aurora PostgreSQL
switch_to_aurora() {
    echo "🔧 Switching to Aurora PostgreSQL..."
    sed -i.bak 's/^DATABASE_TYPE=mock/# DATABASE_TYPE=mock/' .env
    sed -i.bak 's/^# DATABASE_TYPE=postgresql/DATABASE_TYPE=postgresql/' .env
    echo "✅ Switched to Aurora PostgreSQL"
    echo "📝 Aurora database provides:"
    echo "   - Production-like environment"
    echo "   - Real PostgreSQL features"
    echo "   - Data persistence"
    echo "   - Performance testing"
}

# Function to show current configuration
show_status() {
    echo "📊 Current Database Configuration:"
    echo ""
    
    if grep -q "^DATABASE_TYPE=mock" .env; then
        echo "   🔹 Active: Mock Database"
        echo "   🔸 Available: Aurora PostgreSQL (use './scripts/db-switch.sh aurora')"
    elif grep -q "^DATABASE_TYPE=postgresql" .env; then
        echo "   🔹 Active: Aurora PostgreSQL"
        echo "   🔸 Available: Mock Database (use './scripts/db-switch.sh mock')"
    else
        echo "   ❓ Unknown configuration"
    fi
    
    echo ""
    echo "📋 Connection Details:"
    echo "   Host: $(grep '^DB_HOST=' .env | cut -d'=' -f2-)"
    echo "   Port: $(grep '^DB_PORT=' .env | cut -d'=' -f2-)"
    echo "   Database: $(grep '^DB_NAME=' .env | cut -d'=' -f2-)"
    echo ""
}

# Function to test connection
test_connection() {
    echo "🔍 Testing database connection..."
    echo ""
    
    if command -v npm &> /dev/null; then
        echo "🚀 Starting NestJS application to test connection..."
        echo "   (Press Ctrl+C to stop after seeing successful startup)"
        echo ""
        npm run start:dev
    else
        echo "❌ npm not found. Please install Node.js and npm first."
        exit 1
    fi
}

# Main script logic
case "${1:-status}" in
    "mock"|"m")
        switch_to_mock
        echo ""
        show_status
        ;;
    "aurora"|"a"|"postgresql"|"pg")
        switch_to_aurora
        echo ""
        show_status
        ;;
    "status"|"s"|"")
        show_status
        ;;
    "test"|"t")
        test_connection
        ;;
    "help"|"h"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  mock, m          Switch to Mock Database"
        echo "  aurora, a        Switch to Aurora PostgreSQL"
        echo "  status, s        Show current configuration (default)"
        echo "  test, t          Test database connection"
        echo "  help, h          Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 mock          # Switch to mock database"
        echo "  $0 aurora        # Switch to Aurora PostgreSQL"
        echo "  $0 status        # Show current status"
        echo "  $0 test          # Test connection"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "💡 Pro Tips:"
echo "   - Use mock database for quick development"
echo "   - Use Aurora for testing production features"
echo "   - Run 'npm run start:dev' to start the application"
echo "   - Check logs for connection status"