"use client";

import PostCard from "@/components/Post";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart, Share2 } from "lucide-react";

export default function PostDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [showImage, setShowImage] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setRelatedPosts(
          data.posts.filter((p: any) => p._id !== params.id)
        );
      });
  }, [params.id]);

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data.post);
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      });
  }, [params.id]);

  async function handleLike() {
    if (liking) return;

    setLiking(true);

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/posts/${params.id}/like`, {
        method: "POST",
      });

      const data = await res.json();
      setLikeCount(data.totalLikes);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Failed to like post");
    } finally {
      setLiking(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.desc,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {}
  }

  if (!post) {
    return (
      <p className="text-center mt-10 text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    );
  }

  return (
    <div
      className="
        min-h-[calc(100vh-64px)]
        bg-white dark:bg-[#0B0B10]
        text-black dark:text-zinc-100
        p-4 md:p-8
      "
    >
      <div
        className="
          max-w-4xl mx-auto
          border rounded-md overflow-hidden
          border-purple-700 dark:border-purple-400/50
          
        "
      >
        <div className="grid gap-0 items-start">

          {/* IMAGE */}
          <div>
            <img
              src={post.img}
              alt={post.title}
              onClick={() => setShowImage(true)}
              className="
                w-full cursor-zoom-in transition
                hover:opacity-95
              "
            />
          </div>

          {/* CONTENT */}
          <div className="p-6">

            {/* TITLE + ACTIONS */}
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl font-bold">
                {post.title}
              </h1>

              <div className="flex gap-2 shrink-0">

                {/* LIKE */}
                <button
                  disabled={liking}
                  onClick={handleLike}
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-full
                    border border-gray-300 dark:border-zinc-700
                    hover:bg-gray-50 dark:hover:bg-zinc-800
                    transition disabled:opacity-50
                  "
                >
                  <Heart
                    size={16}
                    className={
                      liked
                        ? "fill-purple-500 text-purple-500"
                        : "text-gray-400 dark:text-gray-300"
                    }
                  />
                  <span>{likeCount}</span>
                </button>

                {/* SHARE */}
                <button
                  onClick={handleShare}
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-full
                    border border-gray-300 dark:border-zinc-700
                    hover:bg-gray-50 dark:hover:bg-zinc-800
                    transition
                  "
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* DESC */}
            {post.desc && (
              <p className="mt-4 text-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {post.desc}
              </p>
            )}

            {/* USER */}
            <div className="mt-5">
              <a
                href={`/profile/${post.user?._id}`}
                className="inline-flex items-center gap-3 no-underline"
              >
                <img
                  src={post.user?.profilePicture || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-zinc-700"
                />
                <span className="text-gray-800 dark:text-gray-200">
                  {post.user?.username}
                </span>
              </a>
            </div>

            {/* TAGS */}
            {post.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="
                      px-3 py-1 rounded-full text-sm
                      border border-gray-300 dark:border-zinc-700
                      text-gray-600 dark:text-gray-300
                      hover:border-purple-500 hover:text-purple-500
                      transition
                    "
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RELATED */}
      <div className="mt-12">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
          {relatedPosts.map((p: any) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {showImage && (
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
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}