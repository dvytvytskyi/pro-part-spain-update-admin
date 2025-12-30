import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "dmytro@pro-part.es";
const ADMIN_PASSWORD = "xTVvPEwrpaF4"; // Using the server password as the user suggested

export async function POST(request: Request) {
    try {
        const { email, password, keepLoggedIn } = await request.json();

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const cookieStore = await cookies();

            const maxAge = keepLoggedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

            // Set a simple auth cookie
            cookieStore.set("auth_session", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: maxAge,
                path: "/",
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred during login" },
            { status: 500 }
        );
    }
}
