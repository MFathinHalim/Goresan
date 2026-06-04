"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/Post";

export default function Home() {
  const router = useRouter();

  const [q, setQ] = useState("");

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"terbaru" | "terpopuler">("terbaru");

  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);

  // ambil query dari URL (client-only, aman)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") || "");
  }, []);

  async function fetchPosts(pageNum: number, replace = false) {
    if (loadingRef.current) return;

    loadingRef.current = true;

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = q
        ? `/api/posts?page=${pageNum}&limit=12&q=${encodeURIComponent(q)}`
        : `/api/posts?page=${pageNum}&limit=12`;

      const res = await fetch(url);
      const data = await res.json();

      const result: any[] = data.posts || [];

      if (replace) {
        setPosts(result);

        const tagCount: Record<string, number> = {};
        result.forEach(post => {
          post.tags?.forEach((tag: string) => {
            if (!tag || tag.toLowerCase() === "nsfw") return;
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        });

        const sorted = Object.entries(tagCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag);

        setPopularTags(sorted);
      } else {
        setPosts(prev => {
          const existing = new Set(prev.map(p => p._id));
          const filtered = result.filter(p => !existing.has(p._id));
          return [...prev, ...filtered];
        });
      }

      setHasMore(result.length === 12);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    pageRef.current = 1;
    setPosts([]);
    setPopularTags([]);
    setHasMore(true);

    fetchPosts(1, true);
  }, [q]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (
        target.isIntersecting &&
        hasMore &&
        !loadingMore &&
        !loading &&
        !loadingRef.current
      ) {
        const next = pageRef.current + 1;
        pageRef.current = next;
        fetchPosts(next);
      }
    },
    [hasMore, loadingMore, loading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [handleObserver]);

  const sortedPosts =
    sort === "terpopuler"
      ? [...posts].sort(
          (a, b) =>
            (b.like?.users?.length || 0) -
            (a.like?.users?.length || 0)
        )
      : posts;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 text-black dark:text-zinc-100">
      {/* TAGS */}
      {popularTags.length > 0 && (
        <div className="px-6 pt-4 flex justify-center gap-2 overflow-x-auto">
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
              className="px-4 py-1.5 rounded-full text-sm border border-gray-300 dark:border-zinc-700"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* SORT */}
      <div className="px-6 pt-6 pb-4 flex">
        <div className="flex border rounded-full overflow-hidden">
          <button onClick={() => setSort("terbaru")} className="px-5 py-1.5">
            Terbaru
          </button>
          <button onClick={() => setSort("terpopuler")} className="px-5 py-1.5">
            Terpopuler
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="px-6 pb-8">
        {loading ? (
          <p className="text-center mt-10">Loading...</p>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {sortedPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            <div ref={observerRef} className="h-10 mt-4" />
          </>
        )}
      </div>
    </div>
  );
}