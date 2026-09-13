
"use client"
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FaUserAlt } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import { useAppContext } from "@/app/hooks/AppContext";
import { useEffect, useState } from "react";
import InputBox from "../components/InputBox";
import { getColor } from "@/app/components/utils/FunctionalUtils";
import { getCurrentUser, login } from "@/app/components/utils/userUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useMutation, useQuery } from "@tanstack/react-query";
export default function Login() {

    const { router } = useAppContext();
    const { register, handleSubmit, formState } = useForm({
        defaultValues: {
            name: "",
            password: "",
        }
    });
    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const nameColor = getColor("name", focusedField, errors);
    const passwordColor = getColor("password", focusedField, errors);

    const { data, isPending: existing, isSuccess, isError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        select: (response) => response?.data
    });

    useEffect(() => {
        if (existing) return;
        if (!existing && isSuccess && data?.success && data?.data) {
            router.replace("/bookstore");
            return;
        }
        router.replace("/user/login");
    }, [existing, isError, isSuccess, router])

    const { mutate: logining, isPending } = useMutation({
        mutationFn: login,
        onSuccess: (response) => {
            console.log(response);
            showSuccess(response.data.message);
            router.replace("/bookstore");
        },
        onError: (error) => {
            console.log(error);
            showError(error.data.error);
        }
    })

    async function onSubmit(data) {
        if (isPending) return;
        logining(data);
    }

    // if (existing) {
    //     return <UserSkeleton times={2} />
    // }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading flex flex-col gap-2">
                <h3 className="text-4xl font-semibold">Welcome Back</h3>
                <p className="text-sm text-slate-500">Access your account to buy books, track orders, and enjoy priority support.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Username/Email" field="name" icon={<FaUserAlt />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.name?.message} color={nameColor} type="text" />
                <InputBox label="Password" field="password" icon={<MdOutlinePassword />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.password?.message} color={passwordColor} type="password" />
                <button type="submit"
                    disabled={isPending}
                    title={!isPending ? "Please Fill All Details" : "Login"}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >{!isPending ? "Login" : "Logining..."}</button>
            </form>
            <div className="footer flex md:flex-row flex-col items-center justify-between font-semibold mt-5 lg:mt-0 gap-5 lg:gap-0">
                <Link href="/user/forgotPassword" onClick={(e) => isPending && e.preventDefault()}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Forgot Password?</Link>
                <Link href="/user/register" onClick={(e) => isPending && e.preventDefault()}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Create an Account</Link>
            </div>
        </div>
    )
}