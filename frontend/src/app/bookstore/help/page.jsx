import { BookOpenText, ChevronRight, CircleHelp, CreditCard, Headphones, PackageCheck, Search, ShieldCheck, Truck, WalletCards } from "lucide-react";
import Link from "next/link";

export default function Help() {

    const quickLinks = [
        {
            icon: Search,
            title: "Find the right book",
            text: "Use search, category filters, and trending shelves to discover titles you’ll actually enjoy.",
        },
        {
            icon: WalletCards,
            title: "Manage cart & checkout",
            text: "Review your cart, adjust quantities, and complete purchases with a clean checkout flow.",
        },
        {
            icon: PackageCheck,
            title: "Track your orders",
            text: "View order status, delivery updates, and your recent purchasing history anytime.",
        },
        {
            icon: ShieldCheck,
            title: "Stay secure",
            text: "Your sessions, account details, and personal access are protected with the app’s built-in safeguards.",
        },
    ];


    const faqs = [
        {
            question: "How do I browse books by category?",
            answer:
                "Open the bookstore dashboard and use the category chips at the top to filter books instantly. You can also search by title or keyword.",
        },
        {
            question: "Can I update my cart after adding items?",
            answer:
                "Yes. Visit the cart section, adjust quantities, remove items, or continue to checkout when you’re ready.",
        },
        {
            question: "How do I know my order status?",
            answer:
                "Go to the Orders section from the sidebar. You’ll see delivery progress, expected delivery dates, and recent order details.",
        },
        {
            question: "What if I forget my password?",
            answer:
                "Use the Forgot Password link on the login page and follow the reset flow to regain access to your account.",
        },
    ];

    const supportCards = [
        {
            icon: Headphones,
            title: "Customer support",
            text: "Need help with an order or account issue? Our support team is ready to assist.",
            badge: "Mon–Sat • 9AM–8PM",
        },
        {
            icon: CreditCard,
            title: "Payments & billing",
            text: "Questions about payment confirmation, order summary, or billing details? We’ve got you covered.",
            badge: "Secure checkout",
        },
        {
            icon: Truck,
            title: "Shipping & delivery",
            text: "Learn about delivery timelines, order updates, and what to do if an item is delayed.",
            badge: "Fast delivery",
        },
    ];

    return (
        <div className="overflow-y-auto w-full h-full bg-(--background) rounded-xl p-3">
            <header className="mb-8 rounded-4xl border border-(--foreground)/10 bg-white/5 p-6 shadow-lg shadow-(color:--shadow)/10 backdrop-blur-sm dark:bg-slate-950/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--input-icon)">Support</p>
                        <h1 className="text-3xl font-bold md:text-4xl">How can we help you today?</h1>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-(--foreground)/10 bg-(--background)/70 px-4 py-2 text-sm font-medium text-(--foreground)/80">
                        <CircleHelp className="h-4 w-4 text-(--input-icon)" />
                        BookStore help center
                    </div>
                </div>
            </header>
            <section className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {quickLinks.map(({ icon: Icon, title, text }) => (
                    <div
                        key={title}
                        className="rounded-[1.75rem] border border-(--foreground)/10 bg-white/5 p-5 shadow-lg shadow-(color:--shadow)/10 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-950/30"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--input-icon)/10 text-(--input-icon)">
                            <Icon className="h-6 w-6" />
                        </div>
                        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
                        <p className="text-sm leading-6 text-(--foreground)/75">{text}</p>
                    </div>
                ))}
            </section>
            <section className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-4xl border border-(--foreground)/10 bg-white/5 p-6 shadow-lg shadow-(color:--shadow)/10 backdrop-blur-sm dark:bg-slate-950/30">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--input-icon)/10 text-(--input-icon)">
                            <BookOpenText className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-semibold">Popular questions</h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map(({ question, answer }) => (
                            <details
                                key={question}
                                className="group rounded-2xl border border-(--foreground)/10 bg-(--background)/70 p-4"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-(--foreground)">
                                    {question}
                                    <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
                                </summary>
                                <p className="mt-3 pr-6 text-sm leading-6 text-(--foreground)/70">{answer}</p>
                            </details>
                        ))}
                    </div>
                </div>

                <div className="rounded-4xl border border-(--foreground)/10 bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-violet-500/10 p-6 shadow-lg shadow-(color:--shadow)/10">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--input-icon)">Need urgent help?</p>
                    <h2 className="text-2xl font-semibold">Talk to the support team</h2>
                    <p className="mt-3 text-(--foreground)/75">
                        Reach out if you’re facing an issue with your account, cart, order, or delivery.
                    </p>

                    <div className="mt-6 space-y-4">
                        {supportCards.map(({ icon: Icon, title, text, badge }) => (
                            <div
                                key={title}
                                className="rounded-2xl border border-(--foreground)/10 bg-(--background)/70 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-(--input-icon)/10 text-(--input-icon)">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="font-semibold">{title}</h3>
                                            <span className="rounded-full bg-(--input-icon)/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-(--input-icon)">
                                                {badge}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-(--foreground)/70">{text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-4xl border border-(--foreground)/10 bg-white/5 p-6 shadow-lg shadow-(color:--shadow)/10 backdrop-blur-sm dark:bg-slate-950/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--input-icon)">Still need help?</p>
                        <h2 className="text-2xl font-semibold">Contact support directly</h2>
                    </div>
                    <Link
                        href="/bookstore/suggestions"
                        className="inline-flex items-center justify-center rounded-full bg-(--foreground) px-5 py-3 text-sm font-semibold text-(--background) transition hover:opacity-90"
                    >
                        Share a suggestion
                    </Link>
                </div>
            </section>
        </div>
    )
}