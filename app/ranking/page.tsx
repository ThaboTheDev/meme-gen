import { redis } from "../../lib/redis";
import VotingButtons from "./VotingButtons";

async function getRankedMemes() {
  if (!redis) {
    throw new Error("Redis client is not initialized.");
  }
  const memeIds = await redis!.zrange("memes:ranking", 0, -1, { rev: true });
  const memes = await Promise.all(
    memeIds.map(async (id) => {
      const memeData = (await redis!.hgetall(String(id))) ?? {};
      return {
        id: String(id),
        imageUrl: memeData.imageUrl ?? "",
        votes: memeData.votes ?? "0",
        ...memeData,
      };
    }),
  );
  return memes;
}

export default async function RankingPage() {
  const memes = await getRankedMemes();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meme Rankings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memes.map((meme) => (
          <div key={String(meme.id)} className="border rounded-lg p-4">
            <img src={String(meme.imageUrl ?? "")} alt="Meme" className="w-full rounded-lg" />
            <div className="flex justify-between items-center mt-2">
              <span>Votes: {String(meme.votes ?? 0)}</span>
              <VotingButtons memeId={meme.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
