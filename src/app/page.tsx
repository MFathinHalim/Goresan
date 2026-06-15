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

    // Ambil query pencarian dari URL secara aman
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setQ(params.get("q") || "");
    }, []);

    async function fetchPosts(pageNum: number, replace = false) {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const url = q ? `/api/posts?page=${pageNum}&limit=12&q=${encodeURIComponent(q)}` : `/api/posts?page=${pageNum}&limit=12`;

            const res = await fetch(url);
            const data = await res.json();
            const result: any[] = data.posts || [];

            // Jika sejak awal API mengembalikan array kosong, matikan infinite scroll
            if (result.length === 0) {
                setHasMore(false);
                return;
            }

            if (replace) {
                setPosts(result);

                // Hitung tag populer
                const tagCount: Record<string, number> = {};
                result.forEach((post) => {
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
                setHasMore(result.length === 12);
            } else {
                // PROTEKSI EXTRA: Gabungkan data baru sambil cek duplikasi akibat bug backend
                setPosts((prev) => {
                    const existingIds = new Set(prev.map((p) => p._id));
                    const uniqueNewPosts = result.filter((p) => !existingIds.has(p._id));

                    // JIKA API mengirim data, tapi setelah difilter TIDAK ADA yang baru (artinya data duplikat)
                    // Paksa hasMore = false untuk memutus loop tanpa henti.
                    if (uniqueNewPosts.length === 0) {
                        setHasMore(false);
                        return prev;
                    }

                    // Jika jumlah kiriman baru yang unik lebih sedikit dari data yang datang, data juga sudah habis
                    if (uniqueNewPosts.length < result.length) {
                        setHasMore(false);
                    } else {
                        setHasMore(result.length === 12);
                    }

                    return [...prev, ...uniqueNewPosts];
                });
            }
        } catch (error) {
            console.error("Gagal memuat kiriman:", error);
            setHasMore(false); // Amankan jika ada crash
        } finally {
            setLoading(false);
            setLoadingMore(false);
            loadingRef.current = false;
        }
    }

    // Trigger ulang jika ada perubahan parameter pencarian
    useEffect(() => {
        pageRef.current = 1;
        setHasMore(true);
        fetchPosts(1, true);
    }, [q]);

    // Handler Observer untuk Infinite Scroll
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];

            // KUNCI UTAMA: Jangan tembak API jika hasMore sudah false atau sedang memuat data
            if (!hasMore || loading || loadingMore || loadingRef.current) return;

            if (target.isIntersecting) {
                const next = pageRef.current + 1;
                pageRef.current = next;
                fetchPosts(next);
            }
        },
        [hasMore, loadingMore, loading],
    );

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(handleObserver, {
            threshold: 0.01,
            rootMargin: "200px", // Deteksi sebelum user benar-benar menyentuh dasar halaman
        });

        if (observerRef.current) observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, [handleObserver, hasMore]);

    // Sorting posts secara client-side
    const sortedPosts = sort === "terpopuler" ? [...posts].sort((a, b) => (b.like?.users?.length || 0) - (a.like?.users?.length || 0)) : posts;

    return (
        <div className='min-h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 text-black dark:text-zinc-100'>
            {/* POPULAR TAGS */}
            {popularTags.length > 0 && (
                <div className='px-6 pt-4 flex justify-start gap-2 overflow-x-auto scrollbar-none' style={{ scrollbarWidth: "none" }}>
                    {popularTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => {
                                if (tag.toLowerCase() === "ai") {
                                    router.push("/artificial");
                                } else {
                                    router.push(`/search?q=${encodeURIComponent(tag)}`);
                                }
                            }}
                            className='px-4 py-1.5 rounded-full text-sm border border-gray-300 dark:border-zinc-700 whitespace-nowrap shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition'>
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* TAB SORTING */}
            <div className='px-6 pt-6 pb-4 flex'>
                <div className='flex border border-zinc-300 dark:border-zinc-700 rounded-full overflow-hidden bg-white dark:bg-zinc-900'>
                    <button
                        onClick={() => setSort("terbaru")}
                        className={`px-5 py-1.5 text-sm transition ${
                            sort === "terbaru" ?
                                "bg-purple-700 dark:bg-purple-400 text-white"
                            :   "text-gray-600 dark:text-zinc-300 hover:text-purple-700 dark:hover:text-purple-300"
                        }`}>
                        Terbaru
                    </button>

                    <button
                        onClick={() => setSort("terpopuler")}
                        className={`px-5 py-1.5 text-sm transition ${
                            sort === "terpopuler" ?
                                "bg-purple-700 dark:bg-purple-400 text-white"
                            :   "text-gray-600 dark:text-zinc-300 hover:text-purple-700 dark:hover:text-purple-300"
                        }`}>
                        Terpopuler
                    </button>
                </div>
            </div>

            {/* GRID UTAMA */}
            <div className='px-6 pb-8'>
                {loading && posts.length === 0 ?
                    <div className='flex justify-center items-center py-20 text-gray-400'>Memuat kiriman...</div>
                :   <>
                        {/* Pinterest Masonry Layout Stabil Menggunakan Modulo 4 Kolom */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start'>
                            {/* Kolom 1 */}
                            <div className='flex flex-col gap-4'>
                                {sortedPosts
                                    .filter((_, idx) => idx % 4 === 0)
                                    .map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                            </div>
                            {/* Kolom 2 */}
                            <div className='flex flex-col gap-4'>
                                {sortedPosts
                                    .filter((_, idx) => idx % 4 === 1)
                                    .map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                            </div>
                            {/* Kolom 3 */}
                            <div className='flex flex-col gap-4'>
                                {sortedPosts
                                    .filter((_, idx) => idx % 4 === 2)
                                    .map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                            </div>
                            {/* Kolom 4 */}
                            <div className='flex flex-col gap-4'>
                                {sortedPosts
                                    .filter((_, idx) => idx % 4 === 3)
                                    .map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                            </div>
                        </div>

                        {/* TRIGGER INFINITE SCROLL / STATUS AKHIR */}
                        {hasMore ?
                            <div ref={observerRef} className='w-full flex justify-center py-8 mt-4'>
                                {loadingMore && <p className='text-sm text-zinc-400 animate-pulse'>Mencari kiriman menarik lainnya...</p>}
                            </div>
                        : posts.length > 0 ?
                            <div className='w-full flex justify-center py-10 mt-6 text-sm text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-900'>
                                Kamu telah mencapai ujung halaman
                            </div>
                        :   null}
                    </>
                }
            </div>
        </div>
    );
}
