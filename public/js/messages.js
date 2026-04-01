// ===== Chợ UEH - Messages (AJAX Chat) =====

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function createIcon(classes, iconName) {
  const icon = document.createElement('span');
  icon.className = classes;
  icon.textContent = iconName;
  return icon;
}

function clearElement(element) {
  element.textContent = '';
}

function appendTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function renderConversationList(list, conversations, activeChat) {
  clearElement(list);

  if (!conversations.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'p-6 text-center text-[#3f484a] text-sm';
    emptyState.appendChild(createIcon('material-symbols-outlined text-4xl text-[#bec8ca] mb-2 block', 'chat_bubble_outline'));
    emptyState.appendChild(document.createTextNode('Chưa có tin nhắn nào'));
    list.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();

  conversations.forEach((conversation) => {
    const isActive = activeChat
      && activeChat.userId === conversation.otherUser._id
      && activeChat.productId === conversation.product._id;

    const item = document.createElement('div');
    item.className = `flex items-center gap-3 p-4 hover:bg-[#e1eaeb] cursor-pointer transition-all ${isActive ? 'bg-white border-l-4 border-[#00464d]' : ''}`;
    item.addEventListener('click', () => {
      window.openChat(
        conversation.otherUser._id,
        conversation.product._id,
        conversation.otherUser.name,
        conversation.product.title
      );
    });

    const avatar = document.createElement('div');
    avatar.className = 'w-12 h-12 bg-[#a7eefa] rounded-full flex items-center justify-center text-[#00464d] shrink-0';
    avatar.appendChild(createIcon('material-symbols-outlined', 'person'));

    const content = document.createElement('div');
    content.className = 'flex-1 min-w-0';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-baseline';
    appendTextElement(header, 'h3', 'font-semibold text-sm truncate', conversation.otherUser.name);
    appendTextElement(header, 'span', 'text-[10px] text-[#6f797a]', window.AppUtils.timeAgo(conversation.lastDate));

    appendTextElement(content, 'p', 'text-xs text-[#6f797a] truncate', conversation.lastMessage);
    appendTextElement(content, 'span', 'text-[10px] text-[#6f797a]', conversation.product.title);
    content.insertBefore(header, content.firstChild);

    item.appendChild(avatar);
    item.appendChild(content);

    if (conversation.unreadCount > 0) {
      appendTextElement(
        item,
        'div',
        'w-5 h-5 bg-[#EC6D33] text-white text-[10px] font-bold rounded-full flex items-center justify-center',
        String(conversation.unreadCount)
      );
    }

    fragment.appendChild(item);
  });

  list.appendChild(fragment);
}

function renderMessageLoading(container) {
  clearElement(container);
  const wrapper = document.createElement('div');
  wrapper.className = 'text-center';
  const spinner = document.createElement('span');
  spinner.className = 'spinner-lg spinner';
  wrapper.appendChild(spinner);
  container.appendChild(wrapper);
}

function renderEmptyMessages(container) {
  clearElement(container);
  appendTextElement(container, 'div', 'text-center text-[#6f797a] text-sm py-8', 'Bắt đầu cuộc trò chuyện');
}

function renderMessagesError(container) {
  clearElement(container);
  appendTextElement(container, 'p', 'text-center text-red-500', 'Lỗi tải tin nhắn');
}

function createMessageBubble(message, currentUserId) {
  const isMine = message.sender._id === currentUserId;
  const timeText = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isMine) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-end gap-1';

    const bubble = document.createElement('div');
    bubble.className = 'bg-[#005f69] text-white px-4 py-2.5 rounded-2xl rounded-br-none shadow-md max-w-[80%]';

    appendTextElement(bubble, 'p', 'text-sm', message.content);
    appendTextElement(bubble, 'span', 'text-[9px] text-[#a7eefa]/60 mt-1 block text-right', timeText);

    wrapper.appendChild(bubble);
    return wrapper;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-end gap-2 max-w-[80%]';

  const avatar = document.createElement('div');
  avatar.className = 'w-6 h-6 bg-[#e1eaeb] rounded-full flex items-center justify-center';
  avatar.appendChild(createIcon('material-symbols-outlined text-xs text-[#3f484a]', 'person'));

  const bubble = document.createElement('div');
  bubble.className = 'bg-[#F1F1F1] text-[#151d1e] px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm';

  appendTextElement(bubble, 'p', 'text-sm', message.content);
  appendTextElement(bubble, 'span', 'text-[9px] text-[#6f797a] mt-1 block text-right', timeText);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  return wrapper;
}

function renderMessages(container, messages, currentUserId) {
  clearElement(container);

  if (!messages.length) {
    renderEmptyMessages(container);
    return;
  }

  const fragment = document.createDocumentFragment();
  messages.forEach((message) => {
    fragment.appendChild(createMessageBubble(message, currentUserId));
  });
  container.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = window.AppUtils.getUser() || await window.AppUtils.syncCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }
  let activeChat = null;

  // Check URL params for direct chat
  const urlParams = new URLSearchParams(window.location.search);
  const directUserId = urlParams.get('userId');
  const directProductId = urlParams.get('productId');

  // Load conversations
  async function loadConversations() {
    try {
      const res = await fetch('/api/messages/conversations', {
      });
      const data = await res.json();
      const list = document.getElementById('conversation-list');

      if (data.success) {
        renderConversationList(list, data.data || [], activeChat);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }

  // Open chat
  window.openChat = async function(userId, productId, name, productTitle) {
    activeChat = { userId, productId };

    document.getElementById('chat-placeholder').classList.add('hidden');
    document.getElementById('chat-window').classList.remove('hidden');
    document.getElementById('chat-name').textContent = name;
    document.getElementById('chat-product-name').textContent = productTitle;

    await loadMessages(userId, productId);
    loadConversations();
  };

  // Load messages
  async function loadMessages(userId, productId) {
    const container = document.getElementById('chat-messages');
    renderMessageLoading(container);

    try {
      const res = await fetch(`/api/messages/${userId}/${productId}`, {
      });
      const data = await res.json();

      if (data.success) {
        renderMessages(container, data.data || [], user._id);
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      renderMessagesError(container);
    }
  }

  // Send message
  const messageForm = document.getElementById('message-form');
  if (messageForm) {
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeChat) return;

      const input = document.getElementById('message-input');
      const content = input.value.trim();
      if (!content) return;

      input.value = '';

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverId: activeChat.userId,
            productId: activeChat.productId,
            content
          })
        });
        const data = await res.json();

        if (data.success) {
          await loadMessages(activeChat.userId, activeChat.productId);
          loadConversations();
        }
      } catch (err) {
        window.AppUtils.showToast('Lỗi gửi tin nhắn', 'error');
      }
    });
  }

  // Initial load
  loadConversations();

  // Direct chat from product detail
  if (directUserId && directProductId) {
    window.openChat(directUserId, directProductId, '', '');
    fetch(`/api/users/${directUserId}`).then((r) => r.json()).then((d) => {
      if (d.success) {
        document.getElementById('chat-name').textContent = d.user.displayName || d.user.name || 'Người dùng UEH';
      }
    });
    fetch(`/api/products/${directProductId}`).then((r) => r.json()).then((d) => {
      if (d.success) document.getElementById('chat-product-name').textContent = d.data.title;
    });
  }

  // Poll for new messages every 5 seconds
  setInterval(() => {
    if (activeChat) {
      loadMessages(activeChat.userId, activeChat.productId);
    }
    loadConversations();
  }, 5000);
});
