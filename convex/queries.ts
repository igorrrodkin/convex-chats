import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
    createChat,
    getChats,
    getExistingChat,
    getMessages,
    getUserById,
    insertMessage,
} from './repo';
import { paginationOptsValidator } from 'convex/server';

export const createUser = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('name'), args.name))
            .first();
        if (!existingUser) {
            const userId = await ctx.db.insert('users', { name: args.name });
            return userId;
        }
        return existingUser._id;
    },
});

export const sendMessage = mutation({
    args: {
        userId: v.id('users'),
        text: v.string(),
        requestUserId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const sender = await getUserById(ctx.db, { id: args.requestUserId });
        const receiver = await getUserById(ctx.db, { id: args.userId });
        if (!receiver) throw new Error('User not exist');
        let chatId = await getExistingChat(ctx.db, {
            userIds: [args.requestUserId, args.userId],
        });
        if (!chatId) {
            chatId = await createChat(ctx.db, {
                sender: args.requestUserId,
                receiver: args.userId,
                senderName: sender!.name,
                receiverName: receiver.name,
            });
        }
        const messageId = await insertMessage(ctx.db, {
            content: args.text,
            chatId,
            sender: args.requestUserId,
            receiver: args.userId,
            senderName: sender!.name,
        });

        return { messageId, chatId };
    },
});

export const listChats = query({
    args: {
        requestUserId: v.id('users'),
        page: v.number(),
        perPage: v.number(),
    },
    handler: async (ctx, args) => {
        const chats = await getChats(ctx.db, args);
        return { items: chats };
    },
});

export const listMessages = query({
    args: {
        chatId: v.id('chats'),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const chats = await getMessages(ctx.db, args);
        return chats;
    },
});

export const checkChatExistence = mutation({
    args: {
        requestUserId: v.id('users'),
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const user = await getUserById(ctx.db, { id: args.userId });
        if (!user) throw new Error('User not exist');
        const chatId = await getExistingChat(ctx.db, {
            userIds: [args.requestUserId, args.userId],
        });
        return { chatId: chatId };
    },
});
