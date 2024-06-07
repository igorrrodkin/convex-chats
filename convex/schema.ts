import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
export default defineSchema({
    chats: defineTable({
        lastMessageTime: v.union(v.number(), v.null()),
        content: v.union(v.string(), v.null()),
        sender: v.union(v.string(), v.null()),
    }),

    users: defineTable({
        username: v.string(),
        tokenIdentifier: v.string(),
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
});
