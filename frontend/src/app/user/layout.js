"use client"

import { UserContent } from "./components/UserContext"

export default function UserLayout({ children }) {

    return (
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] w-[90%] lg:w-[80%] my-10 lg:my-auto mx-auto shadow-md shadow-(color:--foreground) rounded-4xl">
            <UserContent />
            {children}
        </div>
    )
}