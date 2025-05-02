#!/bin/bash
set -e # 如果任何命令失败，立即退出脚本

# --- 配置 ---
IMAGE_NAME="murmurs3"
CONTAINER_NAME="murmurs3"
REMOTE_USER="root"
REMOTE_HOST="206.237.2.2"
REMOTE_APP_DIR="/root/murmurs3/murmurs3" # 服务器上的应用目录
ENV_FILE_LOCAL_PATH=".env.production" # 本地 .env 文件路径
REMOTE_ENV_FILE_PATH="/root/murmurs3/murmurs3/.env.production" # 服务器上 .env 文件路径 (确保目录存在)
DOCKERFILE_PATH="Dockerfile" # Dockerfile 路径

# --- 步骤 ---


echo ">>> 1. Uploading .env file to server (using rsync)..."
# 使用 rsync 上传 .env 文件，通常比 scp 快，且只传差异
rsync -avz $ENV_FILE_LOCAL_PATH ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_ENV_FILE_PATH}

echo ">>> 2. Running deployment commands on server via SSH..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
    set -e # 在远程服务器上也使用 set -e
    echo ">>> 进入 $REMOTE_APP_DIR..."
    mkdir -p $REMOTE_APP_DIR
    cd $REMOTE_APP_DIR

    echo ">>> Pulling latest code from Git repository..."
    git pull

    echo ">>> Building Docker image locally..."
    # 使用新的 Dockerfile 构建镜像
    docker build -t $IMAGE_NAME -f $DOCKERFILE_PATH .

    echo ">>> Stopping old container..."
    docker stop $CONTAINER_NAME
    echo ">>> Removing old container..."
    docker rm $CONTAINER_NAME 


    echo ">>> Running new container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p 3000:3000 \
        --env-file $REMOTE_ENV_FILE_PATH \
        --network murmurs3-network \
        --restart unless-stopped \
        $IMAGE_NAME 

    echo ">>> Cleaning up old Docker images..."
    docker image prune -f # 删除悬空的旧镜像

    echo ">>> Deployment on server finished."
EOF

echo ">>> Deployment script completed."