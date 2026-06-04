"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/Post";
import { Edit3, Settings, X, Mail } from "lucide-react";
import { useUser } from "@/context/userContext";

export default function ProfileDetails({ params }: { params: { id: string } }) {
  const { user: currentUser } = useUser();

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");

  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [settingsAge, setSettingsAge] = useState("");
  const [settingsNSFW, setSettingsNSFW] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        const data = await res.json();

        setUser(data.user);
        setPosts(data.posts || []);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [params.id]);

  useEffect(() => {
    if (!currentUser || !user) return;
    if (currentUser._id !== user._id) return;

    fetch("/api/users/liked")
      .then(res => res.json())
      .then(data => setLikedPosts(data.posts || []))
      .catch(() => {});
  }, [currentUser, user]);

  async function handleEditSubmit() {
    setEditLoading(true);

    const formData = new FormData();
    formData.append("username", editUsername);
    formData.append("description", editDesc);
    if (editFile) formData.append("profilePicture", editFile);

    const res = await fetch("/api/users/profile", {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setUser((prev: any) => ({ ...prev, ...data.user }));
      setShowEdit(false);
    }

    setEditLoading(false);
  }

  async function handleSettingsSubmit() {
    setSettingsLoading(true);

    const res = await fetch("/api/users/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: settingsAge,
        allowNSFW: settingsNSFW,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setShowSettings(false);
    }

    setSettingsLoading(false);
  }

  function maskEmail(email: string) {
    if (!email?.includes("@")) return email;
    const [name, domain] = email.split("@");
    return `${name.slice(0, 2)}${"*".repeat(Math.max(4, name.length - 2))}@${domain}`;
  }

  if (loading)
    return <div className="flex justify-center items-center h-[50vh] text-gray-500 dark:text-gray-400">Loading...</div>;

  if (!user)
    return <div className="flex justify-center items-center h-[50vh] text-gray-500 dark:text-gray-400">User tidak ditemukan</div>;

  const isOwner = currentUser?._id === user._id;

  const totalLikes = posts.reduce(
    (t, p: any) => t + (p.like?.users?.length || 0),
    0
  );

  const displayedPosts = activeTab === "posts" ? posts : likedPosts;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors"
    >

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-purple-700 dark:text-purple-400">Edit Profile</h2>
              <button onClick={() => setShowEdit(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="file"
                className="text-sm"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              />

              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-purple-500 dark:focus:border-purple-400 outline-none"
                placeholder="username"
              />

              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-purple-500 dark:focus:border-purple-400 outline-none"
                placeholder="deskripsi"
              />

              <button
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="w-full py-2 rounded-full bg-purple-700 dark:bg-purple-500 text-white hover:opacity-90"
              >
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-purple-700 dark:text-purple-400">Settings</h2>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <input
              type="number"
              value={settingsAge}
              onChange={(e) => setSettingsAge(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent"
              placeholder="umur"
            />

            <label className="flex items-center justify-between mb-4">
              <span>NSFW</span>
              <input
                type="checkbox"
                checked={settingsNSFW}
                onChange={(e) => setSettingsNSFW(e.target.checked)}
                disabled={Number(settingsAge) < 18}
              />
            </label>

            <button
              onClick={handleSettingsSubmit}
              disabled={settingsLoading}
              className="w-full py-2 rounded-full bg-purple-700 dark:bg-purple-500 text-white"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
<div className="flex flex-col sm:flex-row gap-6 lg:gap-10 px-6 py-8 justify-center items-center sm:items-start">
  <img
    src={user.profilePicture || "/default-avatar.png"}
    alt={user.username}
    className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
  />

  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
    <div className="flex items-center gap-3">
      <h1 className="text-2xl sm:text-3xl">{user.username}</h1>
      {isOwner && (
        <>
          <button onClick={() => { setEditUsername(user.username || ""); setEditDesc(user.description || ""); setShowEdit(true); }} className="text-purple-700 dark:text-purple-400">
            <Edit3 size={18} />
          </button>
          <button onClick={() => { setSettingsAge(currentUser?.age?.toString() || ""); setSettingsNSFW(currentUser?.allowNSFW || false); setShowSettings(true); }} className="text-purple-700 dark:text-purple-400">
            <Settings size={18} />
          </button>
        </>
      )}
    </div>

    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
      <Mail size={14} />
      <span className="truncate max-w-[200px]">{isOwner ? user.email : maskEmail(user.email)}</span>
    </div>

    {user.description && (
      <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm max-w-screen lg:w-[30vw]">
        {user.description}
      </p>
    )}

    <div className="flex gap-6 mt-3 text-purple-700 dark:text-purple-400 text-sm">
      <div>{posts.length} Posts</div>
      <div>{totalLikes} Likes</div>
    </div>
  </div>
</div>
      {/* TABS */}
      {isOwner && (
        <div className="flex justify-center gap-8 border-b border-zinc-200 dark:border-zinc-800 mx-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 ${
              activeTab === "posts"
                ? "border-b-2 border-purple-700 dark:border-purple-400 text-purple-700 dark:text-purple-400"
                : "text-gray-400"
            }`}
          >
            Posts
          </button>

          <button
            onClick={() => setActiveTab("liked")}
            className={`pb-3 ${
              activeTab === "liked"
                ? "border-b-2 border-purple-700 dark:border-purple-400 text-purple-700 dark:text-purple-400"
                : "text-gray-400"
            }`}
          >
            Liked
          </button>
        </div>
      )}

      {/* POSTS */}
      <div className="px-4 py-6">
        {displayedPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            Kosong
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
            {displayedPosts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}