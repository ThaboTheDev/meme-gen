import React, { useRef, useEffect, useState, ChangeEvent } from "react";
import axios from "axios";

// Interface for Pinata API response
interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

// Interface for Neynar API response (basic, for cast success)
interface NeynarCastResponse {
  success: boolean;
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  const [topFontSize, setTopFontSize] = useState<number>(40);
  const [bottomFontSize, setBottomFontSize] = useState<number>(40);
  const [topFontColor, setTopFontColor] = useState<string>("white");
  const [bottomFontColor, setBottomFontColor] = useState<string>("white");
  const [topTextY, setTopTextY] = useState<number>(0);
  const [bottomTextY, setBottomTextY] = useState<number>(0);
  const [signerUuid, setSignerUuid] = useState<string>("");
  const [error, setError] = useState<string>("");

  const PINATA_JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMzNjODM1NC0wNjUxLTRlNjEtOGRiOC1iZjg0ODNmYzExZTMiLCJlbWFpbCI6InRoYWJvdGhhbmRhemFuaW1saWxvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI3MzhlOWVlYzNlOTMwMmEzZTZkNCIsInNjb3BlZEtleVNlY3JldCI6ImVmNDk2MDQwZWQ4Y2VmMzlkZTljMjg0MTI0ZWU5ZTZlMDc1ZTM4NTc2NjA5MGNlMmE0MTFjNWMyODg3ZWJmNmYiLCJleHAiOjE3ODg2OTYwOTV9.wlH_6GUtCgj0OvwzTYJpAN-oDqZCo_Ai98DknqCdYcY"; // Replace with your Pinata JWT
  const NEYNAR_API_KEY = "B3D8EBC5-6BE0-49FC-ADFF-098C7DEE8171"; // Replace with your Neynar API key

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let imageX = 0,
      imageY = 0,
      imageWidth = canvas.width,
      imageHeight = canvas.height;

