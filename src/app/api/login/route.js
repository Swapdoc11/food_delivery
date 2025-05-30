import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/app/lib/user";
import { MONGODB_URI } from "@/app/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsupersecretkey";

function generateTokens(user) {
    const accessToken = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
}

export async function POST(req) {
    try {
        await mongoose.connect(MONGODB_URI);
        const data = await req.json();
        const { email, password } = data;
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();
        return NextResponse.json({
            message: "Login successful",
            user: { _id: user._id, name: user.name, email: user.email },
            accessToken,
            refreshToken
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    // For token verification (optional, e.g. /api/login?token=...)
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return NextResponse.json({ valid: true, decoded });
    } catch (err) {
        return NextResponse.json({ valid: false, error: err.message }, { status: 401 });
    }
}
