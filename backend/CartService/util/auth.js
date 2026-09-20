import jwt from "jsonwebtoken";

export function getAuthenticatedUserId(req) {
    const token = req.cookies?.token;
    if (!token) {
        return null;
    }

    try {
        const jwtSecret = process.env.JWT_SECRET_KEY ?? process.env.JWT_SECRET;
        if (!jwtSecret) {
            return null;
        }
        const secret = Buffer.from(jwtSecret, "base64");
        const decoded = jwt.verify(token, secret);
        return decoded.userid ?? null;
    } catch (error) {
        return null;
    }
}
