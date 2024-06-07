import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
    createChat,
    getChats,
    getExistingChat,
    getMessages,
    getUserByIdentifier,
    getUserByName,
    insertMessage,
} from './repo';
import { paginationOptsValidator } from 'convex/server';

export const createUser = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user || !user?.nickname) {
            throw new Error('User is not authorized');
        }
        const existingUser = await ctx.db
            .query('users')
            .filter((q) =>
                q.eq(q.field('tokenIdentifier'), user.tokenIdentifier)
            )
            .first();
        if (!existingUser) {
            const userId = await ctx.db.insert('users', {
                username: user.nickname,
                tokenIdentifier: user.tokenIdentifier,
            });
            return userId;
        }
        return { id: existingUser._id, nickname: user.nickname };
    },
});

export const sendMessage = mutation({
    args: {
        userName: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error('User is not authorized');
        }
        const sender = await getUserByIdentifier(ctx.db, {
            tokenIdentifier: user.tokenIdentifier,
        });
        if (!sender) throw new Error('Sender is not defined');
        const receiver = await getUserByName(ctx.db, { name: args.userName });
        if (!receiver) throw new Error('User not exist');
        let chatId = await getExistingChat(ctx.db, {
            userIds: [sender._id, receiver._id],
        });
        if (!chatId) {
            chatId = await createChat(ctx.db, {
                sender: sender._id,
                receiver: receiver._id,
                senderName: sender.username,
                receiverName: receiver.username,
            });
        }
        const messageId = await insertMessage(ctx.db, {
            content: args.text,
            chatId,
            sender: sender._id,
            receiver: receiver._id,
            senderName: sender.username,
        });

        return { messageId, chatId };
    },
});

export const listChats = query({
    args: {
        page: v.number(),
        perPage: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error('User is not authorized');
        }
        const sender = await getUserByIdentifier(ctx.db, {
            tokenIdentifier: user.tokenIdentifier,
        });
        if (!sender) throw new Error('Sender is not defined');

        const chats = await getChats(ctx.db, {
            ...args,
            requestUserId: sender._id,
        });
        return { items: chats };
    },
});

export const listMessages = query({
    args: {
        chatId: v.id('chats'),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error('User is not authorized');
        }
        const sender = await getUserByIdentifier(ctx.db, {
            tokenIdentifier: user.tokenIdentifier,
        });
        if (!sender) throw new Error('Sender is not defined');

        const chats = await getMessages(ctx.db, args);
        return chats;
    },
});

export const checkChatExistence = mutation({
    args: {
        userName: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            throw new Error('User is not authorized');
        }
        const sender = await getUserByIdentifier(ctx.db, {
            tokenIdentifier: user.tokenIdentifier,
        });
        if (!sender) throw new Error('Sender is not defined');

        const userToSend = await getUserByName(ctx.db, { name: args.userName });
        if (!userToSend) throw new Error('User not exist');
        const chatId = await getExistingChat(ctx.db, {
            userIds: [sender._id, userToSend._id],
        });
        return { chatId: chatId };
    },
});
