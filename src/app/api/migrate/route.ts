import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET() {
  await connect();
  try {
    // Update semua user yang belum punya field interactions
    const result = await User.updateMany(
      { interactions: { $exists: false } },
      { $set: { interactions: [] } }
    );
    
    return NextResponse.json({ 
      message: "Migrasi berhasil!", 
      modifiedCount: result.modifiedCount 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}