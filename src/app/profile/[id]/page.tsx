"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileDetails({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setPosts(data.posts || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User tidak ditemukan</p>;

  return (
    <div>
      <Link href="/">← Kembali</Link>

      <h1>{user.username}</h1>
      <p>{user.email}</p>

      <h2>Karya</h2>
      {posts.length === 0 ? (
        <p>Belum ada karya.</p>
      ) : (
        <div>
          {posts.map((post: any) => (
            <div key={post._id}>
              <a href={`/post/${post.id}`}>
                <img src={post.img} alt={post.title} width={300} />
                <p>{post.title}</p>
                <p>{post.like?.users?.length} likes</p>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}