"use client"

import { useAppContext } from "@/app/components/common/AppContext";
import { DevTool } from "@hookform/devtools";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import InputBox from "../components/InputBox";
import { FaUserAlt } from "react-icons/fa";
import { sendOTP } from "@/app/components/utils/userUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";

export default function ForgotPassword() {

    const { loading, setLoading, router, isSubmit } = useAppContext();
    const { register, control, handleSubmit, formState, watch } = useForm({
        defaultValues: {
            email: "",
        }
    });
    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    async function onSubmit(data) {
        if (isSubmit.current) return;
        isSubmit.current = true;
        setLoading(true);
        try {
            console.log(data);
            const request = watch("email");
            const response = await sendOTP(request);
            const result = response.data;
            if (response.status === 200) {
                showSuccess(result.message);
                localStorage.setItem("mode", "reset");
                router.push(`/verify/${result.data.token}`)
            }
            else {
                showError(result.error);
            }
        }
        finally {
            setLoading(false);
            isSubmit.current = false;
        }
    }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading">
                <h3 className="text-4xl font-semibold">Welcome Back</h3>
                <p className="text-sm text-slate-500">Access your account to buy books, track orders, and enjoy priority support.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Email" field="email" icon={<FaUserAlt />} loading={loading} register={register} setFocusedField={setFocusedField} errors={errors.email?.message} />
                <DevTool control={control} />
                <button type="submit" className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >Submit</button>
            </form>
            <div className="footer flex md:flex-row flex-col items-center justify-between font-semibold mt-5 lg:mt-0 gap-5 lg:gap-0">
                <Link href="/user/login" onClick={(e) => loading && e.preventDefault()}
                    className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Login</Link>
                <Link href="/user/register" onClick={(e) => loading && e.preventDefault()}
                    className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Create an Account</Link>
            </div>
        </div>
    )
}