import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { id, vote } = await request.json();
    if (!id || ![1, -1].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Update the meme's vote count in Redis
    if (!redis) {
      return NextResponse.json(
        { error: "Redis client not initialized" },
        { status: 500 },
      );
    }
    const memeKey = id;
    const currentVotes = await redis.hget(memeKey, "votes");
    const votesString = typeof currentVotes === "string" ? currentVotes : "0";
    const newVotes = (parseInt(votesString) || 0) + vote;

    await redis.hset(memeKey, { votes: newVotes });

    // Update the ranking sorted set
    await redis.zadd("memes:ranking", { score: newVotes, member: memeKey });

    return NextResponse.json({ success: true, votes: newVotes });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
