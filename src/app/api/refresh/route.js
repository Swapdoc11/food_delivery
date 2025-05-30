import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "@/app/lib/user";
import { MONGODB_URI } from "@/app/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsupersecretkey";

export async function POST(req) {
    try {
        await mongoose.connect(MONGODB_URI);
        const { refreshToken } = await req.json();
        if (!refreshToken) {
            return NextResponse.json({ error: "Refresh token required." }, { status: 400 });
        }
        let payload;
        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (err) {
            return NextResponse.json({ error: "Invalid or expired refresh token." }, { status: 401 });
        }
        const user = await User.findById(payload.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ error: "Invalid refresh token." }, { status: 401 });
        }
        // Generate new tokens
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "15m" }
        );
        const newRefreshToken = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );
        user.refreshToken = newRefreshToken;
        await user.save();
        return NextResponse.json({
            accessToken,
            refreshToken: newRefreshToken
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
