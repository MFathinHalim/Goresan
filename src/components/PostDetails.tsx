"use client";

import PostCard from "@/components/Post";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart, Share2, EyeOff, Flag, X, AlertTriangle } from "lucide-react"; // Tambahkan X dan AlertTriangle
import { useUser } from "@/context/userContext";

export default function PostDetailClient({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [showImage, setShowImage] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  
  // STATE BARU UNTUK UI MODAL REPORT
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReasonText, setCustomReasonText] = useState("");
  const [reporting, setReporting] = useState(false);

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

  // FUNGSI SUBMIT REPORT DARI MODAL BARU
  async function submitReport() {
    if (!selectedReason) {
      toast.error("Pilih salah satu alasan dulu ya!");
      return;
    }
    if (selectedReason === "other" && !customReasonText.trim()) {
      toast.error("Alasan khusus tidak boleh kosong!");
      return;
    }

    setReporting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reason: selectedReason, 
          customReason: selectedReason === "other" ? customReasonText : "" 
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Laporan berhasil dikirim!");
        setIsReportModalOpen(false); // Tutup modal jika sukses
        setSelectedReason("");
        setCustomReasonText("");
      } else {
        toast.error(data.error || "Gagal mengirim laporan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat mengirim laporan");
    } finally {
      setReporting(false);
    }
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
            className="absolute inset-0 scale-110 opacity-40 dark:opacity-25"
            style={{
              backgroundImage: `url(${post.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#0B0B10]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-0">
          <div className="relative border rounded-md overflow-hidden border-purple-700/50 dark:border-purple-400/30 bg-zinc-100 dark:bg-zinc-950">

            {/* KONTINER GAMBAR UTAMA */}
            <div className="relative w-full overflow-hidden flex items-center justify-center select-none">
              <img
                src={post.img}
                alt={post.title}
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

                  {/* TOMBOL REPORT NYALA MODAL */}
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Login dulu yuk untuk melapor!");
                      } else {
                        setIsReportModalOpen(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition text-sm shadow-sm"
                    title="Laporkan postingan ini"
                  >
                    <Flag size={14} />
                    <span className="hidden sm:inline">Report</span>
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
            className="absolute top-5 Right-6 text-white text-3xl"
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

      {/* ==================== CUSTOM MODAL REPORT UI MODERN ==================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop Blur Gelap */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !reporting && setIsReportModalOpen(false)}
          />

          {/* Isi Kotak Modal */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 text-left shadow-2xl transition-all scale-100 flex flex-col gap-4">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
                <AlertTriangle size={20} />
                <span>Laporkan Postingan</span>
              </div>
              <button 
                disabled={reporting}
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pilihan Opsi Report Radio Button Minimalis */}
            <div className="flex flex-col gap-2.5 my-1">
              {[
                { id: "nsfw_unmarked", label: "Konten mengandung NSFW tapi belum ditag" },
                { id: "false_nsfw", label: "Gambar ini AMAN (Bukan NSFW / AI Salah Deteksi)" },
                { id: "false_ai", label: "Gambar ini buatan MANUSIA (AI Salah Deteksi)" },
                { id: "spam", label: "Spam / Mengganggu / Duplikat" },
                { id: "other", label: "Alasan lainnya" }
              ].map((item) => (
                <label 
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition ${
                    selectedReason === item.id 
                      ? "border-red-500 bg-red-50/50 dark:bg-red-950/10 text-red-600 dark:text-red-400" 
                      : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={item.id}
                    checked={selectedReason === item.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-red-500 w-4 h-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Textarea Tambahan jika memilih 'other' */}
            {selectedReason === "other" && (
              <textarea
                disabled={reporting}
                placeholder="Tuliskan detail alasan laporan kamu secara spesifik..."
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                maxLength={200}
                className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[80px] resize-none transition"
              />
            )}

            {/* Footer / Tombol Aksi */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                disabled={reporting}
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={reporting || !selectedReason}
                onClick={submitReport}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-md shadow-red-500/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {reporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Laporan</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}