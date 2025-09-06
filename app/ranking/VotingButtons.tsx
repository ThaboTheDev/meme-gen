"use client";
import React from "react";

interface VotingButtonsProps {
  memeId: string;
}

export default function VotingButtons({ memeId }: VotingButtonsProps) {
  const handleVote = async (vote: number) => {
    try {
      await fetch("/api/ranking/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memeId, vote }),
      });
      alert(vote === 1 ? "You liked this meme!" : "You disliked this meme.");
    } catch {
      alert("Failed to submit vote.");
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => handleVote(1)}
      >
        Like
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => handleVote(-1)}
      >
        Dislike
      </button>
    </div>
  );
}
