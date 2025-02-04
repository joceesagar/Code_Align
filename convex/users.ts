import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


//mutation in convex is used for creating or updating user
export const syncUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        clerkId: v.string(),
        image: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), args.clerkId)).first() //check if the user already exist
        if (existingUser) return;


        return await ctx.db.insert("users", {
            ...args, //...ars means all the properties of args like name, email etc
            role: "interviewer" // by default role is interviewer
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

//for updating user role
export const updateUserRole = mutation({
    args: {
        clerkId: v.string(), // Ensure clerkId is a valid string
        role: v.union(v.literal("interviewer"), v.literal("candidate")), // Allow only "interviewer" or "candidate" as valid roles
    },
    handler: async (ctx, args) => {
        // Query the database for the user based on clerkId
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first(); // Retrieve the first matching user

        if (!existingUser) {
            // If user doesn't exist, throw an error
            throw new Error("User not found");
        }

        // Proceed to patch (update) the user's role
        try {
            // Update the role in the database
            return await ctx.db.patch(existingUser._id, { role: args.role });
        } catch (error) {
            // Handle any errors during the patch operation
            console.error("Error updating role:", error);
            throw new Error("Failed to update role");
        }
    },
});

