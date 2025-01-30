"use client"
import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";

export default function Home() {
  const router = useRouter()
  const { isInterviewer, isLoading } = useUserRole();


  const [showModel, setShowModel] = useState(false)
  const [modalType, setModalType] = useState<"start" | "join">()

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start")
        setShowModel(true)
        break;
      case "Join Interview":
        setModalType("join")
        setShowModel(true)
        break;
      default:
        router.push(`/${title.toLowerCase()}`)

    }
  }

  if (isLoading) return <LoaderUI />
  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* WELCOME SECTION */}
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-2">
          {isInterviewer
            ? "Manage your interviews and review candidates effectively"
            : "Access your upcoming interviews and preparations"}
        </p>
      </div>

      {isInterviewer ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {
              QUICK_ACTIONS.map((action) => (
                <ActionCard
                  key={action.title}
                  action={action}
                  onClick={() => handleQuickAction(action.title)}
                />
              ))
            }
          </div>
          <MeetingModal
            isOpen={showModel}
            onClose={() => setShowModel(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </>
      ) : (
        <>
          <div>
            andidate views goes here
          </div>
        </>
      )}
    </div>
  );
}
