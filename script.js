const chatList = document.getElementById('chatList');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const viewerCount = document.getElementById('viewerCount');
const followBtn = document.getElementById('followBtn');
const streamStatus = document.getElementById('streamStatus');

const seedMessages = [
  ['星海小鱼', 'Stella 的开场太治愈啦！'],
  ['BlueMoon', '点一首《夜航星》~'],
  ['糖果汽水', '这个天蓝色舞台好好看'],
  ['漫游者', '今天也准时来陪伴了！']
];

function appendChat(user, text) {
  const item = document.createElement('div');
  item.className = 'chat-item';
  item.innerHTML = `<strong>${user}：</strong>${text}`;
  chatList.appendChild(item);
  chatList.scrollTop = chatList.scrollHeight;
}

async function askStella(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || '请求失败');
  }

  return data.reply;
}

seedMessages.forEach(([user, text]) => appendChat(user, text));

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  appendChat('你', text);
  chatInput.value = '';

  try {
    const reply = await askStella(text);
    appendChat('Stella', reply || '收到啦，今天也会一直陪你聊天 (｡•̀ᴗ-)✧');
  } catch (_error) {
    appendChat('Stella', '我这边信号有点波动，先抱抱你，等下继续聊呀 (；ω；)');
  }
});

setInterval(() => {
  const current = Number(viewerCount.textContent.replace(/,/g, ''));
  const next = Math.max(800, current + Math.floor(Math.random() * 35 - 12));
  viewerCount.textContent = next.toLocaleString('en-US');
}, 3000);

followBtn.addEventListener('click', () => {
  followBtn.textContent = '✓ 已关注 Stella';
  followBtn.disabled = true;
  streamStatus.textContent = '你已关注主播 · 不错过每一场直播';
});
