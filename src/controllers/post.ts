import { type Model, type Document } from "mongoose";
import mongoose from "mongoose";
import Post from "../models/postModel";
import { connect } from "../dbConfig/dbConfig";

class Posts {
    static instance: Posts;
    #posts;
    #notFound;

    constructor() {
        this.#posts = Post;
        this.#notFound = {
            id: "not-found",
            title: "data not found",
            img: "",
            desc: "",
            tags: [],
            time: "undefined",
            user: null,
            like: { users: [] },
        };
    }

    static getInstance(): Posts {
        if (!Posts.instance) Posts.instance = new Posts();
        return Posts.instance;
    }

    // GET semua post (feed) atau detail satu post
    async getData(id?: string, page: number = 1, limit: number = 12, userId?: string, search?: string) {
        await connect();

        // Detail satu post
        if (id && !userId) {
            try {
                const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

                const post = await this.#posts
                    .findOne({ $or: [{ _id: objectId }, { id: id }] })
                    .populate("user", "-password")
                    .exec();

                return { post: post || null };
            } catch (error) {
                console.error("Error fetching post:", error);
                return { post: null };
            }
        }

        // Post milik satu user (untuk halaman profil)
        if (userId) {
            try {
                const skip = (page - 1) * limit;
                const posts = await this.#posts.find({ user: userId }).populate("user", "-password").sort({ $natural: -1 }).skip(skip).limit(limit).exec();

                return { posts };
            } catch (error) {
                console.error("Error fetching user posts:", error);
                return { posts: [] };
            }
        }

        // Feed utama
        try {
            const skip = (page - 1) * limit;
            const query =
                search?.trim() ?
                    {
                        $or: [{ title: { $regex: search, $options: "i" } }, { tags: { $regex: search, $options: "i" } }],
                    }
                :   {};

            const posts = await this.#posts.find(query).populate("user", "-password").sort({ $natural: -1 }).skip(skip).limit(limit).exec();

            return { posts };
        } catch (error) {
            console.error("Error fetching feed:", error);
            return { posts: [] };
        }
    }

    // Upload post baru
    async posting(title: string, desc: string, imgUrl: string, tags: string[], user: any) {
        if (!title?.trim() || !imgUrl?.trim()) return this.#notFound;

        const time = new Date().toLocaleDateString();
        const id = (Math.random().toString().replace("0.", "") + time.replace(/\//g, "")).slice(0, 19).padEnd(19, "0");

        const post = await Post.create({
            id,
            title: title.trim(),
            desc: desc?.trim() || "",
            img: imgUrl,
            tags: tags || [],
            time,
            user: user._id,
            like: { users: [] },
        });

        return post;
    }

    // Like / unlike
    async liking(postId: string, user: any): Promise<number> {
        try {
            const post = await this.#posts.findOne({ _id: postId }).populate("like.users", "-password").exec();

            if (!post) throw new Error("Post not found");

            const alreadyLiked = post.like.users.some((u: any) => u._id.toString() === user._id.toString());

            if (alreadyLiked) {
                post.like.users = post.like.users.filter((u: any) => u._id.toString() !== user._id.toString());
            } else {
                post.like.users.push(user._id);
            }

            await this.#posts.updateOne({ _id: postId }, { $set: { "like.users": post.like.users } });

            return post.like.users.length;
        } catch (error) {
            console.error("Error liking post:", error);
            return 0;
        }
    }

    // Hapus post
    async deletePost(postId: string): Promise<boolean> {
        await connect();
        try {
            await this.#posts.findOneAndDelete({ id: postId });
            return true;
        } catch (error) {
            console.error("Error deleting post:", error);
            return false;
        }
    }
}

export default Posts;
