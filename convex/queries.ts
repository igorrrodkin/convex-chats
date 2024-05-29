import { DatabaseReader, DatabaseWriter, mutation } from './_generated/server';
import { v } from 'convex/values';
import { findDuplicateChatId } from './helpers';
import { Id } from './_generated/dataModel';
import { createChat, insertMessage } from './repo';

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
    args: { userId: v.id('users'), text: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Called storeUser without authentication present');
        }
        const receiver = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), args.userId))
            .first();
        if (!receiver) throw new Error('User not exist');
        // existing chat check
        const usersChats = await ctx.db
            .query('chatToUsers')
            .filter((q) =>
                q.or(
                    q.eq(q.field('userId'), args.userId),
                    q.eq(q.field('userId'), identity.subject)
                )
            )
            .collect();
        let chatId = findDuplicateChatId(
            usersChats.map((it) => {
                return { chatId: it.chatId, userId: it.userId };
            })
        );
        if (!chatId) {
            chatId = await createChat(ctx.db, {
                sender: identity.subject as Id<'users'>,
                receiver: args.userId,
            });
        }
        const messageId = await insertMessage(ctx.db, {
            content: args.text,
            chatId,
            sender: identity.subject as Id<'users'>,
            receiver: args.userId,
        });

        return { messageId, chatId };
    },
});
