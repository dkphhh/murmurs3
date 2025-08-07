#!/bin/bash
set -e # 如果任何命令失败，立即退出脚本

# --- 配置 ---

IMAGE_NAME="murmurs3"
CONTAINER_NAME="murmurs3"
REMOTE_USER="root"
REMOTE_HOST="206.237.2.2"
REMOTE_APP_DIR="/root/murmurs3/app" # 服务器上的应用目录
DOCKERFILE_PATH="Dockerfile" # Dockerfile 路径

# 如果数据库也是通过 docker部署，需要先新建网络，然后再通过这种方式加入网络,确保数据库和应用在同一网络中
NETWORK_NAME="murmurs3-network" # Docker 网络名称

# --- 步骤 ---

echo ">>> 1. 上传前的准备"

echo ">>> 构建 build"
bun run build 

echo ">>> 上传 build 和 .env Dockerfile .dockerignore 到服务器..."

# 注意 source 路径末尾没有斜杠，表示复制整个目录
# destination 路径是应用目录
# 使用 --delete 可以在服务器上删除本地 build 目录中不存在的文件，保持同步
rsync -avz --delete build ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/ 

# 上传 .env 文件
rsync -avz .env ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}"/.env"

# 上传 Dockerfile 和 .dockerignore 文件
rsync -avz Dockerfile ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}"/Dockerfile"
rsync -avz .dockerignore ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}"/.dockerignore"

# 上传 package.json 和 bun.lock 文件
rsync -avz package.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}"/package.json"
rsync -avz bun.lock ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}"/bun.lock"



echo ">>> 2. 进入远程服务器..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
    set -e # 在远程服务器上也使用 set -e
    echo ">>> 进入 $REMOTE_APP_DIR..."
    mkdir -p $REMOTE_APP_DIR
    cd $REMOTE_APP_DIR

    echo ">>> Building Docker image locally..."
    # 使用新的 Dockerfile 构建镜像
    docker build -t $IMAGE_NAME -f $DOCKERFILE_PATH .

    echo ">>> 停止旧容器..."
    docker stop $CONTAINER_NAME || true # 如果容器不存在，忽略错误
    echo ">>> 删除旧容器..."
    docker rm $CONTAINER_NAME  || true # 如果容器不存在，忽略错误


    echo ">>> 运行新容器..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p 3000:3000 \
        --env-file ${REMOTE_APP_DIR}"/.env" \
        --restart unless-stopped \
        --network ${NETWORK_NAME} \
        $IMAGE_NAME 

    echo ">>> 删除所有未使用 Docker 资源..."

    echo ">>> 删除未使用的容器..."
    docker container prune -f 
    
    echo ">>> 删除未使用的镜像..."
    docker image prune -a -f 

    echo ">>> 线上部署完成."
EOF

echo ">>> 部署脚本完成."