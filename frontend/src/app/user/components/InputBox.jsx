import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

export default function InputBox({ label, field, icon, loading, register, setFocusedField, errors, color, type, style }) {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="input w-full flex flex-col gap-1">
            <div className="label capitalize font-medium">{label}</div>
            <div className={`flex gap-3 items-center w-full shadow-xs p-3 rounded-xl border-2 border-(--foreground) ${loading && "cursor-not-allowed bg-(--nonedit)"} transition-colors duration-200`} style={{ borderColor: color }}>
                <span className="text-2xl text-(--input-icon)">{icon}</span>
                <input type={type === "password" ? (showPassword ? "text" : type) : type} className={`border-none outline-none w-[90%] ${loading && "cursor-not-allowed"} ${style} self-center`}
                    disabled={loading}
                    {...register(field, {
                        required: {
                            value: true,
                            message: `${label} required`
                        },
                        ...(field === "phone" && {
                            validate: {
                                validLength: (fieldValue) => {
                                    return fieldValue.length === 10 || "Phone Number must be 10 digits"
                                },
                                validValue: (fieldValue) => {
                                    return !/[a-zA-Z]/.test(fieldValue) || "Phone must be numbers"
                                }
                            },
                        }),
                        ...(field === "price" && {
                            validate: {
                                validValue: (fieldValue) => {
                                    return !/[a-zA-Z]/.test(fieldValue) || "Price must be numbers"
                                }
                            }
                        }),
                        ...(field === "quantity" && {
                            validate: {
                                validValue: (fieldValue) => {
                                    return !/[a-zA-Z]/.test(fieldValue) || "Quantity must be numbers"
                                }
                            }
                        }),
                        ...(field === "category" && {
                            validate: {
                                validValue: (fieldValue) => {
                                    return !/[0-9]/.test(fieldValue) || "Category should not be numbers"
                                }
                            }
                        }),
                        ...(field === "email" && {
                            pattern: {
                                value: /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/,
                                message: "Invalid Email Address",
                            }
                        })
                    })} placeholder={`Enter ${label}`} onFocus={() => setFocusedField(field)}
                    onBlur={() => setFocusedField(null)} />
                {type === "password" &&
                    <span onClick={() => setShowPassword(!showPassword)} className="cursor-pointer text-xl" >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                }
            </div>
            <div className={`error my-0 leading-1.5 h-[0.5vh] text-sm font-semibold`} style={{ color: color }}>{errors}</div>
        </div>
    )
}