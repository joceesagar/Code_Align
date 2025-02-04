import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


//mutation in convex is used for creating or updating user
export const syncUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        clerkId: v.string(),
        image: v.optional(v.string()),
        role: v.literal("interviewer")
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), args.clerkId)).first() //check if the user already exist
        if (existingUser) return;


        return await ctx.db.insert("users", {
            ...args, //...ars means all the properties of args like name, email etc
        })
    }
})

//query in convex is used for fetching data
export const getUsers = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();  //getting authenticated user identity
        if (!identity) throw new Error("User is not authenticated")

        const users = await ctx.db.query("users").collect()
        return users
    }
})

export const getUserByClerkId = query({
    args: { clerkId: v.string(), },
    handler: async (ctx, args) => {
        const user = await ctx.db.
            query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)) //it will loop through every user and return if the clerkid in db matches with the clerk id provided in arguments
            .first()

        return user
    }
})