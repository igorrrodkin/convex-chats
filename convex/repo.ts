import { PaginationOptions } from 'convex/server';
import { Id } from './_generated/dataModel';
import { DatabaseReader, DatabaseWriter } from './_generated/server';
import { findDuplicateChatId } from './helpers';

export const insertMessage = async (
    db: DatabaseWriter,
    params: {
        content: string;
        chatId: Id<'chats'>;
        sender: Id<'users'>;
        receiver: Id<'users'>;
        senderName: string;
    }
) => {
    const { content, chatId, sender, senderName } = params;
    const messageId = await db.insert('messages', {
        content: content,
        chatId: chatId,
        sender: sender,
    });

    const time = Number(new Date());

    await db.patch(chatId, {
        lastMessageTime: time,
        sender: senderName,
        content,
    });
    return messageId;
};

export const createChat = async (
    db: DatabaseWriter,
    params: {
        sender: Id<'users'>;
        receiver: Id<'users'>;
        senderName: string;
        receiverName: string;
    }
) => {
    const { sender, receiver, receiverName, senderName } = params;
    const chatId = await db.insert('chats', {
        lastMessageTime: null,
        content: null,
        sender: null,
    });
    await Promise.all([
        await db.insert('chatToUsers', {
            chatId: chatId,
            userId: sender,
            chatName: receiverName,
        }),
        await db.insert('chatToUsers', {
            chatId: chatId,
            userId: receiver,
            chatName: senderName,
        }),
    ]);

    return chatId;
};

export const getUserByIdentifier = async (
    db: DatabaseReader,
    params: { tokenIdentifier: string }
) => {
    const user = await db
        .query('users')
        .filter((q) => q.eq(q.field('tokenIdentifier'), params.tokenIdentifier))
        .first();
    return user;
};

export const getUserByName = async (
    db: DatabaseReader,
    params: { name: string }
) => {
    const user = await db
        .query('users')
        .filter((q) => q.eq(q.field('username'), params.name))
        .first();
    return user;
};

export const getExistingChat = async (
    db: DatabaseReader,
    params: { userIds: Id<'users'>[] }
) => {
    const usersChats = await db
        .query('chatToUsers')
        .filter((q) =>
            q.or(
                q.eq(q.field('userId'), params.userIds[0]),
                q.eq(q.field('userId'), params.userIds[1])
            )
        )
        .collect();
    const chatId = findDuplicateChatId(
        usersChats.map((it) => {
            return { chatId: it.chatId, userId: it.userId };
        })
    );
    return chatId;
};

export const getChats = async (
    db: DatabaseReader,
    params: { requestUserId: Id<'users'>; page: number; perPage: number }
) => {
    const userChatIdsWithNames = (
        await db
            .query('chatToUsers')
            .filter((q) => q.eq(q.field('userId'), params.requestUserId))
            .collect()
    ).map((it) => {
        return { chatId: it.chatId, chatName: it.chatName };
    });
    const chats = await Promise.all(
        userChatIdsWithNames.map(async (ids) => {
            const chat = await db
                .query('chats')
                .filter((q) => q.eq(q.field('_id'), ids.chatId))
                .first();
            return { ...chat!, name: ids.chatName }!;
        })
    );
    const sorted = chats.sort(
        (a, b) => b.lastMessageTime! - a.lastMessageTime!
    );
    const paginated = sorted.slice(
        (params.page - 1) * params.perPage,
        params.page * params.perPage
    );
    return paginated;
};

export const getMessages = async (
    db: DatabaseReader,
    params: { chatId: Id<'chats'>; paginationOpts: PaginationOptions }
) => {
    const messages = await db
        .query('messages')
        .filter((q) => q.eq(q.field('chatId'), params.chatId))
        .order('desc')
        .paginate(params.paginationOpts);
    return messages;
};
