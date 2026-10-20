import { useEffect, useState } from "react";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  const API = "http://localhost:5000/api/posts";

  async function loadPosts() {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Could not load posts:", error);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function addPost(e) {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "Vanshika",
          content
        })
      });

      if (!response.ok) {
        throw new Error("Post failed");
      }

      setContent("");
      loadPosts();
    } catch (error) {
      alert("Post nahi ho payi. Backend check karo.");
    }
  }

  async function likePost(id) {
    try {
      const response = await fetch(`${API}/${id}/like`, {
        method: "POST"
      });

      if (!response.ok) throw new Error("Like failed");

      loadPosts();
    } catch (error) {
      alert("Like nahi hua. Backend check karo.");
    }
  }

  return (
    <section className="posts-section">
      <h2>Community Posts</h2>

      <form onSubmit={addPost}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button type="submit">Create Post</button>
      </form>

      {posts.map((post) => (
        <article className="post-card" key={post.id}>
          <h3>{post.username}</h3>
          <p>{post.content}</p>

          <button onClick={() => likePost(post.id)}>
            ❤️ Like ({post.likes})
          </button>

          <p>Comments: {post.comments.length}</p>
        </article>
      ))}
    </section>
  );
}

export default Posts;