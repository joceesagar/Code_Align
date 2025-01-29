"use client"; // Ensures this runs on the client side since it uses hooks

import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs"; // Hook to get the currently logged-in user
import LoaderUI from "../LoaderUI"; // UI component to show a loading state
import { streamTokenProvider } from "@/actions/stream.actions"; // Token provider function for authentication

// Component to provide Stream Video context to child components
const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    // State to store the Stream Video client instance
    const [streamVideoClient, setStreamVideoClient] = useState<StreamVideoClient>();

    // Retrieve the authenticated user from Clerk
    const { user, isLoaded } = useUser();

    // Effect runs when `user` or `isLoaded` changes
    // Loader indicates whether Clerk has finished loading the authentication state.
    useEffect(() => {
        if (!isLoaded || !user) return; // Wait until user is fully loaded

        // Create a new Stream Video client instance
        const client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!, // Fetch API key from environment variables
            user: {
                id: user?.id, // Use Clerk user ID as Stream user ID
                name: user?.firstName || "" + " " + user?.lastName || "" || user?.id, // Construct user's display name
                image: user?.imageUrl, // User's profile image from Clerk
            },
            tokenProvider: streamTokenProvider, // Function to get the authentication token
        });

        // Store the Stream Video client in state
        setStreamVideoClient(client);
    }, [user, isLoaded]); // Dependencies: Run effect when user data is available

    // Show a loading UI while the Stream Video client is being initialized
    if (!streamVideoClient) return <LoaderUI />;

    // Provide the Stream Video client to child components
    return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;


//StreamVideoProvider is a global provider that initializes the video streaming service using Stream Video SDK and Clerk authentication. It ensures that the client is ready before rendering any video-related components. 