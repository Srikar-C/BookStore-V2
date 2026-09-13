import axios from "axios";

export default async function useFetch(httpRequest, port, requestmapping, endpoint, payload, withCredentials) {
    console.log(`Request send to backend in endpoint ${endpoint}: `, httpRequest, port, requestmapping, endpoint, payload, withCredentials);
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
            withCredentials
        });
        const result = response.data;
        console.log(`Response send to frontend in endpoint ${endpoint}: `, result);
        return response;
    }
    catch (error) {
        console.log(`Response send to frontend in endpoint ${endpoint}: `, error.response.data);
        throw error.response;
    }
}