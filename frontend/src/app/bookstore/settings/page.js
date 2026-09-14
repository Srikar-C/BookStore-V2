"use client"
import AccountSkeleton from "@/app/components/skeletons/AccountSkeleton";
import { countOrders } from "@/app/components/utils/orderUtils";
import { showError, showSuccess, showWarning } from "@/app/components/utils/showToasts";
import { resetPassword, sendOTP, verifyOTP } from "@/app/components/utils/userUtils";
import { useUserStore } from "@/app/hooks/useStore"
import InputBox from "@/app/user/components/InputBox";
import Modal from "@mui/material/Modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUserAlt } from "react-icons/fa";
import { MdEmail, MdOutlinePassword } from "react-icons/md";
import OTPInput from "react-otp-input";

export default function Settings() {

    const { user } = useUserStore();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState(false);
    const { register, handleSubmit, formState, setValue, watch, setError } = useForm({
        defaultValues: {
            email: user?.email,
            password: ""
        }
    });

    const { data, isPending } = useQuery({
        queryKey: ["ordersCount", user?.id],
        queryFn: () => countOrders(user?.id),
        select: (response) => response?.data
    })

    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const { mutate, isPending: otpLoading } = useMutation({
        mutationFn: sendOTP,
        onSuccess: (response) => {
            console.log(response);
            showSuccess("OTP sent");
            setValue("password", "");
            setValue("cfnpassword", "");
        },
        onError: (error) => {
            console.log(error);
            // if (error.status === 429) {
            showError(error.data.error);
            // }
        }
    })

    const { mutate: verification, isPending: verifyLoading } = useMutation({
        mutationFn: verifyOTP,
        onSuccess: (response) => {
            const result = response.data;
            console.log(response);
            if (response.status === 200) {
                setMode(true);
                setValue("otp", "");
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

    const { mutate: changingPassword, isPending: changePending } = useMutation({
        mutationFn: resetPassword,
        onSuccess: (response) => {
            showSuccess(response.data.message);
            setOpen(false);
            setMode(false);
            setValue("password", "");
            setValue("cfnpassword", "");
        },
        onError: (error) => {
            const errorResult = error.data;
            console.log("reset error: ", errorResult);
            setValue("cfnpassword", "");
            showError(errorResult.error);
        }
    })

    if (!user || changePending) {
        return <AccountSkeleton />
    }

    function onSubmit(data) {
        console.log(data);
        const request = {
            cfnpassword: data.cfnpassword,
            email: data.email,
            password: data.password,
        }
        if (verifyLoading) return;
        {
            mode ? changingPassword(request) : verification(data)
        }
    }

    function handleResend() {
        if (verifyLoading || otpLoading) return;
        const request = watch("email");
        mutate(request);
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h4 className="font-semibold text-xl font-serif">User Details</h4>
            <div className="box grid grid-cols-2 gap-3 border-2 border-(--foreground) p-3 rounded-xl">
                <span className="font-semibold">UserId</span>
                <span>{user?.id}</span>
                <span className="font-semibold">Name</span>
                <span>{user?.name}</span>
                <span className="font-semibold">Email</span>
                <span>{user?.email}</span>
                <span className="font-semibold">Phone</span>
                <span>{user?.phone}</span>
                <span className="font-semibold">Role</span>
                <span>{user?.role}</span>
                <span className="p-2 border-2 border-(--section) cursor-pointer w-fit bg-orange-400 text-white rounded-2xl font-semibold"
                    onClick={() => {
                        setOpen(true);
                        mutate(user?.email);
                        setValue("otp", "");
                    }}>Change Password</span>
            </div>
            {user?.role === "USER" && <div className="flex flex-col gap-5 border-2 border-(--foreground) p-3 rounded-xl">
                <h4 className="font-semibold text-xl font-serif">Stats</h4>
                <div className="boxes flex gap-5">
                    <div className="flex justify-between px-4 py-1 rounded-lg w-62.5 h-[15vh] items-center bg-[linear-gradient(135deg,#A97CF8,#F38CB8)] text-(--background) shadow-(color:--shadow)">
                        <h6 className="text-xl font-semibold">Total Number of Orders</h6>
                        <p className="text-lg">{data?.data?.totalOrders}</p>
                    </div>
                    <div className="flex justify-between px-4 py-1 rounded-lg w-62.5 h-[15vh] items-center bg-[linear-gradient(135deg,#A97CF8,#F38CB8)] text-(--background) shadow-(color:--shadow)">
                        <h6 className="text-xl font-semibold">Total Number of Units</h6>
                        <p className="text-lg">{data?.data?.totalBooks}</p>
                    </div>
                </div>
            </div>}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                {mode ?
                    <form onSubmit={handleSubmit(onSubmit)} className="inputs absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5 bg-(--background) text-(--foreground) border-2 border-(--foreground) p-4 w-100 rounded-xl">
                        <h4 className="text-xl font-semibold">Change Password</h4>
                        <InputBox label="Email" field="email" icon={<FaUserAlt />} loading={changePending} register={register} setFocusedField={setFocusedField} errors={errors.email?.message} type="text" />
                        <InputBox label="Password" field="password" icon={<MdOutlinePassword />} loading={changePending} register={register} setFocusedField={setFocusedField} errors={errors.password?.message} type="password" />
                        <InputBox label="Confirm Password" field="cfnpassword" icon={<MdOutlinePassword />} loading={changePending} register={register} setFocusedField={setFocusedField} errors={errors.cfnpassword?.message} type="password" />
                        {/* <DevTool control={control} /> */}
                        <button type="submit" className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                        >{changePending ? "Submitting..." : "Submit"}</button>
                    </form>
                    :
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5 bg-(--background) text-(--foreground) border-2 border-(--foreground) p-4 w-100 rounded-xl">
                        <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-3">
                            {/* <div> */}
                            <h4 className="text-xl font-semibold">Enter OTP sent to Email</h4>
                            <InputBox label="Email" field="email" icon={<MdEmail />} loading={true} register={register} />
                            {/* </div> */}
                            <OTPInput value={watch("otp")} disabled={otpLoading} onChange={(value) => {
                                setValue("otp", value);
                            }} numInputs={6} renderSeparator={<span className="hidden md:flex">-</span>} renderInput={(props) => <input {...props} />} inputStyle={{ width: "2.2rem", height: "2.2rem", border: "1px solid var(--foreground)", borderRadius: "0.25rem", display: "flex", justifyContent: "center", textAlign: "center" }}
                                containerStyle={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "0.1rem" }} />
                            <button type="submit"
                                disabled={(verifyLoading || otpLoading)}
                                className={`${(verifyLoading || otpLoading) ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                            >Submit</button>
                        </form>
                        <div className="footer flex flex-row items-center justify-center font-semibold mt-5 lg:mt-0 gap-5 lg:gap-1">
                            <span className="text-(--foreground)">Didn't get OTP? </span>
                            <span onClick={handleResend}
                                className={`${(verifyLoading || otpLoading) ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>{(verifyLoading || otpLoading) ? "Resending..." : "Resend"}</span>
                        </div>
                    </div>

                }
            </Modal>
        </div>
    )
}