import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
        role: v.union(v.literal('candidate'), v.literal('interviewer')),
        clerkId: v.string()
    }).index("by_clerk_id", ["clerkId"])             //to retrive users by_clerk_id(passing clerkId)
})