    if (image) {
      const aspectRatio = image.width / image.height;
      imageWidth = canvas.width;
      imageHeight = canvas.width / aspectRatio;
      if (imageHeight > canvas.height) {
        imageHeight = canvas.height;
        imageWidth = canvas.height * aspectRatio;
      }
      imageX = (canvas.width - imageWidth) / 2;
      imageY = (canvas.height - imageHeight) / 2;
      ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    } else {
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6b7280";
      ctx.font = "24px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Upload an image to start",
        canvas.width / 2,
        canvas.height / 2,
      );
    }

    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      fontSize: number,
      color: string,
    ) => {
      ctx.font = `${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = color;
      ctx.strokeStyle = "black";
      ctx.lineWidth = fontSize / 15;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;

      const words = text.split(" ");
      let line = "";
      const lines: string[] = [];
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line);
          line = words[i] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
        ctx.strokeText(lines[i], x, y + i * lineHeight);
      }
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      return lines.length * lineHeight;
    };

    if (topText || bottomText) {
      const padding = Math.min(topFontSize, bottomFontSize) * 0.5;
      const maxTextWidth = imageWidth - padding * 2;

      if (topText) {
        const lineHeight = topFontSize * 1.2;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        wrapText(
          topText.toUpperCase(),
          imageX + imageWidth / 2,
          imageY + padding + topFontSize + topTextY,
          maxTextWidth,
          lineHeight,
          topFontSize,
          topFontColor,
        );
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
      }

      if (bottomText) {
        const lineHeight = bottomFontSize * 1.2;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        wrapText(
          bottomText.toUpperCase(),
          imageX + imageWidth / 2,
          imageY + imageHeight - padding - bottomFontSize + bottomTextY,
          maxTextWidth,
          lineHeight,
          bottomFontSize,
          bottomFontColor,
        );
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
      }
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => setImage(img);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareOnX = () => {
    const tweetText = encodeURIComponent("Check out my meme! #MemeGenerator");
    const deepLink = `x://post?message=${tweetText}`;
    const webFallback = `https://x.com/intent/tweet?text=${tweetText}`;

    const link = document.createElement("a");
    link.href = deepLink;
    link.onclick = () => {
      setTimeout(() => {
        window.location.href = webFallback;
      }, 500);
    };
    link.click();
  };

  const shareOnFarcaster = async () => {
    if (!canvasRef.current) {
      setError("No meme to share. Create a meme first.");
      return;
    }
    if (!signerUuid) {
      setError("Please enter a valid Farcaster signer UUID.");
      return;
    }

    try {
      setError("");
      // Convert canvas to blob for Pinata upload
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), "image/png");
      });

      // Upload to Pinata
      const formData = new FormData();
      formData.append("file", blob, "meme.png");
      const pinataResponse = await axios.post<PinataResponse>(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;

      // Post to Farcaster via Neynar API
      await axios.post<NeynarCastResponse>(
        "https://api.neynar.com/v2/farcaster/cast",
        {
          signer_uuid: signerUuid,
          text: "Check out my meme! #MemeGenerator",
          embeds: [{ url: ipfsUrl }],
        },
        {
          headers: {
            api_key: NEYNAR_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );

      alert("Meme posted to Farcaster successfully!");
    } catch (err) {
      setError(
        "Failed to post to Farcaster. Check your signer UUID or API keys.",
      );
      console.error(err);
    }
  };

  const addToRanking = async () => {
    if (!canvasRef.current) {
      setError("No meme to add. Create a meme first.");
      return;
    }

    try {
      setError("");
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), "image/png");
      });

      const formData = new FormData();
      formData.append("file", blob, "meme.png");
      const pinataResponse = await axios.post<PinataResponse>(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const imageUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;

      await axios.post("/api/ranking", { imageUrl });

      alert("Meme added to ranking successfully!");
    } catch (err) {
      setError("Failed to add meme to ranking.");
      console.error(err);
    }
  };

  useEffect(() => {
    drawMeme();
  }, [
    image,
    topText,
    bottomText,
    topFontSize,
    bottomFontSize,
    topFontColor,
    bottomFontColor,
    topTextY,
    bottomTextY,
  ]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="bg-gray-800 text-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300">
        <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Meme Generator
        </h1>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-gray-600 rounded-lg mb-6 w-full bg-white"
        />
        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="imageInput"
              className="block text-sm font-medium mb-1"
            >
              Upload Image
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="signerUuid"
              className="block text-sm font-medium mb-1"
            >
              Farcaster Signer UUID
            </label>
            <input
              id="signerUuid"
              type="text"
              placeholder="Enter Farcaster signer UUID"
              value={signerUuid}
              onChange={(e) => setSignerUuid(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="topText" className="block text-sm font-medium mb-1">
              Top Text
            </label>
            <input
              id="topText"
              type="text"
              placeholder="Enter top text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              maxLength={50}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="topFontSize"
              className="block text-sm font-medium mb-1"
            >
              Top Text Font Size
            </label>
            <select
              id="topFontSize"
              value={topFontSize}
              onChange={(e) => setTopFontSize(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value={20}>20px</option>
              <option value={30}>30px</option>
              <option value={40}>40px</option>
              <option value={50}>50px</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="topFontColor"
              className="block text-sm font-medium mb-1"
            >
              Top Text Color
            </label>
            <select
              id="topFontColor"
              value={topFontColor}
              onChange={(e) => setTopFontColor(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="topTextY"
              className="block text-sm font-medium mb-1"
            >
              Top Text Position (Y)
            </label>
            <input
              id="topTextY"
              type="range"
              min={-100}
              max={100}
              value={topTextY}
              onChange={(e) => setTopTextY(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="bottomText"
              className="block text-sm font-medium mb-1"
            >
              Bottom Text
            </label>
            <input
              id="bottomText"
              type="text"
              placeholder="Enter bottom text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              maxLength={50}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="bottomFontSize"
              className="block text-sm font-medium mb-1"
            >
              Bottom Text Font Size
            </label>
            <select
              id="bottomFontSize"
              value={bottomFontSize}
              onChange={(e) => setBottomFontSize(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value={20}>20px</option>
              <option value={30}>30px</option>
              <option value={40}>40px</option>
              <option value={50}>50px</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="bottomFontColor"
              className="block text-sm font-medium mb-1"
            >
              Bottom Text Color
            </label>
            <select
              id="bottomFontColor"
              value={bottomFontColor}
              onChange={(e) => setBottomFontColor(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="bottomTextY"
              className="block text-sm font-medium mb-1"
            >
              Bottom Text Position (Y)
            </label>
            <input
              id="bottomTextY"
              type="range"
              min={-100}
              max={100}
              value={bottomTextY}
              onChange={(e) => setBottomTextY(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={saveMeme}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition duration-200 transform hover:scale-105"
            >
              Save Meme
            </button>
            <button
              onClick={shareOnX}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 transition duration-200 transform hover:scale-105"
            >
              Share on X
            </button>
            <button
              onClick={shareOnFarcaster}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition duration-200 transform hover:scale-105"
            >
              Share on Farcaster
            </button>
            <button
              onClick={addToRanking}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 transition duration-200 transform hover:scale-105"
            >
              Add to Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
