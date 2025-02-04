import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export const useUpdateUserRole = () => {
    const { user } = useUser();
    const updateRoleMutation = useMutation(api.users.updateUserRole); // New mutation

    const updateRole = async (role: "interviewer" | "candidate") => {
        if (!user) {
            console.error("No user found!");
            return;
        }

        try {
            await updateRoleMutation({ //Convex automatically refetches data if the mutation updates the database and  UI will also be updated
                clerkId: user.id,
                role,
            });
        } catch (error) {
            console.error("Failed to update role:", error);
        }
    };

    return { updateRole };
};
