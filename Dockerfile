# --- Build Stage ---
    FROM oven/bun:latest AS builder

    WORKDIR /app
    
    # 复制所有源代码
    COPY . .

    # 安装构建依赖 (Python 和 build-essential)
    RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential libvips-dev && rm -rf /var/lib/apt/lists/*


    # 安装所有依赖 (包括 devDependencies 用于构建)
    RUN bun install
    

    # 运行构建命令
    RUN bun run build
    
# --- Production Stage ---
    FROM oven/bun:latest
    
    WORKDIR /app
    
    # 从 builder 阶段复制必要的依赖描述文件
    COPY --from=builder /app/package.json /app/bun.lock ./
    
    # 安装生产依赖 (利用缓存)
    # 如果你的生产依赖很少变动，可以先只复制 package.json/bun.lockb 安装，再复制构建产物
    # 但如果构建产物和依赖经常一起变，这样也可以
    RUN bun install --production
    
    # 从 builder 阶段复制构建好的应用
    COPY --from=builder /app/build ./build
    
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