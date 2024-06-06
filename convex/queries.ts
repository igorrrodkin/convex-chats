import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
    createChat,
    getChats,
    getExistingChat,
    getMessages,
    getMessagesWithoutMessages,
    getUserById,
    getUserByName,
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
        userName: v.string(),
        text: v.string(),
        requestUserId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const sender = await getUserById(ctx.db, { id: args.requestUserId });
        const receiver = await getUserByName(ctx.db, { name: args.userName });
        if (!receiver) throw new Error('User not exist');
        let chatId = await getExistingChat(ctx.db, {
            userIds: [args.requestUserId, receiver._id],
        });
        if (!chatId) {
            chatId = await createChat(ctx.db, {
                sender: args.requestUserId,
                receiver: receiver._id,
                senderName: sender!.name,
                receiverName: receiver.name,
            });
        }
        const messageId = await insertMessage(ctx.db, {
            content: args.text,
            chatId,
            sender: args.requestUserId,
            receiver: receiver._id,
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

export const listMessagesWithoutPagination = query({
    args: {
        chatId: v.id('chats'),
        // paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const chats = await getMessagesWithoutMessages(ctx.db, args);
        return chats;
    },
});

export const checkChatExistence = mutation({
    args: {
        requestUserId: v.id('users'),
        userName: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getUserByName(ctx.db, { name: args.userName });
        if (!user) throw new Error('User not exist');
        const chatId = await getExistingChat(ctx.db, {
            userIds: [args.requestUserId, user._id],
        });
        return { chatId: chatId };
    },
});

export const testIndentity = query({
    args: {},
    handler: async (ctx) => {
        const user = await ctx.auth.getUserIdentity();
        console.log('USER identity', user);
        return { issuer: user!.issuer, subject: user!.subject };
    },
});
