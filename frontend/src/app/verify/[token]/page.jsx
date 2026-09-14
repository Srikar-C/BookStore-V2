"use client"
import { useAppContext } from "@/app/hooks/AppContext";
import { showError, showInfo, showSuccess, showWarning } from "@/app/components/utils/showToasts";
import { getUserFromToken, sendOTP, verifyOTP } from "@/app/components/utils/userUtils";
import InputBox from "@/app/user/components/InputBox";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { MdEmail } from "react-icons/md";
import OTPInput from "react-otp-input";

export default function Verify() {

    const { token } = useParams();
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            email: "",
            otp: ""
        }
    });
    const { router } = useAppContext();

    const { data, isPending: tokenLoading, isSuccess, isError } = useQuery({
        queryKey: ['token', token],
        queryFn: () => getUserFromToken(token),
        select: (response) => response?.data,
    });

    useEffect(() => {
        if (!tokenLoading) return;
        const mode = localStorage.getItem("mode");
        if (mode == null) {
            router.replace("/user/login");
            setTimeout(() => {
                showInfo("You Cannot access Verification Page Directly");
            }, 500);
        }
    }, [router])

    useEffect(() => {
        if (isSuccess && data?.success && data?.data?.email) {
            setValue("email", data.data.email)
        }
        if (isError) {
            showError("Unable to fetch user");
        }
    }, [isSuccess, data, setValue, isError]);

    const { mutate: verification, isPending: verifyLoading } = useMutation({
        mutationFn: verifyOTP,
        onSuccess: (response) => {
            const result = response.data;
            console.log(response);
            if (response.status === 200) {
                showSuccess(result.message);
                const mode = localStorage.getItem("mode");
                if (mode == "register") {
                    router.replace("/user/login");
                }
                else if (mode == "reset") {
                    router.replace("/user/resetPassword");
                }
                localStorage.removeItem("mode");
                return;
            }
        },
        onError: (error) => {
            console.log(error);
            const errorResult = error.data;
            if (error.status === 410) {
                showWarning(errorResult.error);
            }
            else {
                showError(errorResult.error);
            }
        }
    })

    const { mutate: resend, isPending: otpLoading } = useMutation({
        mutationFn: sendOTP,
        onSuccess: (response) => {
            console.log(response);
            const result = response.data;
            if (response.status === 200) {
                showSuccess(result.message);
                setValue("otp", "");
            }
        },
        onError: (error) => {
            console.log(error);
            showError(error.data.error);
        }
    })


    async function onSubmit(data) {
        if (verifyLoading || otpLoading) return;
        verification(data);
    }

    async function handleResend() {
        if (verifyLoading || otpLoading) return;
        const request = watch("email");
        resend(request);
    }

    if (tokenLoading) {
        return "Loading....."
    }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading flex flex-col gap-2">
                <h3 className="text-4xl font-semibold">Verify Your Account</h3>
                <p className="text-sm text-slate-500">Enter OTP sent to your email</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Email" field="email" icon={<MdEmail />} loading={true} register={register} />
                <h4 className="font-semibold">OTP</h4>
                <div className="input w-full justify-center flex flex-wrap">
                    <OTPInput value={watch("otp")} onChange={(value) => {
                        setValue("otp", value);
                    }} numInputs={6} renderSeparator={<span className="hidden md:flex">-</span>} renderInput={(props) => <input {...props} />} inputStyle={{ width: "2.2rem", height: "2.2rem", border: "1px solid var(--foreground)", borderRadius: "0.25rem", display: "flex", justifyContent: "center", textAlign: "center" }}
                        containerStyle={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "0.1rem" }} />
                </div>
                <button type="submit"
                    disabled={(verifyLoading || otpLoading)}
                    className={`${(verifyLoading || otpLoading) ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >{(verifyLoading || otpLoading) ? "Submitting..." : "Submit"}</button>
            </form>
            <div className="footer flex flex-row items-center justify-center font-semibold mt-5 lg:mt-0 gap-5 lg:gap-1">
                <span className="text-(--foreground)">Didn't get OTP? </span>
                <span onClick={handleResend}
                    className={`${(verifyLoading || otpLoading) ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>{(verifyLoading || otpLoading) ? "Resending..." : "Resend"}</span>
            </div>
        </div>
    )
}