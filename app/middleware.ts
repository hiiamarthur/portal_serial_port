// import { NextRequest, NextResponse } from "next/server";
// import { verifyJWT } from "lib/jwt";
// import { getErrorResponse } from "lib/helper";

// interface AuthenticatedRequest extends NextRequest {
//   user: {
//     id: string;
//   };
// }

// let redirectToLogin = false;
// export async function middleware(req: NextRequest) {
//   let token: string | undefined;

//   if (req.cookies.has("token")) {
//     token = req.cookies.get("token");
//   } else if (req.headers.get("Authorization")?.startsWith("Bearer ")) {
//     token = req.headers.get("Authorization")?.substring(7);
//   }

//   if (req.nextUrl.pathname.startsWith("/login") && (!token || redirectToLogin))
//     return;

//   if (
//     !token &&
//     (req.nextUrl.pathname.startsWith("/api/users") ||
//       req.nextUrl.pathname.startsWith("/api/auth/logout"))
//   ) {
//     return getErrorResponse(
//       401,
//       "You are not logged in. Please provide a token to gain access."
//     );
//   }

//   const response = NextResponse.next();

//   try {
//     if (token) {
//       const { sub } = await verifyJWT(token);
//       response.headers.set("X-USER-ID", sub);
//       (req as AuthenticatedRequest).user = { id: sub };
//     }
//   } catch (error) {
//     redirectToLogin = true;
//     if (req.nextUrl.pathname.startsWith("/api")) {
//       return getErrorResponse(401, "Token is invalid or user doesn't exists");
//     }

//     return NextResponse.redirect(
//       new URL(`/login?${new URLSearchParams({ error: "badauth" })}`, req.url)
//     );
//   }

//   const authUser = (req as AuthenticatedRequest).user;

//   if (!authUser) {
//     return NextResponse.redirect(
//       new URL(
//         `/login?${new URLSearchParams({
//           error: "badauth",
//           forceLogin: "true",
//         })}`,
//         req.url
//       )
//     );
//   }

//   if (req.url.includes("/login") && authUser) {
//     return NextResponse.redirect(new URL("/profile", req.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: ["/profile", "/login", "/api/users/:path*", "/api/auth/logout","/api/auth/register"],
// };
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log("middleware called");
  return NextResponse.redirect(new URL('/api/auth', request.url))
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/auth/registera',
}