import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";

export async function PUT(req: NextRequest) {
  await connect();

  try {
    const userId = getDataFromToken(req);

    const body = await req.json();

    const age = Number(body.age);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        age,
        allowNSFW:
          age >= 18
            ? body.allowNSFW
            : false,
      },
      {
        new: true,
      }
    ).select("-password");

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}