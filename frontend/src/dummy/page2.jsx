"use client"
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

export default function Login() {

    const { register, control, handleSubmit, formState } = useForm();
    const { errors } = formState;

    function onSubmit(data) {
        console.log(data);
    }

    return (
        <div className="login p-30">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3 w-[400px]">
                <input type="text" className="border-2 border-black" {...register("name", {
                    required: {
                        value: true,
                        message: "Username required"
                    }
                })} />
                <p>{errors.name?.message}</p>


                <input type="text" className="border-2 border-black" {...register("email", {
                    required: {
                        value: true,
                        message: "Email required"
                    }
                })} />


                <p>{errors.email?.message}</p>
                <input type="text" className="border-2 border-black" {...register("phone", {
                    required: {
                        value: true,
                        message: "phone required"
                    },
                    validate: {
                        validLength: (fieldValue) => {
                            return fieldValue.length === 10 || "Phone must be 10 length"
                        },
                        validValue: (fieldValue) => {
                            return !/[a-zA-Z]/.test(fieldValue) || "Phone must be numbers"
                        }
                    }
                })} />
                <p>{errors.phone?.message}</p>
                <DevTool control={control} />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}