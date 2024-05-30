import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
    createChat,
    getChats,
    getExistingChat,
    getUserById,
    insertMessage,
} from './repo';

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
        const receiver = await getUserById(ctx.db, { id: args.userId });
        if (!receiver) throw new Error('User not exist');
        let chatId = await getExistingChat(ctx.db, {
            userIds: [args.requestUserId, args.userId],
        });
        if (!chatId) {
            chatId = await createChat(ctx.db, {
                sender: args.requestUserId,
                receiver: args.userId,
            });
        }
        const messageId = await insertMessage(ctx.db, {
            content: args.text,
            chatId,
            sender: args.requestUserId,
            receiver: args.userId,
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
