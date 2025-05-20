    FROM oven/bun:latest
    
    WORKDIR /app
    
    # 从 builder 阶段复制必要的依赖描述文件
    COPY package.json bun.lock ./

   # 安装构建依赖 (Python 和 build-essential for native modules like better-sqlite3)
   RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential && rm -rf /var/lib/apt/lists/*

    # 安装生产依赖 
    RUN bun install --production
    
    
    COPY build ./build
    
    # 暴露端口
    EXPOSE 3000
    
    
    # 运行应用的命令
    CMD ["bun", "run", "./build/index.js"]


# ------------------ 上述为镜像构建部分，下面是启动部分----------------------

    # docker run -d \
    # --name murmurs3 \
    # -p 3000:3000 \
    # --env-file .env.production \ # 指定包含环境变量的文件
    # --network murmurs3-network\ # 加入网络,确保数据库和应用在同一网络中
    # --restart unless-stopped \
    # murmurs3