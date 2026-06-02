"use client";
import { useEffect, useState } from "react";

export default function PostDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then(res => res.json())
      .then(data => setPost(data.post));
  }, []);

  async function handleLike() {
    await fetch(`/api/posts/${params.id}/like`, { method: "POST" });
  }

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <img src={post.img} alt={post.title} width={600} />
      <h1>{post.title}</h1>
      <p>{post.desc}</p>
      <p>oleh: <a href={`/profile/${post.user?._id}`}>{post.user?.username}</a></p>
      <p>Tags: {post.tags?.join(", ")}</p>
      <p>Likes: {post.like?.users?.length}</p>
      <button onClick={handleLike}>Like</button>
    </div>
  );
}