// src/app/upload/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit() {
    if (!file || !title) return alert("Title dan gambar wajib diisi");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("tags", tags);
    formData.append("file", file);

    const res = await fetch("/api/posts", { method: "POST", body: formData });
    if (res.ok) router.push("/");
    else alert("Gagal upload");
  }

  return (
    <div>
      <h1>Upload Karya</h1>
      <input placeholder="Judul" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Deskripsi" value={desc} onChange={e => setDesc(e.target.value)} />
      <input placeholder="Tags (pisah koma)" value={tags} onChange={e => setTags(e.target.value)} />
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleSubmit}>Upload</button>
    </div>
  );
}