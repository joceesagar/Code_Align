import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server"; // Required for handling HTTP actions in Convex
import { WebhookEvent } from "@clerk/nextjs/server"; // Used to type webhook events sent by Clerk
import { Webhook } from "svix"; // Library for securely verifying webhook signatures
import { api } from "./_generated/api"; // Accessing Convex API routes for user-related actions

// Create an HTTP router to define routes for the Convex server
const http = httpRouter();

// Define the route for the webhook
http.route({
    path: "/clerk-webhook", // The endpoint URL to which Clerk sends POST requests for webhooks
    method: "POST", // This route only listens to POST requests
    handler: httpAction(async (ctx, request) => {
        /**
         * Step 1: Validate that the webhook secret exists
         * 
         * Clerk provides a secret key (`CLERK_WEBHOOK_SECRET`) that ensures only Clerk's
         * requests are accepted. This is stored as an environment variable.
         */
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
        }

        /**
         * Step 2: Extract headers sent with the webhook
         * 
         * Svix is used by Clerk(by default) to securely deliver webhooks. Svix sends three
         * headers with the request: `svix-id`, `svix-signature`, and `svix-timestamp`.
         * These headers are required to verify that the request genuinely comes from Clerk.
         */
        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        // Check if all necessary Svix headers are present
        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("Missing svix headers", {
                status: 400, // Return a 400 status if any of the headers are missing
            });
        }

        /**
         * Step 3: Verify the webhook using Svix
         * 
         * Clerk uses Svix to ensure webhook delivery. To verify the authenticity of the
         * webhook, Svix package installed in the app computes a signature using the webhook's payload and the
         * `CLERK_WEBHOOK_SECRET`. We compare the received signature (`svix-signature`)
         * with the computed one. If they don't match, the request is invalid.
         */
        const payload = await request.json(); // Extract the JSON payload sent by Clerk
        const body = JSON.stringify(payload); // Convert it to a string for signature verification

        const wh = new Webhook(webhookSecret); // Initialize the Svix Webhook verifier
        let evt: WebhookEvent;

        try {
            // Verify the webhook by checking the computed signature matches the received one
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as WebhookEvent;
        } catch (err) {
            console.error("Error verifying webhook:", err);
            return new Response("Error occurred", { status: 400 }); // Return an error if verification fails
        }

        /**
         * Step 4: Process the webhook event
         * 
         * After verification, the webhook's payload (`evt`) contains details about
         * the event (e.g., `user.created`). You can use this information to perform
         * any actions based on the event type.
         */
        const eventType = evt.type; // Get the type of the event (e.g., "user.created")

        // If the event type is "user.created", perform actions to sync the user
        if (eventType === "user.created") {
            /**
             * Extract important user data from the webhook payload.
             * 
             * Clerk sends the following user-related data in the webhook:
             * - `id`: The unique ID of the user in Clerk
             * - `email_addresses`: An array of the user's email addresses
             * - `first_name`: The user's first name
             * - `last_name`: The user's last name
             * - `image_url`: The user's profile image URL
             */
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;
            const email = email_addresses[0].email_address; // Use the first email address
            const name = `${first_name || ""}${last_name || ""}`.trim(); // Combine first and last name

            /**
             * Use Convex mutation to save the user's data in your database.
             * 
             * The `syncUser` mutation (defined in your `users.ts` file) will handle the logic
             * for saving the user in your database (e.g., creating a record with their Clerk ID).
             */
            try {
                await ctx.runMutation(api.users.syncUser, {
                    clerkId: id, // Clerk ID of the user
                    email, // Email address of the user
                    name, // Full name of the user
                    image: image_url, // Profile image URL of the user
                    role: "interviewer" //making the default role interviewer
                });
            } catch (error) {
                console.log("Error creating user:", error);
                return new Response("Error creating user", { status: 500 }); // Handle any database errors
            }
        }

        // Return a success response after processing the webhook
        return new Response("Webhook processed successfully", { status: 200 });
    }),
});

export default http; // Export the HTTP router
