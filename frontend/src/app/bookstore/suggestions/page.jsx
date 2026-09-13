"use client"
import { getSuggestions, addsuggestion } from "@/app/components/utils/commonUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useUserStore } from "@/app/hooks/useStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Send, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Suggestions() {

    const { user } = useUserStore();
    const [suggestions, setSuggestions] = useState([]);
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            suggestion: ""
        }
    });

    const { data, isPending } = useQuery({
        queryKey: ["allSuggestions"],
        queryFn: getSuggestions,
        select: (response) => response?.data,
    });

    useEffect(() => {
        if (isPending) return;
        if (data?.success) {
            setSuggestions(data?.data ?? []);
        }
    }, [data, isPending]);

    const { mutate: addSuggestion, isPending: addPending } = useMutation({
        mutationFn: addsuggestion,
        onSuccess: async (response) => {
            const result = response.data;
            if (response.status === 201) {
                showSuccess(result.message);
                reset();
                await queryClient.invalidateQueries({ queryKey: ["allSuggestions"] });
            }
        },
        onError: (error) => {
            console.log(error);
            showError(error?.data?.error || "Unable to submit suggestion");
        }
    });

    function onSubmit(data) {
        addSuggestion(data);
    }

    const features = [
        {
            icon: <Sparkles className="h-4 w-4" />,
            heading: "Better features",
            description: "Suggest new categories, improvements, and customer-focused updates.",
        },
        {
            icon: <UserRound className="h-4 w-4" />,
            heading: "Reader-centered",
            description: "Let us know what makes the platform easier, faster, and more enjoyable to use.",
        }
    ]

    if (user?.role === "USER") {
        return (
            <div className="h-full w-full overflow-y-auto rounded-xl bg-(--background) p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--input-icon)">Feedback</p>
                            <h1 className="text-3xl font-bold md:text-4xl">Share your suggestion</h1>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-center">
                        <div className="rounded-4xl border border-(--foreground)/10 bg-white/5 p-6 shadow-lg shadow-(color:--shadow)/10 backdrop-blur-sm dark:bg-slate-950/30">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--input-icon)/10 text-(--input-icon)">
                                <MessageSquareText className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-semibold">We value your voice</h2>
                            <p className="mt-3 text-(--foreground)/70">
                                Help us improve the bookstore experience by sharing ideas, feedback, or feature requests.
                            </p>

                            <div className="mt-6 space-y-4">
                                {features.map((item, index) => (
                                    <div className="flex items-start gap-3 rounded-2xl border border-(--foreground)/10 bg-(--background)/70 p-3">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-(--input-icon)/10 text-(--input-icon)">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.heading}</p>
                                            <p className="text-sm text-(--foreground)/70">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="rounded-4xl border border-(--foreground)/10 bg-white/5 p-6 shadow-lg h-fit shadow-(color:--shadow)/10 backdrop-blur-sm dark:bg-slate-950/30">
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-(--foreground)/80">Your suggestion</label>
                                <textarea
                                    {...register("suggestion", { required: "Suggestion is required" })}
                                    placeholder="Tell us what you would like to improve..."
                                    className="h-52 w-full rounded-2xl border border-(--foreground)/15 bg-(--background) p-4 text-sm text-(--foreground) outline-none transition focus:border-(--input-icon) focus:ring-2 focus:ring-(--input-icon)/20"
                                />
                            </div>

                            <button
                                disabled={addPending}
                                type="submit"
                                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 ${addPending ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                            >
                                <Send className="h-4 w-4" />
                                {addPending ? "Submitting..." : "Submit suggestion"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto rounded-xl bg-(--background) p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">Suggestions board</h1>
                    </div>
                    <div className="rounded-full border border-(--foreground)/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-(--foreground)/80 backdrop-blur-sm">
                        {suggestions.length} suggestions
                    </div>
                </div>

                {suggestions.length === 0 ? (
                    <div className="rounded-4xl border border-dashed border-(--foreground)/20 bg-white/5 p-10 text-center text-(--foreground)/70">
                        No suggestions yet. Be the first one to share feedback.
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {suggestions.map((item, index) => (
                            <div
                                key={index}
                                className="flex min-h-52 flex-col rounded-[1.75rem] border border-(--foreground)/10 bg-white/5 p-5 shadow-lg shadow-(color:--shadow)/10 backdrop-blur-sm dark:bg-slate-950/30"
                            >
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-(--input-icon)/10 text-(--input-icon)">
                                    <MessageSquareText className="h-5 w-5" />
                                </div>
                                <p className="flex-1 text-base leading-7 text-(--foreground)/85">{item.suggestion}</p>
                                <div className="mt-4 flex items-center justify-between border-t border-(--foreground)/10 pt-3">
                                    <span className="text-sm font-medium text-(--foreground)/65">From</span>
                                    <span className="text-sm font-semibold text-(--foreground)">{item.username}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}