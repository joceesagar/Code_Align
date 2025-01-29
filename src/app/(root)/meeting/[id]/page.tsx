"use client"

import LoaderUI from "@/components/LoaderUI"
import MeetingRoom from "@/components/MeetingRoom"
import MeetingSetup from "@/components/MeetingSetup"
import useGetCallById from "@/hooks/useGetCallById"
import { useUser } from "@clerk/nextjs"
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk"
import { useParams } from "next/navigation"
import { useState } from "react"



function MeetingPage() {
    const { id } = useParams() //[id] this id of folder is given by useParams
    const { isLoaded } = useUser()
    const { call, isCallLoading } = useGetCallById(id)
    const [isSetupComplete, setIsSetupComplete] = useState(false)

    if (!isLoaded || isCallLoading) return <LoaderUI />

    if (!call) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-2xl font-semibold">Meeting not found</p>
            </div>
        );
    }
    return (
        //here we have already passed call so we can access this current call anywhere in components inside stream call only using useCall from stream. if it was not used we have to get current call by using useGetCallById hook
        <StreamCall call={call}>
            <StreamTheme>
                {!isSetupComplete ? (
                    <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
                ) : (
                    <MeetingRoom />
                )}
            </StreamTheme>

        </StreamCall>
    )
}

export default MeetingPage