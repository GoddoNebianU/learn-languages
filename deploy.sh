#!/bin/bash

# Next.js 项目部署脚本
set -e  # 遇到任何错误立即退出

# ===== 配置区域 =====
SERVER_IP="43.156.84.214"
SERVER_USER="ubuntu"
PROJECT_NAME="learn-languages"
LOCAL_PROJECT_DIR="/home/goddonebianu/Code/learn-languages"
REMOTE_PROJECT_DIR="/home/$SERVER_USER/$PROJECT_NAME"
BRANCH="main"  # 要部署的分支
NODE_ENV="production"
PORT="3000"  # 应用运行端口
# ===================

# 颜色输出函数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查本地更改
check_local_changes() {
    log_info "检查本地更改..."
    if ! git diff --quiet; then
        log_warn "发现未提交的更改，建议先提交更改"
        read -p "继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 构建项目
build_project() {
    log_info "开始构建项目..."
    cd "$LOCAL_PROJECT_DIR"
    
    # 安装依赖
    if ! npm ci --only=production; then
        log_error "npm install 失败"
        exit 1
    fi
    
    # 构建项目
    if ! npm run build; then
        log_error "构建失败"
        exit 1
    fi
    
    log_info "项目构建成功"
}

# 创建部署包
create_deployment_package() {
    log_info "创建部署包..."
    local temp_dir=$(mktemp -d)
    local package_name="${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # 复制需要的文件
    cp -r package.json package-lock.json next.config.js* .next public "$temp_dir/"
    
    # 如果有环境文件也复制
    if [ -f .env.production ]; then
        cp .env.production "$temp_dir/"
    fi
    
    # 创建压缩包
    cd "$temp_dir"
    tar -czf "/tmp/$package_name" .
    
    echo "$package_name"
}

# 部署到服务器
deploy_to_server() {
    local package_name=$1
    
    log_info "开始部署到服务器..."
    
    # 上传部署包
    if ! scp "/tmp/$package_name" $SERVER_USER@$SERVER_IP:/tmp/; then
        log_error "文件上传失败"
        exit 1
    fi
    
    # 执行远程部署命令
    ssh $SERVER_USER@$SERVER_IP << EOF
        set -e
        
        echo "在服务器上执行部署..."
        
        # 创建备份目录
        BACKUP_DIR="$REMOTE_PROJECT_DIR-backup-\$(date +%Y%m%d-%H%M%S)"
        if [ -d "$REMOTE_PROJECT_DIR" ]; then
            mkdir -p "\$BACKUP_DIR"
            cp -r "$REMOTE_PROJECT_DIR"/* "\$BACKUP_DIR/" || true
        fi
        
        # 创建项目目录
        mkdir -p "$REMOTE_PROJECT_DIR"
        
        # 解压新版本
        tar -xzf "/tmp/$package_name" -C "$REMOTE_PROJECT_DIR"
        
        # 清理临时文件
        rm -f "/tmp/$package_name"
        
        # 安装生产依赖
        cd "$REMOTE_PROJECT_DIR"
        npm ci --only=production
        
        echo "部署文件准备完成"
EOF
    
    log_info "文件部署完成"
}

# 重启服务
restart_service() {
    log_info "重启服务..."
    
    ssh $SERVER_USER@$SERVER_IP << EOF
        set -e
        
        cd "$REMOTE_PROJECT_DIR"
        
        # 使用 PM2 重启应用
        if command -v pm2 &> /dev/null; then
            # 如果应用已经在运行，重新加载
            if pm2 list | grep -q "$PROJECT_NAME"; then
                pm2 reload $PROJECT_NAME --update-env
            else
                # 第一次启动
                export PORT=$PORT
                pm2 start npm --name "$PROJECT_NAME" -- start
                pm2 save
                pm2 startup 2>/dev/null || true
            fi
        else
            # 如果没有 PM2，直接启动（不推荐生产环境）
            echo "警告: 未找到 PM2，直接启动进程"
            export PORT=$PORT
            npm start &
        fi
        
        echo "等待服务启动..."
        sleep 5
        
        # 检查服务是否正常运行
        if curl -f http://localhost:$PORT > /dev/null 2>&1; then
            echo "服务启动成功!"
        else
            echo "服务启动可能有问题，请检查日志"
            exit 1
        fi
EOF
    
    log_info "服务重启完成"
}

# 清理工作
cleanup() {
    log_info "清理临时文件..."
    rm -f "/tmp/${PROJECT_NAME}-*.tar.gz" 2>/dev/null || true
}

# 主部署流程
main() {
    log_info "开始部署 $PROJECT_NAME 到 $SERVER_IP"
    
    # 检查是否在项目目录
    if [ ! -f "$LOCAL_PROJECT_DIR/package.json" ]; then
        log_error "请在正确的 Next.js 项目目录中运行"
        exit 1
    fi
    
    check_local_changes
    build_project
    local package_name=$(create_deployment_package)
    deploy_to_server "$package_name"
    restart_service
    cleanup
    
    log_info "${GREEN}部署成功完成!${NC}"
    log_info "应用地址: http://$SERVER_IP:$PORT"
}

# 错误处理
trap 'log_error "部署过程中断"; cleanup; exit 1' INT TERM
trap 'cleanup' EXIT

# 执行主函数
main "$@"