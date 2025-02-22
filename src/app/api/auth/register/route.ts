import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBService } from "@/services/dynamodb";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received registration request:", body);

    // validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // check if email already exists
    try {
      const existingUser = await DynamoDBService.getUserByEmail(body.email);
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // create user object
    const user = {
      id: uuidv4(),
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      phone: body.phone,
      address: body.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Attempting to create user:", user);

    // save user to DynamoDB
    await DynamoDBService.createUser(user);
    console.log("User created successfully");

    // 设置认证 cookie
    cookies().set("auth_token", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // return success response
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: "Registration successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
