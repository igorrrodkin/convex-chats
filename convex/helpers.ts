import { Id } from './_generated/dataModel';

export const findDuplicateChatId = (
	arr: { chatId: Id<'chats'>; userId: Id<'users'> }[]
): Id<'chats'> | null => {
	const chatIds: Record<Id<'chats'>, boolean> = {};
	for (const item of arr) {
		if (chatIds[item.chatId]) {
			return item.chatId;
		} else {
			chatIds[item.chatId] = true;
		}
	}
	return null;
};
