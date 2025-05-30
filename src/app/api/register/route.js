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
        const { name, surname, country, state, city, phone, email, address, password } = data;
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already registered." }, { status: 409 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, surname, country, state, city, phone, email, address, password: hashedPassword
        });
        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();
        return NextResponse.json({
            message: "Registration successful",
            user: { _id: user._id, name: user.name, email: user.email },
            accessToken,
            refreshToken
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
