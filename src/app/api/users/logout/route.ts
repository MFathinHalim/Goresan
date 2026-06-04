import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}