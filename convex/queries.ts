import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createUser = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        let existingUser = await ctx.db
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
