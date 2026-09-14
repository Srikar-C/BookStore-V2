"use client"

import { useAppContext } from "@/app/hooks/AppContext";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import InputBox from "../components/InputBox";
import { FaUserAlt } from "react-icons/fa";
import { sendOTP } from "@/app/components/utils/userUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useMutation } from "@tanstack/react-query";
import { getColor } from "@/app/components/utils/FunctionalUtils";

export default function ForgotPassword() {

    const { router } = useAppContext();
    const { register, handleSubmit, formState, watch } = useForm({
        defaultValues: {
            email: "",
        }
    });
    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const emailColor = getColor("email", focusedField, errors);

    const { mutate, isPending } = useMutation({
        mutationFn: sendOTP,
        onSuccess: (response) => {
            const result = response.data;
            showSuccess(result.message);
            localStorage.setItem("mode", "reset");
            router.push(`/verify/${result.data.token}`)
        },
        onError: (error) => {
            const errorResult = error.data;
            console.log("Sending OTP: ", error);
            if (error.status === 429) {
                showError(errorResult.error);
            }
            else {
                showError(error);
            }
        }
    })

    function onSubmit(data) {
        if (isPending) return;
        console.log(data);
        const request = watch("email");
        mutate(request);
    }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading flex flex-col gap-2">
                <h3 className="text-4xl font-semibold">Forgot Password</h3>
                <p className="text-sm text-slate-500">Please Verify your Email before reset</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Email" field="email" icon={<FaUserAlt />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.email?.message} color={emailColor} />
                <button type="submit" className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >{isPending ? "Submiting..." : "Submit"}</button>
            </form>
            <div className="footer flex md:flex-row flex-col items-center justify-between font-semibold mt-5 lg:mt-0 gap-5 lg:gap-0">
                <Link href="/user/login" onClick={(e) => isPending && e.preventDefault()}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Login</Link>
                <Link href="/user/register" onClick={(e) => isPending && e.preventDefault()}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Create an Account</Link>
            </div>
        </div>
    )
}