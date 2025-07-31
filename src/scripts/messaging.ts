import { messagingApi, authApi } from '../utils/api';
import socketService from '../utils/socket';
import type { Conversation, Message, User } from '../types';

class MessagingApp {
  private currentUser: User | null = null;
  private currentConversation: Conversation | null = null;
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private typingTimeout: NodeJS.Timeout | null = null;
  private onlineUsers: Set<string> = new Set();
  private selectedFiles: File[] = [];

  // DOM elements
  private elements = {
    conversationsList: document.getElementById('conversations-list') as HTMLElement,
    conversationsLoading: document.getElementById('conversations-loading') as HTMLElement,
    conversationsEmpty: document.getElementById('conversations-empty') as HTMLElement,
    conversationSearch: document.getElementById('conversation-search') as HTMLInputElement,
    welcomeState: document.getElementById('welcome-state') as HTMLElement,
    chatInterface: document.getElementById('chat-interface') as HTMLElement,
    chatAvatar: document.getElementById('chat-avatar') as HTMLImageElement,
    chatName: document.getElementById('chat-name') as HTMLElement,
    chatOnlineStatus: document.getElementById('chat-online-status') as HTMLElement,
    chatStatusText: document.getElementById('chat-status-text') as HTMLElement,
    typingIndicator: document.getElementById('typing-indicator') as HTMLElement,
    messagesContainer: document.getElementById('messages-container') as HTMLElement,
    messageInput: document.getElementById('message-input') as HTMLTextAreaElement,
    sendBtn: document.getElementById('send-btn') as HTMLButtonElement,
    fileUploadBtn: document.getElementById('file-upload-btn') as HTMLButtonElement,
    fileInput: document.getElementById('file-input') as HTMLInputElement,
    filePreview: document.getElementById('file-preview') as HTMLElement,
    fileList: document.getElementById('file-list') as HTMLElement,
    clearFilesBtn: document.getElementById('clear-files-btn') as HTMLButtonElement,
    statusIndicator: document.getElementById('status-indicator') as HTMLElement,
    statusText: document.getElementById('status-text') as HTMLElement,
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Get current user
      const { user } = await authApi.getCurrentUser();
      this.currentUser = user;

      // Initialize socket connection
      await this.initializeSocket();

      // Set up event listeners
      this.setupEventListeners();

      // Load conversations
      await this.loadConversations();

    } catch (error) {
      console.error('❌ Failed to initialize messaging app:', error);
      this.showError('Failed to load messaging. Please refresh the page.');
    }
  }

  private async initializeSocket(): Promise<void> {
    try {
      await socketService.connect();
      this.updateConnectionStatus(true);

      // Set up socket event listeners
      socketService.on('connect', () => {
        this.updateConnectionStatus(true);
      });

      socketService.on('disconnect', () => {
        this.updateConnectionStatus(false);
      });

      socketService.on('new_message', (message: Message) => {
        this.handleNewMessage(message);
      });

      socketService.on('user_typing', (data: { userId: string; conversationId: string; isTyping: boolean }) => {
        this.handleTypingIndicator(data);
      });

      socketService.on('messages_read', (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
        this.handleMessagesRead(data);
      });

      socketService.on('user_online', (data: { userId: string; isOnline: boolean }) => {
        this.handleUserOnlineStatus(data);
      });

    } catch (error) {
      console.error('Socket connection failed:', error);
      this.updateConnectionStatus(false);
    }
  }

  private setupEventListeners(): void {
    // Conversation search
    this.elements.conversationSearch.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterConversations(query);
    });

    // Message input
    this.elements.messageInput.addEventListener('input', () => {
      this.handleMessageInputChange();
    });

    this.elements.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Send button
    this.elements.sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    // File upload
    this.elements.fileUploadBtn.addEventListener('click', () => {
      this.elements.fileInput.click();
    });

    this.elements.fileInput.addEventListener('change', (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      this.handleFileSelection(files);
    });

    this.elements.clearFilesBtn.addEventListener('click', () => {
      this.clearSelectedFiles();
    });

    // Auto-resize textarea
    this.elements.messageInput.addEventListener('input', () => {
      this.autoResizeTextarea();
    });
  }

  private async loadConversations(): Promise<void> {
    try {
      this.elements.conversationsLoading.classList.remove('hidden');
      
      const response = await messagingApi.getConversations();
      this.conversations = response.conversations;

      this.renderConversations();

    } catch (error) {
      console.error('Failed to load conversations:', error);
      this.showError('Failed to load conversations');
    } finally {
      this.elements.conversationsLoading.classList.add('hidden');
    }
  }

  private renderConversations(): void {
    const container = this.elements.conversationsList;
    
    // Clear existing content
    container.innerHTML = '';

    if (this.conversations.length === 0) {
      this.elements.conversationsEmpty.classList.remove('hidden');
      return;
    }

    this.elements.conversationsEmpty.classList.add('hidden');

    this.conversations.forEach(conversation => {
      const conversationElement = this.createConversationElement(conversation);
      container.appendChild(conversationElement);
    });
  }

  private createConversationElement(conversation: Conversation): HTMLElement {
    const otherUser = conversation.participant;
    const isOnline = this.onlineUsers.has(otherUser?.id || '');
    const unreadCount = conversation.unreadCount || 0;

    const div = document.createElement('div');
    div.className = `conversation-item p-4 hover:bg-gray-50 cursor-pointer ${
      this.currentConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
    }`;
    div.dataset.conversationId = conversation.id;

    div.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="relative">
          <img 
            src="${otherUser?.profileImage || '/default-avatar.svg'}" 
            alt="${otherUser?.firstName} ${otherUser?.lastName}"
            class="w-12 h-12 rounded-full bg-gray-300"
          />
          <div class="absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-gray-900 truncate">
              ${otherUser?.firstName} ${otherUser?.lastName}
            </h4>
            ${unreadCount > 0 ? `<span class="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">${unreadCount}</span>` : ''}
          </div>
          <p class="text-sm text-gray-500 truncate">
            ${conversation.lastMessagePreview || 'No messages yet'}
          </p>
          <p class="text-xs text-gray-400">
            ${conversation.lastMessageAt ? this.formatRelativeTime(new Date(conversation.lastMessageAt)) : ''}
          </p>
        </div>
      </div>
    `;

    div.addEventListener('click', () => {
      this.selectConversation(conversation);
    });

    return div;
  }

  private async selectConversation(conversation: Conversation): Promise<void> {
    try {
      // Leave previous conversation
      if (this.currentConversation) {
        socketService.leaveConversation(this.currentConversation.id);
      }

      this.currentConversation = conversation;
      
      // Join new conversation
      socketService.joinConversation(conversation.id);

      // Update UI
      this.showChatInterface();
      this.updateChatHeader();
      this.updateConversationSelection();

      // Load messages
      await this.loadMessages();

      // Mark messages as read
      await this.markMessagesAsRead();

      // Get online users
      socketService.getConversationOnlineUsers(conversation.id);

    } catch (error) {
      console.error('❌ Failed to select conversation:', error);
      this.showError('Failed to load conversation');
    }
  }

  private showChatInterface(): void {
    this.elements.welcomeState.classList.add('hidden');
    this.elements.chatInterface.classList.remove('hidden');
  }

  private updateChatHeader(): void {
    if (!this.currentConversation?.participant) return;

    const otherUser = this.currentConversation.participant;
    const isOnline = this.onlineUsers.has(otherUser.id);

    this.elements.chatAvatar.src = otherUser.profileImage || '/default-avatar.svg';
    this.elements.chatAvatar.alt = `${otherUser.firstName} ${otherUser.lastName}`;
    this.elements.chatName.textContent = `${otherUser.firstName} ${otherUser.lastName}`;
    
    this.elements.chatOnlineStatus.className = `w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`;
    this.elements.chatStatusText.textContent = isOnline ? 'Online' : 'Offline';
  }

  private updateConversationSelection(): void {
    // Remove selection from all conversations
    document.querySelectorAll('.conversation-item').forEach(el => {
      el.classList.remove('bg-blue-50', 'border-r-2', 'border-blue-500');
    });

    // Add selection to current conversation
    const currentElement = document.querySelector(`[data-conversation-id="${this.currentConversation?.id}"]`);
    if (currentElement) {
      currentElement.classList.add('bg-blue-50', 'border-r-2', 'border-blue-500');
    }
  }

  private async loadMessages(): Promise<void> {
    if (!this.currentConversation) return;

    try {
      const response = await messagingApi.getMessages(this.currentConversation.id);
      this.messages = response.messages.reverse(); // Reverse to show oldest first
      this.renderMessages();
      this.scrollToBottom();

    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      this.showError('Failed to load messages');
    }
  }

  private renderMessages(): void {
    const container = this.elements.messagesContainer;
    container.innerHTML = '';

    if (this.messages.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>';
      return;
    }

    this.messages.forEach((message, index) => {
      const messageElement = this.createMessageElement(message, index);
      container.appendChild(messageElement);
    });
  }

  private createMessageElement(message: Message, index: number): HTMLElement {
    const isOwnMessage = message.senderId === this.currentUser?.id;
    const showAvatar = index === 0 || this.messages[index - 1].senderId !== message.senderId;
    const sender = message.sender || this.currentUser;

    const div = document.createElement('div');
    div.className = `message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`;

    div.innerHTML = `
      <div class="message-content-container">
        ${!isOwnMessage && showAvatar ? `
          <div class="flex items-center space-x-2 mb-1">
            <img 
              src="${sender?.profileImage || sender?.profileImageUrl || '/default-avatar.svg'}" 
              alt="${sender?.firstName}"
              class="message-avatar"
            />
            <span class="text-sm text-gray-600 font-medium">${sender?.firstName} ${sender?.lastName}</span>
          </div>
        ` : ''}
        
        <div class="message-content-bubble ${isOwnMessage ? 'own' : 'other'}">
          ${this.renderMessageContent(message)}
        </div>
        
        <div class="flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}">
          <span class="text-xs text-gray-500">
            ${this.formatTime(new Date(message.createdAt))}
          </span>
          ${isOwnMessage ? this.renderMessageStatus(message) : ''}
        </div>
      </div>
    `;

    return div;
  }

  private renderMessageContent(message: Message): string {
    let content = this.escapeHtml(message.content);

    // Handle file attachments
    if (message.attachments && message.attachments.length > 0) {
      const attachmentsHtml = message.attachments.map(attachment => {
        if (attachment.fileType.startsWith('image/')) {
          return `
            <div class="mt-2">
              <img 
                src="${attachment.fileUrl}" 
                alt="${attachment.fileName}"
                class="attachment-image"
                onclick="window.open('${attachment.fileUrl}', '_blank')"
              />
            </div>
          `;
        } else {
          return `
            <div class="attachment-file">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
              </svg>
              <a href="${attachment.fileUrl}" target="_blank" class="text-sm">
                ${attachment.fileName}
              </a>
            </div>
          `;
        }
      }).join('');

      content += attachmentsHtml;
    }

    return content;
  }

  private renderMessageStatus(message: Message): string {
    switch (message.status) {
      case 'sent':
        return '<svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
      case 'delivered':
        return '<svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
      case 'read':
        return '<svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
      case 'failed':
        return '<svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>';
      default:
        return '';
    }
  }

  private async sendMessage(): Promise<void> {
    const content = this.elements.messageInput.value.trim();
    
    if (!content && this.selectedFiles.length === 0) return;
    if (!this.currentConversation) return;

    try {
      this.elements.sendBtn.disabled = true;

      const messageData = {
        content: content || '',
        messageType: this.selectedFiles.length > 0 ? 'file' as const : 'text' as const,
        attachments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined,
      };

      // Send via API
      await messagingApi.sendMessage(this.currentConversation.id, messageData);

      // Clear input and files
      this.elements.messageInput.value = '';
      this.clearSelectedFiles();
      this.autoResizeTextarea();

      // Stop typing indicator
      socketService.stopTyping(this.currentConversation.id);

    } catch (error) {
      console.error('Failed to send message:', error);
      this.showError('Failed to send message');
    } finally {
      this.elements.sendBtn.disabled = false;
    }
  }

  private handleMessageInputChange(): void {
    const hasContent = this.elements.messageInput.value.trim().length > 0;
    const hasFiles = this.selectedFiles.length > 0;
    
    this.elements.sendBtn.disabled = !hasContent && !hasFiles;

    // Handle typing indicator
    if (this.currentConversation && hasContent) {
      socketService.startTyping(this.currentConversation.id);
      
      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Set new timeout to stop typing
      this.typingTimeout = setTimeout(() => {
        if (this.currentConversation) {
          socketService.stopTyping(this.currentConversation.id);
        }
      }, 3000);
    } else if (this.currentConversation) {
      socketService.stopTyping(this.currentConversation.id);
    }
  }

  private handleFileSelection(files: File[]): void {
    this.selectedFiles = [...this.selectedFiles, ...files];
    this.renderFilePreview();
    this.elements.messageInput.focus();
    
    // Update send button state
    this.handleMessageInputChange();
  }

  private renderFilePreview(): void {
    if (this.selectedFiles.length === 0) {
      this.elements.filePreview.classList.add('hidden');
      return;
    }

    this.elements.filePreview.classList.remove('hidden');
    this.elements.fileList.innerHTML = '';

    this.selectedFiles.forEach((file, index) => {
      const fileElement = document.createElement('div');
      fileElement.className = 'flex items-center justify-between p-2 bg-white rounded border';
      
      fileElement.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
          </svg>
          <span class="text-sm text-gray-700">${file.name}</span>
          <span class="text-xs text-gray-500">(${this.formatFileSize(file.size)})</span>
        </div>
        <button class="text-red-600 hover:text-red-800" data-file-index="${index}">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
        </button>
      `;

      // Add remove file handler
      const removeBtn = fileElement.querySelector('button');
      removeBtn?.addEventListener('click', () => {
        this.removeFile(index);
      });

      this.elements.fileList.appendChild(fileElement);
    });
  }

  private removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.renderFilePreview();
    this.handleMessageInputChange();
  }

  private clearSelectedFiles(): void {
    this.selectedFiles = [];
    this.elements.fileInput.value = '';
    this.renderFilePreview();
  }

  private autoResizeTextarea(): void {
    const textarea = this.elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  private async markMessagesAsRead(): Promise<void> {
    if (!this.currentConversation) return;

    try {
      await messagingApi.markMessagesAsRead(this.currentConversation.id);
      
      // Update local conversation unread count
      const conversation = this.conversations.find(c => c.id === this.currentConversation!.id);
      if (conversation) {
        if (this.currentUser?.role === 'client') {
          conversation.clientUnreadCount = 0;
        } else {
          conversation.trainerUnreadCount = 0;
        }
        this.renderConversations();
      }

    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }

  private filterConversations(query: string): void {
    const conversationElements = document.querySelectorAll('.conversation-item');
    
    conversationElements.forEach(element => {
      const name = element.querySelector('h4')?.textContent?.toLowerCase() || '';
      const lastMessage = element.querySelector('p')?.textContent?.toLowerCase() || '';
      
      if (name.includes(query) || lastMessage.includes(query)) {
        (element as HTMLElement).style.display = 'block';
      } else {
        (element as HTMLElement).style.display = 'none';
      }
    });
  }

  private scrollToBottom(): void {
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }

  private updateConnectionStatus(connected: boolean): void {
    if (connected) {
      this.elements.statusIndicator.className = 'w-2 h-2 bg-green-500 rounded-full';
      this.elements.statusText.textContent = 'Connected';
    } else {
      this.elements.statusIndicator.className = 'w-2 h-2 bg-red-500 rounded-full';
      this.elements.statusText.textContent = 'Disconnected';
    }
  }

  // Socket event handlers
  private handleNewMessage(message: Message): void {
    // Add to messages if it's for current conversation
    if (message.conversationId === this.currentConversation?.id) {
      this.messages.push(message);
      const messageElement = this.createMessageElement(message, this.messages.length - 1);
      this.elements.messagesContainer.appendChild(messageElement);
      this.scrollToBottom();

      // Mark as read if conversation is active
      this.markMessagesAsRead();
    }

    // Update conversation list
    this.updateConversationFromMessage(message);
  }

  private handleTypingIndicator(data: { userId: string; conversationId: string; isTyping: boolean }): void {
    if (data.conversationId === this.currentConversation?.id && data.userId !== this.currentUser?.id) {
      if (data.isTyping) {
        this.elements.typingIndicator.classList.remove('hidden');
      } else {
        this.elements.typingIndicator.classList.add('hidden');
      }
    }
  }

  private handleMessagesRead(data: { conversationId: string; messageIds: string[]; readBy: string }): void {
    if (data.conversationId === this.currentConversation?.id && data.readBy !== this.currentUser?.id) {
      // Update message status in UI
      this.messages.forEach(message => {
        if (data.messageIds.includes(message.id)) {
          message.status = 'read';
        }
      });
      this.renderMessages();
    }
  }

  private handleUserOnlineStatus(data: { userId: string; isOnline: boolean }): void {
    if (data.isOnline) {
      this.onlineUsers.add(data.userId);
    } else {
      this.onlineUsers.delete(data.userId);
    }

    // Update UI if it's the current chat partner
    if (this.currentConversation?.participant?.id === data.userId) {
      this.updateChatHeader();
    }

    // Update conversation list
    this.renderConversations();
  }

  private updateConversationFromMessage(message: Message): void {
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.lastMessagePreview = message.content;
      conversation.lastMessageAt = new Date(message.createdAt);
      
      // Update unread count
      if (message.senderId !== this.currentUser?.id) {
        if (this.currentUser?.role === 'client') {
          conversation.clientUnreadCount++;
        } else {
          conversation.trainerUnreadCount++;
        }
      }

      // Move to top of list
      this.conversations = [conversation, ...this.conversations.filter(c => c.id !== conversation.id)];
      this.renderConversations();
    }
  }

  // Utility functions
  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private showError(message: string): void {
    // Simple error display - could be enhanced with a toast system
    console.error(message);
    alert(message);
  }
}

// Initialize the messaging app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MessagingApp();
}); 