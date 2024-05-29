import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    chats: defineTable({
        lastMessageId: v.union(v.id('messages'), v.null()),
        content: v.union(v.string(), v.null()),
        sender: v.union(v.id('users'), v.null()),
    }),

    users: defineTable({
        name: v.string(),
    }),

    chatToUsers: defineTable({
        userId: v.id('users'),
        chatId: v.id('chats'),
        chatName: v.string(),
    }),

    messages: defineTable({
        chatId: v.id('chats'),
        sender: v.id('users'),
        content: v.string(),
    }),

    updates: defineTable({
        chatId: v.id('chats'),
        sender: v.id('users'),
        userId: v.id('users'),
        messageId: v.id('messages'),
        content: v.string(),
    }),
});
