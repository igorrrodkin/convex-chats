import { create } from 'zustand';
import { Chat, Chats } from '../types';

interface ChatsState {
	chats: Chats | null;
	activeChat: Chat | null;
	updateChats: (chats: Chats) => void;
	updateActiveChat: (chat: Chat) => void;
}

export const useChatsStore = create<ChatsState>()((set) => ({
	chats: null,
	updateChats: (newChats) => set(() => ({ chats: newChats })),
	activeChat: null,
	updateActiveChat: (newChat) => set(() => ({ activeChat: newChat })),
}));
