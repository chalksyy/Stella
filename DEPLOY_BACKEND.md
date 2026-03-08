# Stella AI 聊天后端部署（Node.js + Express）

## 1. 安装依赖
```bash
cd /var/www/stella
npm install --production
```

## 2. 配置环境变量
```bash
cd /var/www/stella
cp .env.example .env
# 编辑 .env，填入 DASHSCOPE_API_KEY
```

## 3. 启动后端（临时）
```bash
cd /var/www/stella
npm start
```

## 4. 使用 systemd 常驻（推荐）
`/etc/systemd/system/stella-api.service`

```ini
[Unit]
Description=Stella AI API
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/stella
ExecStart=/usr/bin/node /var/www/stella/server.js
Restart=always
RestartSec=3
EnvironmentFile=/var/www/stella/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now stella-api
sudo systemctl status stella-api --no-pager
```

## 5. Nginx 反向代理 /api
把下面片段加到站点 `server` 中（443 的 server 块里）：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

改完执行：
```bash
sudo nginx -t && sudo systemctl reload nginx
```
