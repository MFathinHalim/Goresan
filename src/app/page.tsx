"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logged out");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <Toaster />

      <nav>
        <span>Goresan</span>
        <a href="/upload">Upload</a>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>Belum ada karya. <a href="/upload">Upload yang pertama!</a></p>
      ) : (
        <div>
          {posts.map((post: any) => (
            <div key={post._id}>
              <a href={`/post/${post.id}`}>
                <img src={post.img} alt={post.title} width={300} />
                <p>{post.title}</p>
                <p>{post.user?.username}</p>
                <p>{post.like?.users?.length} likes</p>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}