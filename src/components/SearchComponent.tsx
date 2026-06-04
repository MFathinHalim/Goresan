"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PostCard from "@/components/Post";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";

  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadingRef = useRef(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const tags = q
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .slice(0, 6);

  function goSearch(value: string) {
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startX.current = e.pageX - (sliderRef.current?.offsetLeft || 0);
    scrollLeft.current = sliderRef.current?.scrollLeft || 0;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();

    const x = e.pageX - sliderRef.current.offsetLeft;
    sliderRef.current.scrollLeft =
      scrollLeft.current - (x - startX.current);
  }

  function onMouseUp() {
    isDragging.current = false;
  }

  const fetchSearch = useCallback(
    async (pageNum: number, replace = false) => {
      if (!q || loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&page=${pageNum}&limit=2`
        );

        const data = await res.json();

        const newPosts = data.posts || [];
        const newUsers = data.users || [];

        if (replace || pageNum === 1) {
          setPosts(newPosts);
          setUsers(newUsers);
        } else {
          setPosts((prev) => {
            const existing = new Set(prev.map((p) => p._id));
            const filtered = newPosts.filter((p: any) => !existing.has(p._id));
            return [...prev, ...filtered];
          });

          setUsers(newUsers);
        }

        setHasMore(data.hasMore);
        setInitialLoaded(true);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [q]
  );

  useEffect(() => {
    setPosts([]);
    setUsers([]);
    setPage(1);
    setHasMore(true);
    setInitialLoaded(false);

    if (!q) return;

    fetchSearch(1, true);
  }, [q, fetchSearch]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (
        target.isIntersecting &&
        hasMore &&
        !loadingRef.current &&
        initialLoaded
      ) {
        const next = page + 1;
        setPage(next);
        fetchSearch(next);
      }
    },
    [hasMore, page, initialLoaded, fetchSearch]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div
      className="
        min-h-screen
        px-6 py-8
        bg-white dark:bg-zinc-950
        text-black dark:text-zinc-100
      "
    >
      {!q ? (
        <p className="text-center text-gray-400">
          Ketik sesuatu di search bar...
        </p>
      ) : loading && page === 1 ? (
        <p className="text-center text-gray-400">Mencari...</p>
      ) : (
        <>
          {/* TAGS */}
          {tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => goSearch(tag)}
                  className="
                    px-4 py-1.5 rounded-full text-sm border transition
                    border-gray-300 text-gray-600 hover:border-purple-700 hover:text-purple-700
                    dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-purple-400 dark:hover:text-purple-400
                  "
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* USERS */}
          {users.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-3">Artist</p>

              <div
                ref={sliderRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                className="flex gap-6 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none scrollbar-hide"
              >
                {users.map((user: any) => (
                  <a
                    key={user._id}
                    href={`/profile/${user._id}`}
                    className="flex flex-col items-center gap-2 shrink-0 text-black dark:text-zinc-100"
                  >
                    <img
                      src={user.profilePicture || "/default-avatar.png"}
                      className="w-[120px] h-[120px] rounded-full object-cover border border-black/20 dark:border-zinc-700"
                    />
                    <span className="text-xs text-center w-16 truncate">
                      {user.username}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* POSTS */}
          {posts.length > 0 ? (
            <div>
              <p className="text-sm text-gray-400 mb-3">
                {posts.length} karya ditemukan untuk &quot;{q}&quot;
              </p>

              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
                {posts.map((post: any) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              <div ref={observerRef} className="h-10 mt-4" />

              {loading && page > 1 && (
                <p className="text-center text-gray-400 text-sm mt-2">
                  Memuat lebih banyak...
                </p>
              )}

              {!hasMore && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Semua hasil sudah ditampilkan
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-20">
              Tidak ada hasil untuk &quot;{q}&quot;
            </p>
          )}
        </>
      )}

      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}