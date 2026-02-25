import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/v2/login",
    },
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
