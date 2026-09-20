import axios from "axios";
import { showInfo } from "@/app/components/utils/showToasts";

let redirectingToLogin = false;

function createRequestId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default async function useFetch(httpRequest, port, requestmapping, endpoint, payload, withCredentials) {
    const requestId = createRequestId();
    console.log(`[requestId=${requestId}] Request send to backend in endpoint ${endpoint}: `,
        httpRequest, port, requestmapping, endpoint, payload, withCredentials);
    const url = endpoint
        ? endpoint.startsWith("?")
            ? `${port}/${requestmapping}${endpoint}`
            : `${port}/${requestmapping}/${endpoint}`
        : `${port}/${requestmapping}`;
    try {
        const response = await axios({
            method: httpRequest,
            url: url,
            data: payload,
            withCredentials,
            headers: {
                "X-Request-ID": requestId,
            },
        });
        const result = response.data;
        console.log(`[requestId=${requestId}] Response send to frontend in endpoint ${endpoint}: `, result);
        return response;
    }
    catch (error) {
        const response = error.response;
        if (response?.status === 401 && typeof window !== "undefined"
            && window.location.pathname !== "/user/login" && !redirectingToLogin) {
            redirectingToLogin = true;
            showInfo("Session expired, Please Login");
            window.location.replace("/user/login");
        }
        console.log(`[requestId=${requestId}] Response send to frontend in endpoint ${endpoint}: `,
            response?.data ?? error);
        throw response ?? error;
    }
}