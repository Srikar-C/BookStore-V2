import crypto from "crypto";

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export default function requestId(req, res, next) {
    const incomingRequestId = req.get("X-Request-ID");
    const requestId = incomingRequestId && requestIdPattern.test(incomingRequestId)
        ? incomingRequestId
        : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
}
