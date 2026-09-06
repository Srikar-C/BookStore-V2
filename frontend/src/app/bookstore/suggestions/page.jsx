"use client"
import { getSuggestions, addsuggestion } from "@/app/components/utils/commonUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useUserStore } from "@/app/hooks/useStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Suggestions() {

    const { user } = useUserStore();
    const [suggestions, setSuggestions] = useState([]);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            suggestion: ""
        }
    })

    const { data, isPending } = useQuery({
        queryKey: ["allSuggestions"],
        queryFn: getSuggestions,
        select: (response) => response?.data,
    })

    useEffect(() => {
        if (isPending) return;
        if (data?.success && data?.data) {
            console.log("suggestion all: ", data?.data);
            setSuggestions(data?.data);
        }
    }, [isPending])

    const { mutate: addSuggestion, isPending: addPending } = useMutation({
        mutationFn: addsuggestion,
        onSuccess: (response) => {
            console.log(response);
            const result = response.data;
            if (response.status === 201) {
                showSuccess(result.message);
                reset();
            }
        },
        onError: (error) => {
            console.log(error);
            showError(error.data.error);
        }
    })

    function onSubmit(data) {
        console.log(data);
        addSuggestion(data);
    }

    if (user?.role === "USER") {
        return (
            <div className="p-4 relative overflow-y-auto w-full h-full bg-(--background) rounded-xl">
                <span className="text-center text-slate-500 flex items-center justify-center">Suggestions are unanimous</span>
                <form onSubmit={handleSubmit(onSubmit)} className="box flex flex-col p-4 rounded-xl items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-(color:--shadow) w-[60%] gap-4">
                    <h4 className="text-3xl font-semibold font-serif">Suggestions</h4>
                    <textarea {...register("suggestion")} placeholder="Enter your thoughts" className="p-3 w-full h-75 border-2 border-(--shadow) outline-none" />
                    <button disabled={addPending} type="submit"
                        className={` ${addPending ? "cursor-pointer" : "cursor-not-allowed"} flex w-full items-center justify-center cursor-pointer gap-2 rounded-2xl bg-(--input-icon) px-4 py-2 text-md font-semibold text-white transition hover:opacity-90`}>Submit</button>
                </form>
            </div>
        )
    }

    return (
        <div className="grid gap-10 grid-cols-4 items-start grid-rows-[auto_1fr] p-10 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
            {suggestions?.map((item, index) => {
                return (
                    <dl key={index} className="flex flex-col bg-(--foreground) text-(--background) w-62.5 min-h-25 max-h-50 p-2 shadow-md shadow-(color:--foreground) rounded-xl">
                        <dt>{item.suggestion}</dt>
                        <dd className="mt-auto ml-auto text-(--section-hover)">-{item.username}</dd>
                    </dl>
                )
            })}
        </div>
    )


}