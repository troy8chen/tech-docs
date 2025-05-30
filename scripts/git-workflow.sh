#!/bin/bash

# Standard Git Workflow Helper for RAG Worker
# Simple, industry-standard branching

set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[Git]${NC} $1"; }
warn() { echo -e "${YELLOW}[Info]${NC} $1"; }
error() { echo -e "${RED}[Error]${NC} $1"; exit 1; }

if [ ! -d ".git" ]; then
    error "Not in a git repository"
fi

# Start new feature
start_feature() {
    if [ -z "$1" ]; then
        error "Feature name required: ./git-workflow.sh feature worker-optimization"
    fi
    
    log "Starting feature: $1"
    git checkout staging
    git pull origin staging
    git checkout -b "feature/$1"
    log "✅ Created feature branch 'feature/$1'"
    warn "Work on your feature, then run: ./git-workflow.sh deploy staging"
}

# Deploy to staging
deploy_staging() {
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [[ ! $CURRENT_BRANCH == feature/* ]]; then
        error "Must be on a feature branch to deploy to staging"
    fi
    
    log "Deploying feature to staging..."
    
    # Push feature branch
    git push origin "$CURRENT_BRANCH"
    
    # Merge to staging
    git checkout staging
    git pull origin staging
    git merge --no-ff "$CURRENT_BRANCH"
    git push origin staging
    
    log "✅ Feature merged to staging"
    warn "🚀 Now deploy 'staging' branch in Render dashboard"
    warn "💡 Test staging, then run: ./git-workflow.sh deploy production"
}

# Deploy to production
deploy_production() {
    log "Deploying staging to production..."
    
    git checkout main
    git pull origin main
    git merge --no-ff staging
    git push origin main
    
    log "✅ Staging merged to main"
    warn "🚀 Now deploy 'main' branch in Render dashboard"
    
    # Clean up feature branch
    MERGED_FEATURES=$(git branch --merged main | grep feature/ | head -1)
    if [ ! -z "$MERGED_FEATURES" ]; then
        git branch -d $MERGED_FEATURES 2>/dev/null || true
        log "🧹 Cleaned up merged feature branches"
    fi
}

# Hotfix (emergency production fix)
hotfix() {
    if [ -z "$1" ]; then
        error "Hotfix description required: ./git-workflow.sh hotfix 'fix Redis timeout'"
    fi
    
    log "Creating hotfix branch..."
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$(date +%Y%m%d-%H%M)"
    
    log "✅ Hotfix branch created"
    warn "Make your fix, commit, then run: ./git-workflow.sh deploy production"
}

# Show current status
status() {
    CURRENT_BRANCH=$(git branch --show-current)
    log "Current branch: $CURRENT_BRANCH"
    
    case $CURRENT_BRANCH in
        feature/*)
            warn "📝 Working on feature. Next: ./git-workflow.sh deploy staging"
            ;;
        staging)
            warn "🧪 On staging branch. Next: ./git-workflow.sh deploy production"
            ;;
        main)
            warn "🚀 On production branch"
            ;;
        hotfix/*)
            warn "🚨 Working on hotfix. Next: ./git-workflow.sh deploy production"
            ;;
        *)
            warn "Unknown branch. Use: ./git-workflow.sh feature <name>"
            ;;
    esac
}

case "$1" in
    "feature")
        start_feature "$2"
        ;;
    "deploy")
        case "$2" in
            "staging") deploy_staging ;;
            "production") deploy_production ;;
            *) error "Usage: ./git-workflow.sh deploy [staging|production]" ;;
        esac
        ;;
    "hotfix")
        hotfix "$2"
        ;;
    "status")
        status
        ;;
    *)
        echo "Standard Git Workflow for RAG Worker"
        echo ""
        echo "Usage:"
        echo "  ./git-workflow.sh feature <name>        - Start new feature"
        echo "  ./git-workflow.sh deploy staging        - Deploy feature to staging"
        echo "  ./git-workflow.sh deploy production     - Deploy staging to production"
        echo "  ./git-workflow.sh hotfix '<desc>'       - Emergency production fix"
        echo "  ./git-workflow.sh status                - Show current status"
        echo ""
        echo "Examples:"
        echo "  ./git-workflow.sh feature worker-optimization"
        echo "  ./git-workflow.sh deploy staging"
        echo "  ./git-workflow.sh deploy production"
        echo "  ./git-workflow.sh hotfix 'fix Redis connection'"
        echo ""
        echo "Workflow: feature → staging (test) → production"
        ;;
esac 