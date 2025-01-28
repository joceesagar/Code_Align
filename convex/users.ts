import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const syncUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        clerkId: v.string(),
        image: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").filter(q => q.eq(q.field("clerkId"), args.clerkId)) //check if the user already exist
        if (existingUser) return

        return await ctx.db.insert("users", {
            ...args, //...ars means all the properties of args like name, email etc
            role: "candidate"
        })
    }
})