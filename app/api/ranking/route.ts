import { redis } from "../../../lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    const memeId = `meme:${Date.now()}`;
    if (!redis) {
      return NextResponse.json(
        { error: "Redis client is not available" },
        { status: 500 },
      );
    }
    await redis.hset(memeId, { imageUrl, votes: 0 });
    await redis.zadd("memes:ranking", { score: 0, member: memeId });

    return NextResponse.json({ success: true, memeId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add meme to ranking" },
      { status: 500 },
    );
  }
}
