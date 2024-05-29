import { Id } from './_generated/dataModel';
import { DatabaseWriter } from './_generated/server';

export const insertMessage = async (
    db: DatabaseWriter,
    params: {
        content: string;
        chatId: Id<'chats'>;
        sender: Id<'users'>;
        receiver: Id<'users'>;
    }
) => {
    const { content, chatId, sender, receiver } = params;
    const messageId = await db.insert('messages', {
        content: content,
        chatId: chatId,
        sender: sender,
    });

    await db.patch(chatId, { lastMessageId: messageId, sender, content });
    await Promise.all([
        await db.insert('updates', {
            content,
            sender,
            userId: sender,
            chatId,
            messageId,
        }),
        await db.insert('updates', {
            content,
            sender,
            userId: receiver,
            chatId,
            messageId,
        }),
    ]);
    return messageId;
};

export const createChat = async (
    db: DatabaseWriter,
    params: { sender: Id<'users'>; receiver: Id<'users'> }
) => {
    const { sender, receiver } = params;
    const chatId = await db.insert('chats', {
        lastMessageId: null,
        content: null,
        sender: null,
    });
    await Promise.all([
        await db.insert('chatToUsers', {
            chatId: chatId,
            userId: sender,
            chatName: receiver,
        }),
        await db.insert('chatToUsers', {
            chatId: chatId,
            userId: receiver,
            chatName: sender,
        }),
    ]);

    return chatId;
};
