# Stella AI 聊天后端部署（Node.js + Express）


## 0. 前提
- 代码目录：`/var/www/stella`
- Node.js 版本：`>= 18`（推荐 20）
- 已在站点 HTTPS `server` 块中配置好域名（`test.41v.top`）

先确认版本：
```bash
node -v
npm -v
```


## 1. 安装依赖
```bash
cd /var/www/stella
npm install --production
```

## 2. 配置环境变量
```bash
cd /var/www/stella

cp -n .env.example .env
nano .env
```

`.env` 示例：
```dotenv
DASHSCOPE_API_KEY=你的真实Key
QWEN_MODEL=qwen-plus
PORT=3000

```

## 3. 启动后端（临时）
```bash
cd /var/www/stella
npm start
```


健康检查：
```bash
curl http://127.0.0.1:3000/api/health
```

## 4. 使用 systemd 常驻（推荐）
创建文件：`/etc/systemd/system/stella-api.service`


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


执行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now stella-api
sudo systemctl status stella-api --no-pager
```


查看日志：
```bash
sudo journalctl -u stella-api -n 100 --no-pager
```

## 5. Nginx 反向代理 /api
把下面片段加到站点 **443 的 server 块**：


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


检查并重载：
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. 联调验证
```bash
curl https://test.41v.top/api/health
curl -X POST https://test.41v.top/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

---

## 常见问题排查

### A) `Unit stella-api.service not found`
说明 service 文件还没创建。按第 4 步创建后执行：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now stella-api
```

### B) `npm: command not found`
系统没装 Node.js/npm，或安装损坏。建议重装 Node 20：
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### C) `SyntaxError` 指向 `?.`
Node 版本过低。升级到 Node 18+（推荐 20）。

### D) `curl 127.0.0.1:3000` 连接拒绝
按顺序检查：
1. `systemctl status stella-api --no-pager`
2. `journalctl -u stella-api -n 100 --no-pager`
3. `grep -E '^(DASHSCOPE_API_KEY|QWEN_MODEL|PORT)=' /var/www/stella/.env`
4. 确认 `PORT` 与 Nginx `proxy_pass` 端口一致。

### E) 前端一直显示“信号波动”
说明 `/api/chat` 请求失败。请打开浏览器开发者工具 Network 看 `/api/chat` 状态码，同时看 `journalctl -u stella-api` 日志定位原因。

