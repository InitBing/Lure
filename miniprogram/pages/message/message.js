/**
 * 消息页面
 */

const app = getApp();

Page({
  data: {
    conversations: [],
    currentConversation: null,
    messages: [],
    inputText: '',
    userId: 0,
    userInfo: {},
    scrollToView: ''
  },

  onLoad(options) {
    const userInfo = app.getCurrentUser();
    this.setData({
      userId: userInfo?.id || 0,
      userInfo: userInfo || {}
    });

    if (options.user_id) {
      // 从其他页面跳转来聊天
      this.startConversation(parseInt(options.user_id));
    } else {
      this.loadConversations();
    }
  },

  // 加载会话列表
  async loadConversations() {
    try {
      const res = await app.request('/messages/conversations');
      if (res.code === 0) {
        this.setData({ conversations: res.data.list || [] });
      }
    } catch (err) {
      console.error('加载会话失败:', err);
    }
  },

  // 进入会话
  async enterConversation(e) {
    const conversation = e.currentTarget.dataset.conversation;
    this.setData({
      currentConversation: conversation,
      messages: []
    });
    await this.loadMessages();
  },

  // 开始新会话
  startConversation(partnerId) {
    const ids = [this.data.userId, partnerId].sort();
    this.setData({
      currentConversation: {
        conversation_id: `${ids[0]}_${ids[1]}`,
        partner: { id: partnerId }
      },
      messages: []
    });
    this.loadMessages();
  },

  // 加载消息列表
  async loadMessages() {
    try {
      const res = await app.request('/messages', {
        data: {
          conversation_id: this.data.currentConversation.conversation_id,
          page: 1,
          page_size: 50
        }
      });

      if (res.code === 0) {
        this.setData({ messages: res.data.list || [] });
        // 滚动到底部
        setTimeout(() => {
          const lastMsg = this.data.messages[this.data.messages.length - 1];
          if (lastMsg) {
            this.setData({ scrollToView: `msg-${lastMsg.id}` });
          }
        }, 100);
      }
    } catch (err) {
      console.error('加载消息失败:', err);
    }
  },

  // 输入
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  // 发送消息
  async onSend() {
    if (!this.data.inputText.trim()) return;

    const content = this.data.inputText.trim();
    this.setData({ inputText: '' });

    try {
      const res = await app.request('/messages', {
        method: 'POST',
        data: {
          receiver_id: this.data.currentConversation.partner.id,
          type: 1,
          content
        }
      });

      if (res.code === 0) {
        // 添加到消息列表
        const newMessage = res.data.message;
        this.setData({
          messages: [...this.data.messages, newMessage]
        });
        // 滚动到底部
        setTimeout(() => {
          this.setData({ scrollToView: `msg-${newMessage.id}` });
        }, 100);
      }
    } catch (err) {
      console.error('发送失败:', err);
      app.toast('发送失败');
      // 恢复输入
      this.setData({ inputText: content });
    }
  },

  // 返回会话列表
  backToConversations() {
    this.setData({
      currentConversation: null,
      messages: []
    });
    this.loadConversations();
  }
});
