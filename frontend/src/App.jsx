import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/posts";
const USERS_API = "http://localhost:5000/api/users";
const CURRENT_USER_ID = 1;

const initialPosts = [
  {
    id: 1,
    name: "Aarav Sharma",
    username: "@aarav",
    avatar: "A",
    color: "#7c3aed",
    time: "2 hours ago",
    text: "Starting my journey with React! 🚀 Excited to build something amazing and connect with new people.",
    likes: 12,
    comments: 3,
    liked: false,
  },
  {
    id: 2,
    name: "Priya Verma",
    username: "@priya",
    avatar: "P",
    color: "#db2777",
    time: "4 hours ago",
    text: "Small steps every day lead to big results. Keep learning, keep growing! ✨",
    likes: 28,
    comments: 7,
    liked: false,
  },
  {
    id: 3,
    name: "Rahul Singh",
    username: "@rahul",
    avatar: "R",
    color: "#0891b2",
    time: "6 hours ago",
    text: "What is everyone learning today? 💻 Drop your current project below!",
    likes: 19,
    comments: 5,
    liked: false,
  },
];

function normalizePost(post) {
  const username = post.username || "Guest";

  return {
    id: post.id,
    name: post.name || username,
    username: username.startsWith("@")
      ? username
      : `@${username}`,
    avatar:
      post.avatar || username.replace("@", "")[0].toUpperCase(),
    color: post.color || "#4f46e5",
    time: post.time || "Just now",
    text: post.text ?? post.content ?? "",
    likes: post.likes ?? 0,
    comments: Array.isArray(post.comments)
      ? post.comments.length
      : post.comments ?? 0,
    liked: post.liked ?? false,
  };
}

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [text, setText] = useState("");
  const [active, setActive] = useState("Home");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLists, setCommentLists] = useState({});

  // Follow system states
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [followError, setFollowError] = useState("");

  async function loadPosts() {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Posts load nahi hui");
      }

      const data = await response.json();
      setPosts(data.map(normalizePost));
      setError("");
    } catch {
      setError(
        "Backend connect nahi ho raha. Backend terminal check karo."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load users and current user's following list
  async function loadUsers() {
    try {
      setUsersLoading(true);

      const response = await fetch(USERS_API);

      if (!response.ok) {
        throw new Error("Users load nahi hue");
      }

      const data = await response.json();
      setUsers(data);

      const currentUser = data.find(
        (user) => user.id === CURRENT_USER_ID
      );

      setFollowing(currentUser?.following || []);
      setFollowError("");
    } catch {
      setFollowError("Users load nahi hue. Backend check karo.");
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    loadUsers();
  }, []);

  async function addPost() {
    if (!text.trim()) return;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Vanshika",
          content: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Post create nahi hui");
      }

      setText("");
      setActive("Home");
      await loadPosts();
    } catch {
      setError("Post publish nahi hui. Backend check karo.");
    }
  }

  async function toggleLike(id) {
    try {
      const response = await fetch(`${API}/${id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Like failed");
      }

      const updated = await response.json();

      setPosts((current) =>
        current.map((post) =>
          post.id === id
            ? {
                ...post,
                likes: updated.likes,
                liked: !post.liked,
              }
            : post
        )
      );

      setError("");
    } catch {
      setError("Like nahi hua. Dobara try karo.");
    }
  }

  async function addComment(id) {
    const comment = (commentInputs[id] || "").trim();

    if (!comment) return;

    try {
      const response = await fetch(`${API}/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment }),
      });

      if (!response.ok) {
        throw new Error("Comment failed");
      }

      const updated = await response.json();

      setPosts((current) =>
        current.map((post) =>
          post.id === id
            ? {
                ...post,
                comments: updated.comments.length,
              }
            : post
        )
      );

      setCommentLists((current) => ({
        ...current,
        [id]: updated.comments,
      }));

      setCommentInputs((current) => ({
        ...current,
        [id]: "",
      }));

      setError("");
    } catch {
      setError("Comment add nahi hua. Dobara try karo.");
    }
  }

  // Follow or unfollow a user through the backend
  async function toggleFollow(userId) {
    try {
      setFollowError("");

      const response = await fetch(
        `${USERS_API}/${userId}/follow`,
        { method: "POST" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Follow action failed");
      }

      setFollowing(result.following);

      // Refresh users in case the backend data changes
      await loadUsers();
    } catch (err) {
      setFollowError(
        err.message || "Follow nahi hua. Dobara try karo."
      );
    }
  }

  const visiblePosts = posts.filter((post) =>
    `${post.name} ${post.username} ${post.text}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const suggestedUsers = users.filter(
    (user) => user.id !== CURRENT_USER_ID
  );

  return (
    <div className="app">
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          onClick={() => setActive("Home")}
        >
          <span className="brand-icon">c</span>
          connect<span>hub</span>
        </a>

        <div className="top-search">
          <span>⌕</span>
          <input
            placeholder="Search people and posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="top-profile">
          <div className="avatar you">Y</div>
          <span>You</span>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <p className="side-label">MENU</p>

          {[
            ["⌂", "Home"],
            ["◎", "Explore"],
            ["♡", "Notifications"],
            ["✉", "Messages"],
            ["♙", "Profile"],
          ].map(([icon, label]) => (
            <button
              key={label}
              className={`nav-item ${
                active === label ? "selected" : ""
              }`}
              onClick={() => setActive(label)}
            >
              <span>{icon}</span> {label}

              {label === "Notifications" && (
                <small className="notification-count">3</small>
              )}
            </button>
          ))}

          <button
            className="create-button"
            onClick={() => setActive("Create")}
          >
            + Create Post
          </button>

          <div className="sidebar-bottom">
            <div className="avatar you">Y</div>
            <div>
              <strong>Your Profile</strong>
              <p>@you</p>
            </div>
            <span>•••</span>
          </div>
        </aside>

        <main className="feed">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR COMMUNITY</p>
              <h1>
                {active === "Create" ? "Create a post" : active}
                {active === "Home" && <span> 👋</span>}
              </h1>
              <p className="muted">
                Share ideas. Discover people. Stay connected.
              </p>
            </div>
          </div>

          {error && (
            <div className="card info-card">
              <p>{error}</p>
              <button onClick={loadPosts}>Try again</button>
            </div>
          )}

          {(active === "Create" || active === "Home") && (
            <section className="composer card">
              <div className="avatar you">Y</div>

              <div className="composer-content">
                <textarea
                  placeholder="What's on your mind?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                />

                <div className="composer-footer">
                  <span>✦ Share something positive</span>
                  <button
                    className="primary-button"
                    onClick={addPost}
                    disabled={!text.trim()}
                  >
                    Publish post ↗
                  </button>
                </div>
              </div>
            </section>
          )}

          {active === "Explore" && (
            <div className="card info-card">
              <h3>Explore ConnectHub</h3>
              <p>
                Discover posts and search for people using the search
                box above.
              </p>
            </div>
          )}

          {active === "Notifications" && (
            <div className="card info-card">
              <h3>Your notifications 🔔</h3>
              <p>
                Welcome to ConnectHub! Your community is waiting for you.
              </p>
            </div>
          )}

          {active === "Messages" && (
            <div className="card info-card">
              <h3>Your messages ✉</h3>
              <p>
                Messaging will be available when we build that feature.
              </p>
            </div>
          )}

          {active === "Profile" && (
            <div className="card profile-card">
              <div className="profile-cover" />
              <div className="profile-details">
                <div className="avatar you large">Y</div>
                <h2>Your Profile</h2>
                <p className="muted">
                  @you · ConnectHub member
                </p>
                <p>
                  {posts.filter((p) => p.username === "@you").length} posts
                  shared
                </p>
              </div>
            </div>
          )}

          {active === "Home" && (
            <div className="feed-tabs">
              <strong>Community Feed</strong>
              <span>Latest posts</span>
            </div>
          )}

          {loading && (
            <div className="card info-card">Loading posts...</div>
          )}

          {active !== "Messages" &&
            active !== "Notifications" &&
            active !== "Profile" &&
            !loading &&
            visiblePosts.map((post) => (
              <article className="post card" key={post.id}>
                <div className="post-header">
                  <div
                    className="avatar"
                    style={{ background: post.color }}
                  >
                    {post.avatar}
                  </div>

                  <div className="post-author">
                    <strong>{post.name}</strong>
                    <span>
                      {post.username} · {post.time}
                    </span>
                  </div>

                  <button
                    className="more-button"
                    aria-label="More options"
                  >
                    •••
                  </button>
                </div>

                <p className="post-text">{post.text}</p>

                <div className="post-stats">
                  <span>❤️ {post.likes} likes</span>
                  <span>💬 {post.comments} comments</span>
                </div>

                <div className="post-actions">
                  <button
                    className={post.liked ? "liked" : ""}
                    onClick={() => toggleLike(post.id)}
                  >
                    {post.liked ? "♥ Liked" : "♡ Like"}
                  </button>

                  <button
                    onClick={() =>
                      setCommentInputs((current) => ({
                        ...current,
                        [post.id]: current[post.id] || "",
                      }))
                    }
                  >
                    ◯ Comment
                  </button>

                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText(post.text)
                    }
                  >
                    ↗ Copy post
                  </button>
                </div>

                <form
                  className="comment-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addComment(post.id);
                  }}
                >
                  <input
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((current) => ({
                        ...current,
                        [post.id]: e.target.value,
                      }))
                    }
                  />
                  <button type="submit">Send</button>
                </form>

                {(commentLists[post.id] || []).map((comment) => (
                  <p key={comment.id} className="comment-item">
                    💬 {comment.text}
                  </p>
                ))}
              </article>
            ))}

          {!loading && visiblePosts.length === 0 && (
            <div className="card info-card">
              <h3>No posts found</h3>
              <p>Try another search or publish a new post.</p>
            </div>
          )}
        </main>

        <aside className="rightbar">
          <section className="card welcome-card">
            <div className="welcome-art">✦</div>
            <h3>Welcome to ConnectHub</h3>
            <p>
              Your space to share ideas, meet people and build connections.
            </p>

            <div className="welcome-stats">
              <div>
                <strong>{users.length || 2}</strong>
                <span>Members</span>
              </div>
              <div>
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>
            </div>
          </section>

          {/* Follow and unfollow users */}
          <section className="card people-card">
            <div className="section-title">
              <h3>People to follow</h3>
              <span>♙</span>
            </div>

            {followError && (
              <p className="follow-error">{followError}</p>
            )}

            {usersLoading ? (
              <p className="muted">Loading people...</p>
            ) : suggestedUsers.length === 0 ? (
              <p className="muted">No other users available yet.</p>
            ) : (
              suggestedUsers.map((user) => {
                const isFollowing = following.includes(user.id);
                const displayName = user.username || "User";

                return (
                  <div className="person-row" key={user.id}>
                    <div className="avatar person-avatar">
                      {displayName[0].toUpperCase()}
                    </div>

                    <div className="person-info">
                      <strong>{displayName}</strong>
                      <span>@{displayName.toLowerCase()}</span>
                    </div>

                    <button
                      className={`follow-button ${
                        isFollowing ? "following" : ""
                      }`}
                      onClick={() => toggleFollow(user.id)}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })
            )}
          </section>

          <section className="card trends-card">
            <div className="section-title">
              <h3>Trending topics</h3>
              <span>↗</span>
            </div>

            {[
              ["#WebDevelopment", "1.2k posts"],
              ["#ReactJS", "856 posts"],
              ["#LearningToCode", "642 posts"],
              ["#BuildInPublic", "429 posts"],
            ].map(([topic, count]) => (
              <button
                className="trend"
                key={topic}
                onClick={() => setSearch(topic.replace("#", ""))}
              >
                <strong>{topic}</strong>
                <span>{count}</span>
              </button>
            ))}
          </section>

          <footer className="footer">
            About · Privacy · Community Guidelines
            <p>© 2026 ConnectHub</p>
          </footer>
        </aside>
      </div>
    </div>
  );
}

export default App;