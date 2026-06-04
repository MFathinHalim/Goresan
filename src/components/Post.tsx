"use client";

import { useState } from "react";

function getBottomBorderColor(imgEl: HTMLImageElement): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 20;
    canvas.height = 20;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "rgba(0,0,0,0.15)";

    ctx.drawImage(imgEl, 0, 0, 20, 20);

    // Ambil hanya baris paling bawah gambar
    const data = ctx.getImageData(0, 19, 20, 1).data;

    let totalBrightness = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      totalBrightness += brightness;
      count++;
    }

    const avgBrightness = totalBrightness / count;

    // Kalau bawah gambar terang -> garis gelap
    if (avgBrightness > 180) {
      return "rgba(0,0,0,0.25)";
    }

    // Kalau bawah gambar gelap -> garis terang
    return "rgba(255,255,255,0.35)";
  } catch {
    return "rgba(0,0,0,0.15)";
  }
}

export default function PostCard({ post }: { post: any }) {
  const [borderColor, setBorderColor] = useState("rgba(0,0,0,0.15)");

  return (
    <a
      href={`/post/${post.id}`}
      className="block mb-3 border rounded-md border-purple-700 dark:border-purple-400/50 break-inside-avoid no-underline text-black"
    >
      <div className="rounded-t-md overflow-hidden">
        <img
          src={post.img}
          alt={post.title}
          className="w-full block max-h-[700px] object-cover"
          crossOrigin="anonymous"
          style={{
            borderBottom: `1px solid ${borderColor}`,
          }}
          onLoad={(e) => {
            setBorderColor(
              getBottomBorderColor(
                e.currentTarget as HTMLImageElement
              )
            );
          }}
        />

        <div className="flex justify-between items-center px-2 py-1 text-xs">
          <span className="truncate dark:text-zinc-400">{post.title}</span>
          <span className="text-gray-400 ml-2 shrink-0">
            {post.user?.username}
          </span>
        </div>
      </div>
    </a>
  );
}