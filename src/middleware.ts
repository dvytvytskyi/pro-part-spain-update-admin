import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the user is authenticated via cookie
    const isAuthenticated = request.cookies.get("auth_session");

    // Define paths that are always public
    const isPublicPath = pathname === "/login" || pathname.startsWith("/api/auth");

    // We also want to allow external API access via keys, but middleware is primarily for UI protection here.
    // However, if it's an API route (other than auth), we might want to skip redirect to login.
    const isApiPath = pathname.startsWith("/api") && !pathname.startsWith("/api/auth");

    // --- CORS Support ---
    const response = NextResponse.next();

    // Add CORS headers to ALL responses
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key, x-api-secret, Authorization");

    // Handle Preflight requests (OPTIONS)
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-api-secret, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    if (!isAuthenticated && !isPublicPath) {
        // If not authenticated and trying to access a protected UI route, redirect to login
        if (!isApiPath) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        // For APIs, if no session, we still allow them to proceed because they might be using API Keys
        // The individual API routes handle API Key validation.
    }

    if (isAuthenticated && pathname === "/login") {
        // If authenticated and trying to access login, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        "/((?!_next/static|_next/image|favicon.ico|images).*)",
    ],
};
