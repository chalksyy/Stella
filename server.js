import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.QWEN_MODEL || 'qwen-plus';
const apiKey = process.env.DASHSCOPE_API_KEY;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model });
});

app.post('/api/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();

  if (!message) {
    return res.status(400).json({ error: 'message 不能为空' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 DASHSCOPE_API_KEY' });
  }

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 160,
        messages: [
          {
            role: 'system',
            content:
              '你是虚拟偶像 Stella。回复风格：温柔、简短、偶像口吻、每次1-2句话，可带颜文字。避免长篇大论。'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!response.ok || !reply) {
      const detail = data?.error?.message || '千问返回异常';
      return res.status(502).json({ error: detail });
    }

    return res.json({ reply });
  } catch (_error) {
    return res.status(502).json({ error: '调用千问失败，请稍后重试' });
  }
});

app.listen(port, () => {
  console.log(`Stella API listening on :${port}`);
});
