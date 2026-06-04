"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

export default function Upload() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  function handleSelectedFile(selected: File) {
    setFile(selected);

    const url = URL.createObjectURL(selected);
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      setImgSize({ width: img.width, height: img.height });
    };
    img.src = url;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    handleSelectedFile(selected);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);

    const selected = e.dataTransfer.files?.[0];
    if (!selected) return;
    handleSelectedFile(selected);
  }

  async function handleSubmit() {
    if (!file || !title.trim()) {
      toast.error("Title dan gambar wajib diisi");
      return;
    }

    try {
      setUploading(true);
      setProgress(20);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("desc", desc);
      formData.append("tags", tags);
      formData.append("file", file);

      setProgress(60);

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      setProgress(100);

      if (res.ok) {
        toast.success("Upload berhasil");
        setTimeout(() => router.push("/"), 500);
      } else {
        toast.error("Gagal upload");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="
        min-h-[calc(100vh-66px)]
        grid place-items-center
        p-4 md:p-8
        bg-white dark:bg-[#0B0B10]
        text-black dark:text-white
      "
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`
              relative border rounded-xl overflow-hidden cursor-pointer group transition shadow-sm
              flex items-center justify-center
              ${
                dragging
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                  : "border-gray-300 dark:border-zinc-700"
              }
            `}
            style={{
              maxWidth: "min(90vw, 500px)",
              maxHeight: "70vh",
            }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {preview ? (
              <>
                <img
                  src={preview}
                  className="block max-w-[90vw] lg:max-w-[500px] max-h-[70vh] object-contain"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100">
                  <ImagePlus size={48} />
                  <span className="mt-2 text-lg">Ganti Gambar</span>
                </div>
              </>
            ) : (
              <div className="w-[90vw] md:max-w-[80vw] lg:max-w-[550px] h-[60vw] max-h-[380px] min-h-[260px] flex flex-col items-center justify-center text-gray-500">
                <UploadCloud size={64} />
                <span className="mt-3 text-lg">Upload Gambar</span>
                <span className="text-sm opacity-60">atau drag & drop</span>
              </div>
            )}
          </label>

          {file && (
            <div className="mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
              <p>{file.name}</p>
              <p>{imgSize.width} × {imgSize.height}</p>
              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="w-[90vw] sm:max-w-[500px] lg:max-w-[550px] flex flex-col gap-4">

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              border rounded-lg px-4 py-3 text-base outline-none
              bg-white dark:bg-zinc-900
              border-gray-300 dark:border-zinc-700
              focus:border-purple-500
            "
          />

          <textarea
            placeholder="Deskripsi"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="
              border rounded-lg px-4 py-3 h-40 md:h-48 resize-none text-base outline-none
              bg-white dark:bg-zinc-900
              border-gray-300 dark:border-zinc-700
              focus:border-purple-500
            "
          />

          <input
            placeholder="Tags (Pisahkan dengan koma)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="
              border rounded-lg px-4 py-3 text-base outline-none
              bg-white dark:bg-zinc-900
              border-gray-300 dark:border-zinc-700
              focus:border-purple-500
            "
          />

          {/* PROGRESS */}
          {uploading && (
            <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 dark:bg-purple-300 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            disabled={!title.trim() || !file || uploading}
            onClick={handleSubmit}
            className="
              w-full py-3 rounded-full border transition
              border-gray-300 dark:border-zinc-700
              hover:bg-purple-50 dark:hover:bg-purple-500/10
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}