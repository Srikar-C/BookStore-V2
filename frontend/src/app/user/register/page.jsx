"use client"
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FaPhoneAlt, FaUserAlt } from "react-icons/fa";
import { MdEmail, MdOutlinePassword } from "react-icons/md";
import { useAppContext } from "@/app/hooks/AppContext";
import { useEffect, useState } from "react";
import InputBox from "../components/InputBox";
import { getCurrentUser, registerUser } from "@/app/components/utils/userUtils";
import { showInfo, showSuccess } from "@/app/components/utils/showToasts";
import { getColor } from "@/app/components/utils/FunctionalUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import IdentitySkeleton from "@/app/components/skeletons/IdentitySkeleton";

export default function Register() {

    const { router } = useAppContext();
    const { register, handleSubmit, formState, setError } = useForm({
        mode: "onChange",
        defaultValues: {
            name: "",
            password: "",
        }
    });
    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const fields = ["name", "email", "phone", "password"];

    const colors = Object.fromEntries(
        fields.map((field) => [
            field,
            getColor(field, focusedField, errors)
        ])
    );

    const { data, isPending: existing, isSuccess, isError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        select: (response) => response?.data
    });

    useEffect(() => {
        if (existing) return;
        if (!existing && isSuccess && data?.success && data?.data) {
            showInfo("User Already exist, please logout");
            router.replace("/bookstore");
            return;
        }
        router.replace("/user/login");
    }, [existing, isError, isSuccess, router])

    const { mutate: registration, isPending } = useMutation({
        mutationFn: registerUser,
        onSuccess: (response) => {
            const result = response.data;
            showSuccess(result.message);
            localStorage.setItem("mode", "register");
            router.push(`/verify/${result.data.token}`)
        },
        onError: (error) => {
            console.log(error);
            const errorResult = error.data;
            if (error.status === 400) {
                Object.entries(errorResult).forEach(([field, message]) => {
                    setError(field, {
                        type: "validation",
                        message: message
                    });
                });
                return;
            }
            else if (error.status === 409) {
                console.log(error, errorResult.error);
                const errors = errorResult.error;
                Object.entries(errors).forEach(([field, message]) => {
                    setError(field, {
                        type: "exists",
                        message: message
                    });
                });
                return;
            }
        }
    })

    async function onSubmit(data) {
        if (isPending) return;
        const request = {
            ...data,
            role: "USER"
        }
        console.log("Calling");
        registration(request);
    }

    if (existing) {
        return <IdentitySkeleton times={4} />
    }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading">
                <h3 className="text-2xl font-semibold">Sign in to unlock your Next Great Read</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Username" field="name" icon={<FaUserAlt />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.name?.message} color={colors.name} type="text" />
                <InputBox label="Email" field="email" icon={<MdEmail />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.email?.message} color={colors.email} type="text" />
                <InputBox label="Phone Number" field="phone" icon={<FaPhoneAlt />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.phone?.message} color={colors.phone} type="text" />
                <InputBox label="Password" field="password" icon={<MdOutlinePassword />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.password?.message} color={colors.password} type="password" />
                <button type="submit"
                    disabled={isPending}
                    title={!isPending ? "Please Fill All Details" : "Submit"}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >{isPending ? "Submiting..." : "Submit"}</button>
            </form>
            <div className="footer flex flex-row items-center justify-center font-semibold mt-5 lg:mt-0 gap-5 lg:gap-2">
                <span className="text-(--foreground)">Already Have a Account</span>
                <Link href="/user/login" onClick={(e) => isPending && e.preventDefault()}
                    className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Login</Link>
            </div>
        </div>
    )
}