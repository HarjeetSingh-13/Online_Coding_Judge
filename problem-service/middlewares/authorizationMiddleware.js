export async function authorizationMiddleware(req, res, next) {
    try {
        const role = req.userRole;
        if(!role || role !== 'problem-setter') {
            return res.status(403).json({ message: "Forbidden: You do not have permission to access this resource" });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, please login" });
    }
}