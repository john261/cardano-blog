"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gzxyhwhlsxcqjuinjjlg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eHlod2hsc3hjcWp1aW5qamxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjIzMTEsImV4cCI6MjA4NjEzODMxMX0.XtBANUch1vkrrSMTy-V9FELtjH56lz6ostPOmCACxjk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
  "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋",
  "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏",
  "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩",
  "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵",
  "👍", "👎", "👏", "🙌", "👌", "🤝", "💪", "🙏", "✨", "🔥",
  "💯", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔"
];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState<{ [key: string]: { name: string; text: string } }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<{ [key: string]: boolean }>({});
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedPost]);

  const [prices, setPrices] = useState<{
    ada: { eur: number; change: number } | null;
    night: { eur: number; change: number } | null;
  }>({ ada: null, night: null });

  const [sparkline, setSparkline] = useState<number[]>([]);

  const [networkStats, setNetworkStats] = useState<{
    epoch: number | null;
    txCount: string | null;
    activeStake: string | null;
    blockHeight: string | null;
  }>({ epoch: null, txCount: null, activeStake: null, blockHeight: null });

  useEffect(() => {
    loadPosts();
    fetchPrices();
    fetchNetworkStats();
    fetchSparkline();
    const interval = setInterval(fetchPrices, 30000);
    const statsInterval = setInterval(fetchNetworkStats, 60000);
    const sparklineInterval = setInterval(fetchSparkline, 300000);
    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
      clearInterval(sparklineInterval);
    };
  }, []);

  async function fetchSparkline() {
    try {
      const res = await fetch("https://api.kraken.com/0/public/OHLC?pair=ADAEUR&interval=1440");
      const data = await res.json();
      const ohlc = data.result?.ADAEUR ?? data.result?.XADAZEUR ?? [];
      const closes: number[] = ohlc.slice(-14).map((c: string[]) => parseFloat(c[4]));
      setSparkline(closes);
    } catch (e) {
      console.error("Sparkline Fehler:", e);
    }
  }

  async function fetchNetworkStats() {
    const BF_KEY = "mainnetMuGkLI2uRrx4ssPx3nxgxWlCHvdkQUK3";
    const headers = { project_id: BF_KEY };
    try {
      const [epochRes, blockRes] = await Promise.all([
        fetch("https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest", { headers }),
        fetch("https://cardano-mainnet.blockfrost.io/api/v0/blocks/latest", { headers }),
      ]);
      const epochData = await epochRes.json();
      const blockData = await blockRes.json();
      const activeStakeAda = epochData.active_stake
        ? (parseInt(epochData.active_stake) / 1_000_000 / 1_000_000_000).toFixed(1) + "B ₳"
        : null;
      setNetworkStats({
        epoch: epochData.epoch ?? epochData.id ?? null,
        txCount: epochData.tx_count ? parseInt(epochData.tx_count).toLocaleString("de-DE") : null,
        activeStake: activeStakeAda,
        blockHeight: blockData.height ? parseInt(blockData.height).toLocaleString("de-DE") : null,
      });
    } catch (e) {
      console.error("Netzwerk-Stats Fehler:", e);
    }
  }

  async function fetchPrices() {
    try {
      const adaRes = await fetch("https://api.kraken.com/0/public/Ticker?pair=ADAEUR");
      const adaData = await adaRes.json();
      const adaTicker = adaData.result?.ADAEUR;
      const adaPrice = adaTicker ? parseFloat(adaTicker.c[0]) : null;
      const adaOpen = adaTicker ? parseFloat(adaTicker.o) : null;
      const adaChange = adaPrice && adaOpen ? ((adaPrice - adaOpen) / adaOpen) * 100 : 0;
      let nightPrice: number | null = null;
      let nightChange = 0;
      try {
        const nightRes = await fetch("https://api.kraken.com/0/public/Ticker?pair=NIGHTEUR");
        const nightData = await nightRes.json();
        const nightTicker = nightData.result?.NIGHTEUR;
        if (nightTicker) {
          nightPrice = parseFloat(nightTicker.c[0]);
          const nightOpen = parseFloat(nightTicker.o);
          nightChange = nightPrice && nightOpen ? ((nightPrice - nightOpen) / nightOpen) * 100 : 0;
        }
      } catch {
        console.warn("NIGHT nicht verfügbar auf Kraken");
      }
      setPrices({
        ada: adaPrice ? { eur: adaPrice, change: adaChange } : null,
        night: nightPrice ? { eur: nightPrice, change: nightChange } : null,
      });
    } catch (e) {
      console.error("Preisfehler:", e);
    }
  }

  async function loadPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Fehler beim Laden der Posts:", error);
    } else if (data) {
      setPosts(data);
      data.forEach((post) => loadComments(post.id));
    }
    setLoading(false);
  }

  async function loadComments(postId: string) {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Fehler beim Laden der Kommentare:", error);
    } else if (data) {
      setComments((prev) => ({ ...prev, [postId]: data }));
    }
  }

  async function handleCommentSubmit(postId: string, e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(postId);
    const form = commentForm[postId];
    if (!form || !form.name.trim() || !form.text.trim()) {
      alert("Bitte fülle alle Felder aus!");
      setSubmitting(null);
      return;
    }
    const { error } = await supabase.from("comments").insert([
      { post_id: postId, author_name: form.name.trim(), comment_text: form.text.trim() },
    ]);
    if (error) {
      console.error("Fehler beim Speichern des Kommentars:", error);
      alert("Fehler: Kommentar konnte nicht gespeichert werden");
    } else {
      setCommentForm((prev) => ({ ...prev, [postId]: { name: "", text: "" } }));
      loadComments(postId);
    }
    setSubmitting(null);
  }

  function updateCommentForm(postId: string, field: "name" | "text", value: string) {
    setCommentForm((prev) => ({
      ...prev,
      [postId]: { ...(prev[postId] || { name: "", text: "" }), [field]: value },
    }));
  }

  function addEmoji(postId: string, emoji: string) {
    const currentText = commentForm[postId]?.text || "";
    updateCommentForm(postId, "text", currentText + emoji);
    setShowEmojiPicker((prev) => ({ ...prev, [postId]: false }));
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  }

  function getTextPreview(html: string, maxLength: number = 200): string {
    const text = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function getReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  }

  // ─── LOADING SCREEN ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "#04040a" }} className="min-h-screen flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;800;900&family=Manrope:wght@300;400;500;600&display=swap');
          .loader-beam {
            width: 2px; height: 80px;
            background: linear-gradient(to bottom, transparent, #7c6aff, #a78bfa, #7c6aff, transparent);
            border-radius: 99px;
            animation: beam-pulse 1.4s ease-in-out infinite;
            box-shadow: 0 0 20px 6px rgba(124,106,255,0.4);
          }
          @keyframes beam-pulse { 0%,100%{opacity:0.4;transform:scaleY(0.7)} 50%{opacity:1;transform:scaleY(1)} }
        `}</style>
        <div className="flex flex-col items-center gap-5">
          <div className="loader-beam" />
          <p style={{ fontFamily: "'Epilogue', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", letterSpacing: "0.15em" }}>
            LÄDT
          </p>
        </div>
      </div>
    );
  }

  const currentPost = selectedPost ? posts.find(p => p.id === selectedPost) : null;

  // ─── ARTIKEL-VOLLBILD ──────────────────────────────────────────────────────
  if (currentPost) {
    return (
      <div style={{ background: "#04040a", fontFamily: "'Manrope', sans-serif" }} className="min-h-screen">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
          .article-content { color: rgba(255,255,255,0.82); font-size: 1.1rem; line-height: 1.85; font-family: 'Manrope', sans-serif; }
          .article-content h1,.article-content h2,.article-content h3,.article-content h4 { color: #fff; font-family: 'Epilogue', sans-serif; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; }
          .article-content h1 { font-size: 2.2rem; }
          .article-content h2 { font-size: 1.75rem; }
          .article-content h3 { font-size: 1.4rem; }
          .article-content p { margin-bottom: 1.6rem; }
          .article-content a { color: #a78bfa; text-decoration: underline; }
          .article-content a:hover { color: #c4b5fd; }
          .article-content strong, .article-content b { color: #fff; font-weight: 600; }
          .article-content ul,.article-content ol { margin-left: 1.75rem; margin-bottom: 1.6rem; color: rgba(255,255,255,0.82); }
          .article-content li { margin-bottom: 0.6rem; }
          .article-content blockquote { border-left: 3px solid #7c6aff; padding-left: 1.5rem; margin: 2rem 0; font-style: italic; color: rgba(255,255,255,0.6); }
          .article-content code { background: rgba(124,106,255,0.15); border: 1px solid rgba(124,106,255,0.25); color: #c4b5fd; padding: 0.2rem 0.45rem; border-radius: 5px; font-size: 0.88em; }
          .article-content pre { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin-bottom: 2rem; }
          .article-content pre code { background: transparent; border: none; padding: 0; }
          .article-content table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; color: rgba(255,255,255,0.82); }
          .article-content th,.article-content td { border: 1px solid rgba(255,255,255,0.1); padding: 0.875rem; text-align: left; }
          .article-content th { background: rgba(124,106,255,0.1); color: #fff; font-weight: 600; }
          .article-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 2rem 0; }
          .progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: linear-gradient(to right, #7c6aff, #a78bfa, #e879f9); transition: width 0.15s; z-index: 100; }
          .back-btn:hover { background: rgba(255,255,255,0.06) !important; }
          .comment-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.5rem; }
          .input-field { width: 100%; padding: 0.875rem 1.25rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-family: 'Manrope', sans-serif; font-size: 1rem; outline: none; transition: border-color 0.2s; }
          .input-field:focus { border-color: rgba(124,106,255,0.5); }
          .input-field::placeholder { color: rgba(255,255,255,0.25); }
          .submit-btn { background: linear-gradient(135deg, #7c6aff, #6d28d9); color: #fff; padding: 0.875rem 2rem; border-radius: 10px; font-family: 'Epilogue', sans-serif; font-weight: 600; font-size: 0.95rem; border: none; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
          .submit-btn:hover { opacity: 0.88; transform: translateY(-1px); }
          .submit-btn:disabled { background: rgba(255,255,255,0.08); cursor: not-allowed; transform: none; }
        `}</style>

        <div className="progress-bar" style={{ width: `${readProgress}%` }} />

        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(4,4,10,0.95)", backdropFilter: "blur(16px)" }} className="sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="back-btn flex items-center gap-2 transition-all px-3 py-2 rounded-lg"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Manrope', sans-serif", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span style={{ fontSize: "0.9rem" }}>Zur Übersicht</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <article className="mb-20">
            <div className="mb-12">
              <span style={{ color: "#7c6aff", fontFamily: "'Epilogue', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Cardano Research
              </span>
              <h1 style={{ fontFamily: "'Epilogue', sans-serif", color: "#fff", fontWeight: 800, lineHeight: 1.15, marginTop: "1rem", marginBottom: "1.5rem" }} className="text-4xl md:text-5xl lg:text-6xl">
                {currentPost.title}
              </h1>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem", display: "flex", gap: "1rem" }}>
                <span>{formatDate(currentPost.created_at)}</span>
                <span>·</span>
                <span>{getReadingTime(currentPost.content)} Min. Lesezeit</span>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginTop: "2rem" }} />
            </div>

            <div className="article-content" dangerouslySetInnerHTML={{ __html: currentPost.content }} />
          </article>

          {/* Kommentare */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "3rem" }}>
            <h3 style={{ fontFamily: "'Epilogue', sans-serif", color: "#fff", fontWeight: 700, fontSize: "1.75rem", marginBottom: "2rem" }}>
              Diskussion <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "1.25rem" }}>({comments[currentPost.id]?.length || 0})</span>
            </h3>

            {comments[currentPost.id] && comments[currentPost.id].length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                {comments[currentPost.id].map((comment) => (
                  <div key={comment.id} className="comment-card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #7c6aff, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "'Epilogue', sans-serif", flexShrink: 0 }}>
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 500, fontSize: "0.95rem" }}>{comment.author_name}</p>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginLeft: "52px" }}>{comment.comment_text}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "2rem" }}>
              <h4 style={{ fontFamily: "'Epilogue', sans-serif", color: "#fff", fontWeight: 600, marginBottom: "1.5rem" }}>Kommentar verfassen</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                  type="text"
                  value={commentForm[currentPost.id]?.name || ""}
                  onChange={(e) => updateCommentForm(currentPost.id, "name", e.target.value)}
                  className="input-field"
                  placeholder="Dein Name"
                />
                <div style={{ position: "relative" }}>
                  <textarea
                    value={commentForm[currentPost.id]?.text || ""}
                    onChange={(e) => updateCommentForm(currentPost.id, "text", e.target.value)}
                    rows={5}
                    className="input-field"
                    style={{ resize: "none" }}
                    placeholder="Dein Kommentar..."
                  />
                  <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))}
                      style={{ fontSize: "1.25rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.375rem 0.625rem", cursor: "pointer" }}
                    >😊</button>
                  </div>
                  {showEmojiPicker[currentPost.id] && (
                    <div style={{ position: "absolute", bottom: "3.5rem", right: 0, background: "#0d0d18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1rem", zIndex: 10, width: "280px", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>Emoji auswählen</span>
                        <button type="button" onClick={() => setShowEmojiPicker((prev) => ({ ...prev, [currentPost.id]: false }))} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "4px", maxHeight: "180px", overflowY: "auto" }}>
                        {EMOJIS.map((emoji, i) => (
                          <button key={i} type="button" onClick={() => addEmoji(currentPost.id, emoji)} style={{ fontSize: "1.25rem", background: "none", border: "none", cursor: "pointer", borderRadius: "6px", padding: "4px" }}>{emoji}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCommentSubmit(currentPost.id, e)}
                  disabled={submitting === currentPost.id}
                  className="submit-btn"
                  style={{ alignSelf: "flex-start" }}
                >
                  {submitting === currentPost.id ? "Wird gesendet..." : "Kommentar absenden"}
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "5rem" }}>
          <div className="max-w-4xl mx-auto px-6 py-8" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif" }}>© 2026 Cardano Research Journal</p>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                {[["Admin", "/admin/login"], ["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"]].map(([label, href]) => (
                  <a key={label} href={href} style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>{label}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ─── ÜBERSICHTS-SEITE ──────────────────────────────────────────────────────
  return (
    <div style={{ background: "#04040a", fontFamily: "'Manrope', sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        * { box-sizing: border-box; }

        /* ── LIGHT BEAM ── */
        .hero-beam {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 480px;
          background: linear-gradient(to bottom, transparent 0%, #7c6aff 25%, #c4b5fd 50%, #7c6aff 75%, transparent 100%);
          border-radius: 99px;
          filter: blur(0.5px);
          animation: beam-flicker 4s ease-in-out infinite;
        }
        .hero-beam::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 100%;
          background: inherit;
          filter: blur(28px);
          opacity: 0.55;
          border-radius: 99px;
        }
        .hero-beam::after {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(124,106,255,0.18) 0%, transparent 70%);
          filter: blur(40px);
        }
        @keyframes beam-flicker {
          0%,100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        /* Soft glow at bottom of beam */
        .beam-glow {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse at 50% 0%, rgba(124,106,255,0.22) 0%, rgba(167,139,250,0.1) 30%, transparent 70%);
          pointer-events: none;
        }

        /* ── HEADER ── */
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(4,4,10,0.92);
          backdrop-filter: blur(20px);
        }
        .nav-link {
          color: rgba(255,255,255,0.45);
          font-size: 0.875rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: rgba(255,255,255,0.85); }

        /* ── PRICE BADGES ── */
        .price-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.375rem 0.875rem;
          transition: border-color 0.2s;
        }
        .price-badge:hover { border-color: rgba(124,106,255,0.35); }

        /* ── STATS BAR ── */
        .stats-bar { border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.015); }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0.625rem 1rem;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        /* ── CARDS ── */
        .post-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem;
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.25s;
          overflow: hidden;
          position: relative;
        }
        .post-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(124,106,255,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 16px;
          pointer-events: none;
        }
        .post-card:hover {
          background: rgba(255,255,255,0.045);
          border-color: rgba(124,106,255,0.3);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(124,106,255,0.1);
        }
        .post-card:hover::before { opacity: 1; }

        /* ── FOOTER ── */
        .site-footer { border-top: 1px solid rgba(255,255,255,0.06); margin-top: 7rem; }

        /* ── CTA BUTTON ── */
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(124,106,255,0.15);
          border: 1px solid rgba(124,106,255,0.4);
          color: #c4b5fd;
          padding: 0.625rem 1.5rem;
          border-radius: 999px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.875rem;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .hero-cta:hover { background: rgba(124,106,255,0.25); border-color: rgba(124,106,255,0.65); }

        /* ── LIVE DOT ── */
        @keyframes live-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .live-dot { animation: live-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-6 py-4" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "32px", height: "32px", flexShrink: 0 }}>
              <svg viewBox="0 0 375 346.5" style={{ width: "100%", height: "100%" }}>
                <g fill="#7c6aff">
                  <circle cx="113.5" cy="172.1" r="10.7"/><circle cx="113.5" cy="137.4" r="10.7"/><circle cx="147.9" cy="154.7" r="10.7"/><circle cx="182.4" cy="172.1" r="10.7"/><circle cx="216.8" cy="154.7" r="10.7"/><circle cx="251.3" cy="172.1" r="10.7"/><circle cx="251.3" cy="137.4" r="10.7"/><circle cx="147.9" cy="206.8" r="10.7"/><circle cx="182.4" cy="224.1" r="10.7"/><circle cx="216.8" cy="206.8" r="10.7"/><circle cx="147.9" cy="102.7" r="10.7"/><circle cx="182.4" cy="85.4" r="10.7"/><circle cx="216.8" cy="102.7" r="10.7"/><circle cx="182.4" cy="137.4" r="8"/><circle cx="182.4" cy="206.8" r="8"/><circle cx="113.5" cy="206.8" r="8"/><circle cx="251.3" cy="206.8" r="8"/><circle cx="113.5" cy="102.7" r="8"/><circle cx="251.3" cy="102.7" r="8"/>
                </g>
              </svg>
            </div>
            <span style={{ fontFamily: "'Epilogue', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem", letterSpacing: "-0.01em" }}>
              CARDANO <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>Research Journal</span>
            </span>
          </div>

          {/* Preise + Live */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            {/* ADA */}
            <div className="price-badge">
              <span style={{ color: "#7c6aff", fontFamily: "'Epilogue', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em" }}>ADA</span>
              {prices.ada ? (
                <>
                  <span style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 500 }}>€{prices.ada.eur.toFixed(4)}</span>
                  <span style={{ color: prices.ada.change >= 0 ? "#4ade80" : "#f87171", fontSize: "0.75rem" }}>
                    {prices.ada.change >= 0 ? "▲" : "▼"} {Math.abs(prices.ada.change).toFixed(2)}%
                  </span>
                  {sparkline.length > 1 && (() => {
                    const min = Math.min(...sparkline), max = Math.max(...sparkline);
                    const w = 44, h = 18;
                    const pts = sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
                    const color = sparkline[sparkline.length - 1] >= sparkline[0] ? "#4ade80" : "#f87171";
                    return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /></svg>;
                  })()}
                </>
              ) : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>…</span>}
            </div>

            {/* NIGHT */}
            <div className="price-badge">
              <span style={{ color: "#a78bfa", fontFamily: "'Epilogue', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em" }}>NIGHT</span>
              {prices.night ? (
                <>
                  <span style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 500 }}>€{prices.night.eur.toFixed(4)}</span>
                  <span style={{ color: prices.night.change >= 0 ? "#4ade80" : "#f87171", fontSize: "0.75rem" }}>
                    {prices.night.change >= 0 ? "▲" : "▼"} {Math.abs(prices.night.change).toFixed(2)}%
                  </span>
                </>
              ) : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>…</span>}
            </div>

            <div className="live-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} title="Live" />
          </div>
        </div>
      </header>

      {/* ── NETWORK STATS BAR ──────────────────────────────────────── */}
      <div className="stats-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { label: "Epoche", value: networkStats.epoch ? `#${networkStats.epoch}` : null, icon: "⛓" },
              { label: "TXs diese Epoche", value: networkStats.txCount, icon: "📊" },
              { label: "Active Stake", value: networkStats.activeStake, icon: "🔒" },
              { label: "Blockhöhe", value: networkStats.blockHeight, icon: "📦" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="stat-item">
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{icon} {label}</span>
                <span style={{ color: value ? "#fff" : "rgba(255,255,255,0.15)", fontSize: "0.875rem", fontWeight: 500 }}>
                  {value ?? "Lädt…"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: "6rem", paddingBottom: "5rem", textAlign: "center" }}>
        {/* Beam */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0 }}>
          <div className="hero-beam" />
          <div className="beam-glow" />
        </div>

        {/* Background ambient glows */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "15%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(124,106,255,0.07) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "10%", right: "15%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        </div>

        <div className="max-w-4xl mx-auto px-6" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(124,106,255,0.1)", border: "1px solid rgba(124,106,255,0.25)", color: "#a78bfa", padding: "0.3rem 0.9rem", borderRadius: "999px", fontSize: "0.75rem", fontFamily: "'Epilogue', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c6aff" }} />
              On-Chain Research
            </span>
          </div>

          <h1 style={{ fontFamily: "'Epilogue', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1, color: "#fff", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
            Cardano Deep Dives<br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Daten, Analysen, Insights</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 2.5rem" }}>
            Unabhängige Analysen zu On-Chain-Daten, Tokenomics und Risiko.
          </p>

          <button className="hero-cta" onClick={() => {
            document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" });
          }}>
            Artikel lesen
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── ARTICLE GRID ───────────────────────────────────────────── */}
      <main id="articles" className="max-w-7xl mx-auto px-6 pb-24">
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Epilogue', sans-serif", color: "#fff", fontWeight: 700, fontSize: "1.125rem" }}>Alle Artikel</h2>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>{posts.length} Beiträge</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "5rem", paddingBottom: "5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "1.1rem" }}>Noch keine Artikel vorhanden</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {posts.map((post) => (
              <article key={post.id} className="post-card" onClick={() => setSelectedPost(post.id)}>
                <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#7c6aff", fontFamily: "'Epilogue', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Forschung</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>{getReadingTime(post.content)} Min.</span>
                </div>

                <h3 style={{ fontFamily: "'Epilogue', sans-serif", color: "#fff", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.35, marginBottom: "0.875rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {post.title}
                </h3>

                <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {getTextPreview(post.content, 150)}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.125rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>{formatDate(post.created_at)}</span>
                  <span style={{ color: "#7c6aff", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", fontFamily: "'Epilogue', sans-serif" }}>
                    Weiterlesen
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="max-w-7xl mx-auto px-6 py-8" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif" }}>
            © 2026 Cardano Research Journal. Alle Rechte vorbehalten.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[["Admin", "/admin/login"], ["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"]].map(([label, href]) => (
              <a key={label} href={href} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}