"use client";

import PostCard from "@/components/Post";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart, Share2, EyeOff } from "lucide-react"; // Tambahkan EyeOff untuk indikator visual blur
import { useUser } from "@/context/userContext";

export default function PostDetail({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [showImage, setShowImage] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        setRelatedPosts(data.posts.filter((p: any) => p._id !== params.id));
      });
  }, [params.id]);

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data.post);
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      });
  }, [params.id]);

  // LOGIKA PENGECEKAN BLUR NSFW
  const isPostNSFW = post?.tags?.some((t: string) => t.toLowerCase() === "nsfw");
  const isUserAllowedNSFW = user && (user.age >= 18) && (user.allowNSFW === true);
  // Gambar diblur jika postingan NSFW dan pengguna TIDAK diizinkan melihatnya
  const shouldBlur = isPostNSFW && !isUserAllowedNSFW;

  async function handleLike() {
    if (!user) { toast.error("Login dulu yuk!"); return; }
    if (liking) return;
    setLiking(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await fetch(`/api/posts/${params.id}/like`, { method: "POST" });
      const data = await res.json();
      setLikeCount(data.totalLikes);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Gagal like post");
    } finally {
      setLiking(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.desc, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {}
  }

  if (!post) {
    return <p className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading...</p>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-[#0B0B10] text-black dark:text-zinc-100">

      {/* AMBIENT BACKGROUND */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "420px" }}>
        {!shouldBlur && (
        <div
          className="absolute inset-0 scale-110 opacity-40"
          style={{
            backgroundImage: `url(${post.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // Jika harus diblur, tambah kekuatan blur dasarnya agar konten tidak bocor lewat ambient background
            filter: "blur(40px)",
          }}
        />)}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#0B0B10]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-0">
          <div className="relative border rounded-md overflow-hidden border-purple-700/50 dark:border-purple-400/30 bg-zinc-100 dark:bg-zinc-950">

            {/* KONTINER GAMBAR UTAMA */}
            <div className="relative w-full overflow-hidden flex items-center justify-center select-none">
              <img
                src={post.img}
                alt={post.title}
                // Klik untuk zoom dinonaktifkan/tidak berefek jika gambar sedang disensor blur
                onClick={() => !shouldBlur && setShowImage(true)}
                className={`w-full max-h-[700px] object-cover transition duration-300 ${
                  shouldBlur 
                    ? "blur-3xl scale-105 pointer-events-none" 
                    : "cursor-zoom-in hover:opacity-95"
                }`}
              />
              
              {/* Overlay Text Indikator Sensor jika terkena Blur */}
              {shouldBlur && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white p-4 text-center backdrop-blur-sm">
                  <EyeOff size={36} className="mb-2 text-zinc-200 drop-shadow" />
                  <p className="text-sm md:text-base font-semibold bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                    Konten ini disensor karena mengandung unsur sensitif/NSFW.
                  </p>
                </div>
              )}
            </div>

            {/* DETAIL */}
            <div className="p-4 md:p-6 bg-white dark:bg-zinc-900">

              {/* TITLE + ACTIONS */}
              <div className="flex flex-wrap justify-between items-start gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex-1 min-w-0">{post.title}</h1>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">
                  {user ? (
                    <button
                      disabled={liking}
                      onClick={handleLike}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition disabled:opacity-50 text-sm"
                    >
                      <Heart
                        size={14}
                        className={liked ? "fill-purple-500 text-purple-500" : "text-gray-400 dark:text-gray-300"}
                      />
                      <span>{likeCount}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Heart size={14} />
                      <span>{likeCount}</span>
                    </span>
                  )}

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-sm"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>

              {/* DESC */}
              {post.desc && (
                <p className="mt-4 text-base md:text-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {post.desc}
                </p>
              )}

              {/* USER */}
              <div className="mt-5">
                <a href={`/profile/${post.user?._id}`} className="inline-flex items-center gap-3 no-underline">
                  <img
                    src={post.user?.profilePicture || "/default-avatar.png"}
                    alt={post.user?.username}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-gray-300 dark:border-zinc-700"
                  />
                  <span className="text-gray-800 dark:text-gray-200">{post.user?.username}</span>
                </a>
              </div>

              {/* TAGS */}
              {post.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => {
                    const isAI = tag.toLowerCase() === "ai";
                    const targetHref = isAI ? "/artificial" : `/search?q=${encodeURIComponent(tag)}`;

                    return (
                      <a
                        key={tag}
                        href={targetHref}
                        className="px-3 py-1 rounded-full text-xs md:text-sm border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-500 transition no-underline"
                      >
                        #{tag}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED */}
      <div className="mx-auto px-4 md:px-8 mt-8 pb-10">
        {relatedPosts.length > 0 && (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
            {relatedPosts.map((p: any) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        )}
      </div>

      {/* IMAGE MODAL */}
      {showImage && !shouldBlur && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setShowImage(false)}
        >
          <button
            className="absolute top-5 right-6 text-white text-3xl"
            onClick={() => setShowImage(false)}
          >
            ×
          </button>
          <img
            src={post.img}
            alt={post.title}
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}