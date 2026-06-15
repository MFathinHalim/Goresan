"use client";

import PostCard from "@/components/Post";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart, Share2, EyeOff, Flag, X, AlertTriangle, Edit, Trash, MoreHorizontal, MoreVertical, Send, SendHorizonal, Loader } from "lucide-react";
import { useUser } from "@/context/userContext";
import { formatDistanceToNow } from "date-fns";
import PostDetailSkeleton from "./Skeletons/PostDetails";
import axios from "axios";

export default function PostDetailClient({ params }: { params: { id: string } }) {
    const { user } = useUser();
    const [post, setPost] = useState<any>(null);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    const [showImage, setShowImage] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [liking, setLiking] = useState(false);

    // STATE UI MODAL REPORT (POST)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [customReasonText, setCustomReasonText] = useState("");
    const [reporting, setReporting] = useState(false);

    // ========================================================
    // STATE BARU KHUSUS REPORT COMMENT
    // ========================================================
    const [isCommentReportModalOpen, setIsCommentReportModalOpen] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [selectedCommentReason, setSelectedCommentReason] = useState("");
    const [customCommentReasonText, setCustomCommentReasonText] = useState("");
    const [reportingComment, setReportingComment] = useState(false);

    // STATE BUAT COMMENT
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);
    const [sendingComment, setSendingComment] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [openPostMenu, setOpenPostMenu] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const handleDeletePost = async (postId: string) => {
        try {
            setDeleting(true);

            // Panggil API delete yang sudah kita buat sebelumnya
            const response = await axios.delete(`/api/posts?id=${postId}`);

            if (response.status === 200) {
                toast.success("Postingan berhasil dihapus!");

                // Redirect user ke halaman beranda atau profile setelah berhasil menghapus
                window.location.href = "/";
            }
        } catch (error: any) {
            console.error("Gagal menghapus postingan:", error);
            const errorMessage = error.response?.data?.error || "Terjadi kesalahan saat menghapus postingan.";
            toast.error(errorMessage);
        } finally {
            setDeleting(false);
        }
    };
    async function fetchComments() {
        try {
            setLoadingComments(true);
            const res = await fetch(`/api/comment/${post._id}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch {
            toast.error("Gagal memuat komentar");
        } finally {
            setLoadingComments(false);
        }
    }

    useEffect(() => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data) => {
                setRelatedPosts(data.posts.filter((p: any) => p._id !== params.id));
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

    useEffect(() => {
        if (post?._id) {
            fetchComments();
        }
    }, [post?._id]);

    const isPostNSFW = post?.tags?.some((t: string) => t.toLowerCase() === "nsfw");
    const isUserAllowedNSFW = user && user.age >= 18 && user.allowNSFW === true;
    const shouldBlur = isPostNSFW && !isUserAllowedNSFW;

    async function handleLike() {
        if (!user) {
            toast.error("Login dulu yuk!");
            return;
        }
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

    async function submitComment() {
        if (!user) {
            toast.error("Login dulu");
            return;
        }

        if (!commentText.trim()) {
            toast.error("Komentar kosong");
            return;
        }

        try {
            setSendingComment(true);
            const res = await fetch("/api/comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId: post._id,
                    userId: user._id,
                    content: commentText,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setCommentText("");
                fetchComments();
                toast.success("Komentar terkirim");
            }
        } catch {
            toast.error("Gagal mengirim");
        } finally {
            setSendingComment(false);
        }
    }

    async function deleteComment(id: string) {
        try {
            const res = await fetch(`/api/comment/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Komentar dihapus");
                fetchComments();
            }
        } catch {
            toast.error("Gagal hapus");
        }
    }

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
                    customReason: selectedReason === "other" ? customReasonText : "",
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Laporan berhasil dikirim!");
                setIsReportModalOpen(false);
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

    // ========================================================
    // FUNGSI BARU UNTUK SUBMIT REPORT KOMENTAR KE DISCORD
    // ========================================================
    async function submitCommentReport() {
        if (!selectedCommentReason) {
            toast.error("Pilih salah satu alasan dulu ya!");
            return;
        }
        if (selectedCommentReason === "other" && !customCommentReasonText.trim()) {
            toast.error("Alasan khusus tidak boleh kosong!");
            return;
        }

        setReportingComment(true);
        try {
            // Menembak endpoint khusus report comment yang baru dibuat
            const res = await fetch(`/api/comment/${selectedCommentId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reason: selectedCommentReason,
                    customReason: selectedCommentReason === "other" ? customCommentReasonText : "",
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Laporan komentar berhasil dikirim!");
                setIsCommentReportModalOpen(false);
                setSelectedCommentId(null);
                setSelectedCommentReason("");
                setCustomCommentReasonText("");
            } else {
                toast.error(data.error || "Gagal mengirim laporan komentar");
            }
        } catch {
            toast.error("Terjadi kesalahan sistem saat melaporkan komentar");
        } finally {
            setReportingComment(false);
        }
    }

    if (!post) {
        return <PostDetailSkeleton />;
    }

    return (
        <div className='min-h-[calc(100vh-64px)] bg-white dark:bg-[#0B0B10] text-black dark:text-zinc-100'>
            {/* AMBIENT BACKGROUND */}
            <div className='relative w-full' style={{ minHeight: "420px" }}>
                {!shouldBlur && (
                    <div
                        className='absolute inset-0 opacity-40 max-h-screen dark:opacity-25'
                        style={{
                            backgroundImage: `url(${post.img})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            filter: "blur(40px)",
                        }}
                    />
                )}
                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#0B0B10]' />

                <div className='relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-0'>
                    <div className='relative border rounded-md border-purple-700/50 dark:border-purple-400/30 bg-zinc-100 dark:bg-zinc-950'>
                        {/* KONTINER GAMBAR UTAMA */}
                        <div className='relative w-full flex items-center justify-center select-none'>
                            <img
                                src={post.img}
                                alt={post.title}
                                onClick={() => !shouldBlur && setShowImage(true)}
                                className={`w-full max-h-[700px] object-cover transition duration-300 ${
                                    shouldBlur ? "blur-3xl scale-105 pointer-events-none" : "cursor-zoom-in hover:opacity-95"
                                }`}
                            />

                            {shouldBlur && (
                                <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white p-4 text-center backdrop-blur-sm'>
                                    <EyeOff size={36} className='mb-2 text-zinc-200 drop-shadow' />
                                    <p className='text-sm md:text-base font-semibold bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg'>
                                        Konten ini disensor karena mengandung unsur sensitif/NSFW.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* DETAIL */}
                        <div className='p-4 md:p-6 bg-white dark:bg-zinc-900'>
                            {/* TITLE + ACTIONS */}
                            <div className='flex flex-col gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4'>
                                <div className='flex justify-between items-start gap-4 w-full'>
                                    {/* Judul Post */}
                                    <h1 className='text-2xl md:text-3xl font-bold flex-1 min-w-0 break-words'>{post.title}</h1>

                                    {/* TITIK TIGA FOR POST ACTIONS */}
                                    <div className='relative shrink-0 mt-1'>
                                        <button
                                            onClick={() => setOpenPostMenu(!openPostMenu)}
                                            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-600 dark:text-gray-300'
                                            title='Menu postingan'>
                                            <MoreVertical size={20} />
                                        </button>

                                        {openPostMenu && (
                                            <div className='absolute right-0 top-10 z-30 w-40 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden'>
                                                {/* HANYA MUNCUL JIKA PEMILIK POSTINGAN / ADMIN */}
                                                {(user?._id === post.user?._id || user?.role === "admin") && (
                                                    <button
                                                        onClick={() => {
                                                            setOpenPostMenu(false);
                                                            handleDeletePost(post._id);
                                                        }}
                                                        className='w-full px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-sm transition text-left border-b border-zinc-100 dark:border-zinc-800'>
                                                        <Trash size={14} /> Delete Post
                                                    </button>
                                                )}

                                                {/* TOMBOL REPORT PINDAH KE DALAM SINI AGAR LEBIH RAPI */}
                                                <button
                                                    onClick={() => {
                                                        setOpenPostMenu(false);
                                                        if (!user) {
                                                            toast.error("Login dulu yuk untuk melapor!");
                                                        } else {
                                                            setIsReportModalOpen(true);
                                                        }
                                                    }}
                                                    className='w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-sm transition text-left'>
                                                    <Flag size={14} /> Report Post
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* INTERACTION BUTTONS (LIKE & SHARE) */}
                                <div className='flex items-center gap-2 flex-wrap'>
                                    {user ?
                                        <button
                                            disabled={liking}
                                            onClick={handleLike}
                                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition disabled:opacity-50 text-sm'>
                                            <Heart size={14} className={liked ? "fill-purple-500 text-purple-500" : "text-gray-400 dark:text-gray-300"} />
                                            <span>{likeCount}</span>
                                        </button>
                                    :   <span className='flex items-center gap-1.5 text-sm text-gray-400 border border-gray-200 dark:border-zinc-800 px-3 py-1.5 rounded-full'>
                                            <Heart size={14} />
                                            <span>{likeCount}</span>
                                        </span>
                                    }

                                    <button
                                        onClick={handleShare}
                                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-sm'>
                                        <Share2 size={14} />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>

                            <p className='md:text-base mt-2 text-zinc-400 dark:text-zinc-500'>{formatDistanceToNow(new Date(post.time), { addSuffix: true })}</p>

                            {post.desc && <p className='mt-4 text-base md:text-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300'>{post.desc}</p>}

                            {/* USER */}
                            <div className='mt-5'>
                                <a href={`/profile/${post.user?._id}`} className='inline-flex items-center gap-3 no-underline'>
                                    <img
                                        src={post.user?.profilePicture || "/default-avatar.png"}
                                        alt={post.user?.username}
                                        className='w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-zinc-700'
                                    />
                                    <span className='text-gray-800 font-bold text-xl dark:text-gray-200'>{post.user?.username}</span>
                                </a>
                            </div>

                            {/* TAGS */}
                            {post.tags?.length > 0 && (
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {post.tags.map((tag: string) => {
                                        const isAI = tag.toLowerCase() === "ai";
                                        const targetHref = isAI ? "/artificial" : `/search?q=${encodeURIComponent(tag)}`;

                                        return (
                                            <a
                                                key={tag}
                                                href={targetHref}
                                                className='px-3 py-1 rounded-full text-xs md:text-sm border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-500 transition no-underline'>
                                                #{tag}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}

                            <h2 className='text-xl my-4'>Komentar ({comments.length})</h2>

                            {/* Input Komentar */}
                            <div className='flex gap-3'>
                                <div className='flex-1'>
                                    <div className='flex gap-3'>
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder='Tulis komentar...'
                                            className='w-full h-16 p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent resize-none'
                                        />
                                        <div className='flex justify-end'>
                                            <button
                                                disabled={sendingComment}
                                                onClick={submitComment}
                                                className='p-5 h-16 w-16 text-center rounded-full bg-purple-500 text-white hover:bg-purple-600'>
                                                {sendingComment ?
                                                    <Loader />
                                                :   <SendHorizonal />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* List Komentar */}
                            <div className='flex flex-col gap-8 overflow-visible mt-8'>
                                {loadingComments ?
                                    <p className='text-zinc-500'>Loading comments...</p>
                                :   comments.map((comment) => (
                                        <div key={comment._id} className='flex gap-3 '>
                                            <a href={`/profile/${post.user?._id}`}>
                                                <img src={comment.user?.profilePicture || "/default-avatar.png"} className='w-12 h-12 rounded-full object-cover' />
                                            </a>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex justify-between items-start'>
                                                    <div className='flex items-center gap-2'>
                                                        <a href={`/profile/${post.user?._id}`} className='font-semibold'>
                                                            {comment.user.username}
                                                        </a>
                                                        <span className='text-xs text-zinc-500 whitespace-nowrap'>
                                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>

                                                    <div className='relative shrink-0'>
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenu(openMenu === comment._id ? null : comment._id);
                                                            }}
                                                            className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition'>
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {openMenu === comment._id && (
                                                            <div className='absolute right-0 top-8 z-30 w-36 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden'>
                                                                {/* TOMBOL ACTION BARU: REPORT COMMENT */}
                                                                <button
                                                                    onClick={() => {
                                                                        setOpenMenu(null);
                                                                        if (!user) {
                                                                            toast.error("Login dulu yuk untuk melaporkan komentar!");
                                                                            return;
                                                                        }
                                                                        setSelectedCommentId(comment._id);
                                                                        setIsCommentReportModalOpen(true);
                                                                    }}
                                                                    className='w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-sm'>
                                                                    <Flag size={14} /> Report
                                                                </button>
                                                                {/* HANYA MUNCUL JIKA PEMILIK COMMENT / ADMIN */}
                                                                {(user?._id === comment.user?._id || user?.role === "admin") && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenMenu(null);
                                                                            deleteComment(comment._id);
                                                                        }}
                                                                        className='w-full px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-sm border-b border-zinc-100 dark:border-zinc-800'>
                                                                        <Trash size={14} /> Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className='whitespace-pre-wrap break-words mt-1 text-gray-800 dark:text-gray-200'>{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RELATED POSTS */}
            <div className='mx-auto px-4 md:px-8 mt-8 pb-10'>
                {relatedPosts.length > 0 && (
                    <div className='columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3'>
                        {relatedPosts.map((p: any) => (
                            <PostCard key={p._id} post={p} />
                        ))}
                    </div>
                )}
            </div>

            {/* IMAGE MODAL */}
            {showImage && !shouldBlur && (
                <div className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6' onClick={() => setShowImage(false)}>
                    <button className='absolute top-5 right-6 text-white text-3xl' onClick={() => setShowImage(false)}>
                        ×
                    </button>
                    <img src={post.img} alt={post.title} className='max-w-[95vw] max-h-[95vh] object-contain' onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* ==================== MODAL REPORT POST UI (BAWAAN KAMU) ==================== */}
            {isReportModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'>
                    <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => !reporting && setIsReportModalOpen(false)} />
                    <div className='relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col gap-4 z-10'>
                        <div className='flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3'>
                            <div className='flex items-center gap-2 text-red-500 font-bold text-lg'>
                                <AlertTriangle size={20} />
                                <span>Laporkan Postingan</span>
                            </div>
                            <button
                                disabled={reporting}
                                onClick={() => setIsReportModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800'>
                                <X size={18} />
                            </button>
                        </div>
                        <div className='flex flex-col gap-2.5 my-1'>
                            {[
                                { id: "nsfw_unmarked", label: "Konten mengandung NSFW tapi belum ditag" },
                                { id: "false_nsfw", label: "Gambar ini AMAN (Bukan NSFW / AI Salah Deteksi)" },
                                { id: "false_ai", label: "Gambar ini buatan MANUSIA (AI Salah Deteksi)" },
                                { id: "spam", label: "Spam / Mengganggu / Duplikat" },
                                { id: "other", label: "Alasan lainnya" },
                            ].map((item) => (
                                <label
                                    key={item.id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition ${selectedReason === item.id ? "border-red-500 bg-red-50/50 dark:bg-red-950/10 text-red-600 dark:text-red-400" : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300"}`}>
                                    <input
                                        type='radio'
                                        name='reportReason'
                                        value={item.id}
                                        checked={selectedReason === item.id}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className='accent-red-500 w-4 h-4'
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                        {selectedReason === "other" && (
                            <textarea
                                disabled={reporting}
                                placeholder='Tuliskan detail alasan laporan kamu secara spesifik...'
                                value={customReasonText}
                                onChange={(e) => setCustomReasonText(e.target.value)}
                                maxLength={200}
                                className='w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-black dark:text-white min-h-[80px] resize-none'
                            />
                        )}
                        <div className='flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800'>
                            <button
                                type='button'
                                disabled={reporting}
                                onClick={() => setIsReportModalOpen(false)}
                                className='px-4 py-2 text-sm font-medium rounded-xl text-gray-500 dark:text-zinc-400'>
                                Batal
                            </button>
                            <button
                                type='button'
                                disabled={reporting || !selectedReason}
                                onClick={submitReport}
                                className='px-5 py-2 text-sm font-semibold rounded-xl bg-red-500 text-white flex items-center gap-1.5'>
                                {reporting ?
                                    <>
                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                        <span>Mengirim...</span>
                                    </>
                                :   <span>Kirim Laporan</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== TAMBAHAN BARU: CUSTOM MODAL REPORT COMMENT UI ==================== */}
            {isCommentReportModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'>
                    {/* Backdrop Blur Gelap */}
                    <div
                        className='absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity'
                        onClick={() => !reportingComment && setIsCommentReportModalOpen(false)}
                    />

                    {/* Isi Kotak Modal */}
                    <div className='relative w-full max-w-md transform rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 text-left shadow-2xl transition-all scale-100 flex flex-col gap-4 z-10'>
                        {/* Header Modal */}
                        <div className='flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3'>
                            <div className='flex items-center gap-2 text-orange-500 dark:text-orange-400 font-bold text-lg'>
                                <AlertTriangle size={20} />
                                <span>Laporkan Komentar</span>
                            </div>
                            <button
                                disabled={reportingComment}
                                onClick={() => setIsCommentReportModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800'>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Pilihan Opsi Report Komentar */}
                        <div className='flex flex-col gap-2.5 my-1'>
                            {[
                                { id: "harassment", label: "Pelecehan / Perundungan / Ujaran Kebencian" },
                                { id: "spam_comment", label: "Spam / Link Tidak Aman / Promosi Palsu" },
                                { id: "inappropriate", label: "Komentar Tidak Pantas / Mengandung Seksual" },
                                { id: "other", label: "Alasan lainnya" },
                            ].map((item) => (
                                <label
                                    key={item.id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition ${
                                        selectedCommentReason === item.id ?
                                            "border-orange-500 bg-orange-50/50 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400"
                                        :   "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300"
                                    }`}>
                                    <input
                                        type='radio'
                                        name='commentReportReason'
                                        value={item.id}
                                        checked={selectedCommentReason === item.id}
                                        onChange={(e) => setSelectedCommentReason(e.target.value)}
                                        className='accent-orange-500 w-4 h-4'
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>

                        {selectedCommentReason === "other" && (
                            <textarea
                                disabled={reportingComment}
                                placeholder='Tuliskan alasan spesifik mengapa komentar ini melanggar peraturan...'
                                value={customCommentReasonText}
                                onChange={(e) => setCustomCommentReasonText(e.target.value)}
                                maxLength={200}
                                className='w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-black dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[80px] resize-none transition'
                            />
                        )}

                        {/* Footer / Tombol Aksi */}
                        <div className='flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800'>
                            <button
                                type='button'
                                disabled={reportingComment}
                                onClick={() => setIsCommentReportModalOpen(false)}
                                className='px-4 py-2 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition'>
                                Batal
                            </button>
                            <button
                                type='button'
                                disabled={reportingComment || !selectedCommentReason}
                                onClick={submitCommentReport}
                                className='px-5 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-md shadow-orange-500/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5'>
                                {reportingComment ?
                                    <>
                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                        <span>Mengirim...</span>
                                    </>
                                :   <span>Kirim Laporan</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
