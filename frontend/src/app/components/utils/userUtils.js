import useFetch from "@/app/hooks/useFetch";

export function login(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, "login", request, true);
}

export function registerUser(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, "register", request, false);
}

export function getUserFromToken(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, "email", { token: request }, false);
}

export function verifyOTP(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, "verifyOTP", request, false);
}

export function sendOTP(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, "sendOTP", { email: request }, false);
}

export function resetPassword(request) {
    return useFetch("patch", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, "reset", request, false);
}

export function getCurrentUser() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Auth, process.env.NEXT_PUBLIC_MAPPING_Auth, "me", "", true);
}

export function checkAdmin() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Auth, process.env.NEXT_PUBLIC_MAPPING_Auth, "admin", "", true);
}

export function logout() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Auth, process.env.NEXT_PUBLIC_MAPPING_Auth, "logout", "", true);
}

export function passwordVerify(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Auth, process.env.NEXT_PUBLIC_MAPPING_Auth, "", { email: request }, true);
}

export function deleteUser() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Auth, process.env.NEXT_PUBLIC_MAPPING_Auth, "", "", true);
}

export function allUsers(pageNumber, pageSize, role) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_User, process.env.NEXT_PUBLIC_MAPPING_User, `?page=${pageNumber}&size=${pageSize}&role=${role}`, "", true);
}
