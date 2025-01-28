import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}

export default ConvexClerkProvider;


// Why Both Are Necessary?
// ---------------------------------------------
// Frontend Integration (ConvexClerkProvider):
// Provides seamless authentication for frontend interactions.
// Allows authenticated users to query or mutate Convex data directly from the client.

// Webhooks for Backend Updates:
// Handles asynchronous events (like user updates or account deletions).
// Ensures Convex's database remains in sync with Clerk's user data, even if the frontend app isn't active.
// For example when the user is first time created or updated in clerk, it should tigger the convex backend and it will update it in database

