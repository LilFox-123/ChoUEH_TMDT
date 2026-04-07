// ===== Chợ UEH - Messages (AJAX Chat) =====
// FIX 1: Spinner only on initial load, not during polling
// FIX 2: Optimistic UI for sending messages (instant feedback)
// FIX 3: Diff-based message polling (only append new messages)
// FIX 4: Dirty flag for conversation list (update only when needed)
// FIX 5: Adaptive polling with Page Visibility API (pause when tab hidden)
// FIX 6: Scroll preservation (don't jump when user is reading old messages)

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
    wrapper.dataset.messageId = message._id;

    const bubble = document.createElement('div');
    bubble.className = 'bg-[#005f69] text-white px-4 py-2.5 rounded-2xl rounded-br-none shadow-md max-w-[80%]';

    appendTextElement(bubble, 'p', 'text-sm', message.content);
    appendTextElement(bubble, 'span', 'text-[9px] text-[#a7eefa]/60 mt-1 block text-right', timeText);

    wrapper.appendChild(bubble);
    return wrapper;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-end gap-2 max-w-[80%]';
  wrapper.dataset.messageId = message._id;

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
  let lastMessageId = null;           // FIX 3: Track last message for diff
  let conversationsDirty = true;      // FIX 4: Dirty flag for conversations
  let pollIntervalId = null;          // FIX 5: Adaptive polling interval ID
  const POLL_INTERVAL = 8000;         // FIX 5: 8 seconds instead of 5

  // Check URL params for direct chat
  const urlParams = new URLSearchParams(window.location.search);
  const directUserId = urlParams.get('userId');
  const directProductId = urlParams.get('productId');

  // Load conversations
  async function loadConversations() {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      const list = document.getElementById('conversation-list');

      if (data.success) {
        renderConversationList(list, data.data || [], activeChat);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }

  // FIX 6: Check if user is near bottom of chat
  function isNearBottom(container) {
    return container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
  }

  // FIX 3: Append only new messages to container
  function appendNewMessages(container, newMessages, currentUserId) {
    const fragment = document.createDocumentFragment();
    newMessages.forEach((message) => {
      fragment.appendChild(createMessageBubble(message, currentUserId));
    });
    container.appendChild(fragment);
  }

  // Open chat
  window.openChat = async function (userId, productId, name, productTitle) {
    activeChat = { userId, productId };
    lastMessageId = null;  // FIX 3: Reset on new chat
    conversationsDirty = true;  // FIX 4: Mark dirty on chat open

    document.getElementById('chat-placeholder').classList.add('hidden');
    document.getElementById('chat-window').classList.remove('hidden');
    document.getElementById('chat-name').textContent = name;
    document.getElementById('chat-product-name').textContent = productTitle;

    await loadMessages(userId, productId, { showSpinner: true });  // FIX 1: Show spinner on initial
    loadConversations();
  };

  // Load messages - FIX 1: Added options.showSpinner
  async function loadMessages(userId, productId, options = {}) {
    const { showSpinner = false } = options;
    const container = document.getElementById('chat-messages');

    // FIX 1: Only show spinner on initial load
    if (showSpinner) {
      renderMessageLoading(container);
    }

    try {
      const res = await fetch(`/api/messages/${userId}/${productId}`);
      const data = await res.json();

      if (data.success) {
        const messages = data.data || [];
        const newLastId = messages.length > 0 ? messages[messages.length - 1]._id : null;

        // FIX 3: Diff-based update
        if (lastMessageId === null || showSpinner) {
          // First load or spinner shown - full render
          renderMessages(container, messages, user._id);
          container.scrollTop = container.scrollHeight;
        } else if (newLastId !== lastMessageId) {
          // FIX 3: Find new messages and append only those
          const lastIndex = messages.findIndex(m => m._id === lastMessageId);
          const newMessages = lastIndex >= 0 ? messages.slice(lastIndex + 1) : messages;

          if (newMessages.length > 0) {
            // FIX 6: Check scroll position before appending
            const wasNearBottom = isNearBottom(container);

            appendNewMessages(container, newMessages, user._id);

            // FIX 6: Only auto-scroll if user was near bottom
            if (wasNearBottom) {
              container.scrollTop = container.scrollHeight;
            }

            // FIX 4: Mark conversations dirty when new messages arrive
            conversationsDirty = true;
          }
        }
        // else: no new messages, skip DOM update entirely

        lastMessageId = newLastId;
      }
    } catch (err) {
      if (showSpinner) {
        renderMessagesError(container);
      }
      console.error('Failed to load messages:', err);
    }
  }

  // Send message - FIX 2: Optimistic UI
  const messageForm = document.getElementById('message-form');
  if (messageForm) {
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeChat) return;

      const input = document.getElementById('message-input');
      const sendBtn = messageForm.querySelector('button[type="submit"]');
      const content = input.value.trim();
      if (!content) return;

      // FIX 2: Clear input immediately
      const savedContent = content;
      input.value = '';

      // FIX 2: Create optimistic message
      const optimisticId = 'optimistic-' + Date.now();
      const optimisticMessage = {
        _id: optimisticId,
        sender: { _id: user._id },
        content: savedContent,
        createdAt: new Date().toISOString()
      };

      // FIX 2: Append optimistic bubble immediately
      const container = document.getElementById('chat-messages');
      const optimisticBubble = createMessageBubble(optimisticMessage, user._id);
      container.appendChild(optimisticBubble);

      // FIX 2 + FIX 6: Always scroll to bottom when user sends
      container.scrollTop = container.scrollHeight;

      // FIX 2: Disable send button
      if (sendBtn) {
        sendBtn.classList.add('opacity-50', 'pointer-events-none');
      }

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverId: activeChat.userId,
            productId: activeChat.productId,
            content: savedContent
          })
        });
        const data = await res.json();

        // FIX 2: Re-enable send button
        if (sendBtn) {
          sendBtn.classList.remove('opacity-50', 'pointer-events-none');
        }

        if (data.success) {
          // FIX 2: Replace optimistic bubble with real message
          const realMessage = data.data;
          const existingBubble = container.querySelector(`[data-message-id="${optimisticId}"]`);
          if (existingBubble && realMessage) {
            const realBubble = createMessageBubble(realMessage, user._id);
            existingBubble.replaceWith(realBubble);
            lastMessageId = realMessage._id;  // Update tracking
          }

          // FIX 4: Mark conversations dirty after send
          conversationsDirty = true;
        } else {
          // FIX 2: Error - remove optimistic, restore input
          const failedBubble = container.querySelector(`[data-message-id="${optimisticId}"]`);
          if (failedBubble) failedBubble.remove();
          input.value = savedContent;
          window.AppUtils.showToast('Lỗi gửi tin nhắn', 'error');
        }
      } catch (err) {
        // FIX 2: Re-enable send button on error
        if (sendBtn) {
          sendBtn.classList.remove('opacity-50', 'pointer-events-none');
        }

        // FIX 2: Remove optimistic bubble and restore input
        const failedBubble = container.querySelector(`[data-message-id="${optimisticId}"]`);
        if (failedBubble) failedBubble.remove();
        input.value = savedContent;
        window.AppUtils.showToast('Lỗi gửi tin nhắn', 'error');
      }
    });
  }

  // FIX 5: Polling function
  function pollMessages() {
    if (activeChat) {
      loadMessages(activeChat.userId, activeChat.productId, { showSpinner: false });
    }

    // FIX 4: Only reload conversations if dirty
    if (conversationsDirty) {
      loadConversations();
      conversationsDirty = false;
    }
  }

  // FIX 5: Start polling
  function startPolling() {
    if (pollIntervalId) return;  // Already polling
    pollIntervalId = setInterval(pollMessages, POLL_INTERVAL);
  }

  // FIX 5: Stop polling
  function stopPolling() {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  }

  // FIX 5: Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Tab became visible - fetch immediately and restart polling
      pollMessages();
      startPolling();
    } else {
      // Tab hidden - pause polling
      stopPolling();
    }
  });

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

  // FIX 5: Start polling (only if tab is visible)
  if (document.visibilityState === 'visible') {
    startPolling();
  }
});
