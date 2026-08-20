import toast from "react-hot-toast";
import { FcApproval, FcInfo } from "react-icons/fc";
import { TiWarning } from "react-icons/ti";

export function showSuccess(message) {
    toast(message, {
        icon: <FcApproval size={24} />
    })
}

export function showError(message) {
    toast.error(message);
}

export function showWarning(message) {
    toast(message, {
        icon: <TiWarning size={24} />,
    })
}

export function showInfo(message) {
    toast(message, {
        icon: <FcInfo size={24} />
    });
}