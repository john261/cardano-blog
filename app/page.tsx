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

// Emoji-Auswahl für Kommentare
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
  const [prices, setPrices] = useState<{
    ada: { eur: number; change: number } | null;
    night: { eur: number; change: number } | null;
  }>({ ada: null, night: null });

  useEffect(() => {
    loadPosts();
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPrices() {
    try {
      // ADA von Kraken
      const adaRes = await fetch("https://api.kraken.com/0/public/Ticker?pair=ADAEUR");
      const adaData = await adaRes.json();
      const adaTicker = adaData.result?.ADAEUR;
      const adaPrice = adaTicker ? parseFloat(adaTicker.c[0]) : null;
      const adaOpen = adaTicker ? parseFloat(adaTicker.o) : null;
      const adaChange = adaPrice && adaOpen ? ((adaPrice - adaOpen) / adaOpen) * 100 : 0;

      // NIGHT von Kraken
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
      {
        post_id: postId,
        author_name: form.name.trim(),
        comment_text: form.text.trim(),
      },
    ]);

    if (error) {
      console.error("Fehler beim Speichern des Kommentars:", error);
      alert("Fehler: Kommentar konnte nicht gespeichert werden");
    } else {
      setCommentForm((prev) => ({
        ...prev,
        [postId]: { name: "", text: "" },
      }));
      loadComments(postId);
    }
    setSubmitting(null);
  }

  function updateCommentForm(postId: string, field: "name" | "text", value: string) {
    setCommentForm((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || { name: "", text: "" }),
        [field]: value,
      },
    }));
  }

  function addEmoji(postId: string, emoji: string) {
    const currentText = commentForm[postId]?.text || "";
    updateCommentForm(postId, "text", currentText + emoji);
    setShowEmojiPicker((prev) => ({ ...prev, [postId]: false }));
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getTextPreview(html: string, maxLength: number = 200): string {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function getReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Lädt...</p>
        </div>
      </div>
    );
  }

  const currentPost = selectedPost ? posts.find(p => p.id === selectedPost) : null;

  // VOLLBILD ARTIKEL-ANSICHT
  if (currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header mit Zurück-Button */}
        <header className="border-b border-slate-600 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-gray-200 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Zur Übersicht</span>
            </button>
          </div>
        </header>

        {/* Artikel-Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          <article className="mb-16">
            {/* Artikel-Header */}
            <div className="mb-10">
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
                Cardano Research
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6 leading-tight">
                {currentPost.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-300 text-sm">
                <span>{formatDate(currentPost.created_at)}</span>
                <span>•</span>
                <span>{getReadingTime(currentPost.content)} Min. Lesezeit</span>
              </div>
            </div>

            {/* Artikel-Inhalt */}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: currentPost.content }} />
            
            <style jsx>{`
              .article-content {
                color: white !important;
                font-size: 1.125rem;
                line-height: 1.8;
              }
              
              .article-content * {
                color: white !important;
              }
              
              .article-content h1,
              .article-content h2,
              .article-content h3,
              .article-content h4,
              .article-content h5,
              .article-content h6 {
                color: white !important;
                font-weight: bold;
                margin-top: 2.5rem;
                margin-bottom: 1.25rem;
              }
              
              .article-content h1 { font-size: 2.5rem; }
              .article-content h2 { font-size: 2rem; }
              .article-content h3 { font-size: 1.625rem; }
              .article-content h4 { font-size: 1.375rem; }
              
              .article-content p {
                color: white !important;
                margin-bottom: 1.75rem;
                line-height: 1.9;
              }
              
              .article-content a {
                color: #60a5fa !important;
                text-decoration: underline;
              }
              
              .article-content a:hover {
                color: #93c5fd !important;
              }
              
              .article-content strong,
              .article-content b {
                color: white !important;
                font-weight: 600;
              }
              
              .article-content ul,
              .article-content ol {
                color: white !important;
                margin-left: 2rem;
                margin-bottom: 1.75rem;
              }
              
              .article-content li {
                color: white !important;
                margin-bottom: 0.75rem;
              }
              
              .article-content blockquote {
                color: white !important;
                border-left: 4px solid #3b82f6;
                padding-left: 1.5rem;
                margin: 2rem 0;
                font-style: italic;
                font-size: 1.125rem;
              }
              
              .article-content code {
                color: white !important;
                background-color: rgba(51, 65, 85, 0.6);
                padding: 0.25rem 0.5rem;
                border-radius: 0.375rem;
                font-size: 0.9em;
                font-family: 'Courier New', monospace;
              }
              
              .article-content pre {
                background-color: rgba(51, 65, 85, 0.6);
                padding: 1.5rem;
                border-radius: 0.75rem;
                overflow-x: auto;
                margin-bottom: 2rem;
                border: 1px solid rgba(148, 163, 184, 0.2);
              }
              
              .article-content pre code {
                background-color: transparent;
                padding: 0;
              }
              
              .article-content table {
                color: white !important;
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 2rem;
                border: 1px solid #475569;
              }
              
              .article-content th,
              .article-content td {
                color: white !important;
                border: 1px solid #475569;
                padding: 0.875rem;
                text-align: left;
              }
              
              .article-content th {
                background-color: rgba(51, 65, 85, 0.6);
                font-weight: 600;
              }
              
              .article-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.75rem;
                margin: 2rem 0;
              }
            `}</style>
          </article>

          {/* Kommentar-Bereich */}
          <div className="border-t border-slate-600 pt-12">
            <h3 className="text-3xl font-bold text-white mb-8">
              Diskussion ({comments[currentPost.id]?.length || 0})
            </h3>

            {/* Bestehende Kommentare */}
            {comments[currentPost.id] && comments[currentPost.id].length > 0 && (
              <div className="space-y-5 mb-10">
                {comments[currentPost.id].map((comment) => (
                  <div key={comment.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">{comment.author_name}</p>
                        <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-white leading-relaxed ml-14">{comment.comment_text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Kommentar-Formular */}
            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
              <h4 className="font-bold text-white mb-6 text-xl">Kommentar verfassen</h4>
              <form className="space-y-5">
                <input
                  type="text"
                  value={commentForm[currentPost.id]?.name || ""}
                  onChange={(e) => updateCommentForm(currentPost.id, "name", e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-gray-400 text-base"
                  placeholder="Dein Name"
                />
                
                <div className="relative">
                  <textarea
                    value={commentForm[currentPost.id]?.text || ""}
                    onChange={(e) => updateCommentForm(currentPost.id, "text", e.target.value)}
                    rows={5}
                    className="w-full px-5 py-3.5 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-white placeholder-gray-400 text-base"
                    placeholder="Dein Kommentar..."
                  />
                  
                  {/* Emoji-Button */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))}
                      className="text-2xl hover:scale-110 transition-transform bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-600"
                      title="Emoji hinzufügen"
                    >
                      😊
                    </button>
                  </div>
                  
                  {/* Emoji-Picker */}
                  {showEmojiPicker[currentPost.id] && (
                    <div className="absolute bottom-16 right-0 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-2xl z-10 max-w-xs">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white text-sm font-semibold">Emoji auswählen</span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker((prev) => ({ ...prev, [currentPost.id]: false }))}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                        {EMOJIS.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addEmoji(currentPost.id, emoji)}
                            className="text-2xl hover:bg-slate-700 rounded p-1.5 transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={(e) => handleCommentSubmit(currentPost.id, e)}
                  disabled={submitting === currentPost.id}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-lg font-semibold transition text-base"
                >
                  {submitting === currentPost.id ? "Wird gesendet..." : "Kommentar absenden"}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700 mt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2026 Cardano Research Journal. Alle Rechte vorbehalten.
              </p>
              <div className="flex items-center gap-6">
                <a href="/admin/login" className="text-gray-400 hover:text-white text-sm transition">
                  Admin
                </a>
                <a href="/impressum" className="text-gray-400 hover:text-white text-sm transition">
                  Impressum
                </a>
                <a href="/datenschutz" className="text-gray-400 hover:text-white text-sm transition">
                  Datenschutz
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ÜBERSICHTS-SEITE (Artikel-Grid)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-600 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0">
                <svg viewBox="0 0 375 346.5" className="w-full h-full">
                  <g fill="#3B82F6">
                    <circle cx="113.5" cy="172.1" r="10.7"/>
                    <circle cx="113.5" cy="137.4" r="10.7"/>
                    <circle cx="147.9" cy="154.7" r="10.7"/>
                    <circle cx="182.4" cy="172.1" r="10.7"/>
                    <circle cx="216.8" cy="154.7" r="10.7"/>
                    <circle cx="251.3" cy="172.1" r="10.7"/>
                    <circle cx="251.3" cy="137.4" r="10.7"/>
                    <circle cx="147.9" cy="206.8" r="10.7"/>
                    <circle cx="182.4" cy="224.1" r="10.7"/>
                    <circle cx="216.8" cy="206.8" r="10.7"/>
                    <circle cx="147.9" cy="102.7" r="10.7"/>
                    <circle cx="182.4" cy="85.4" r="10.7"/>
                    <circle cx="216.8" cy="102.7" r="10.7"/>
                    <circle cx="182.4" cy="137.4" r="8"/>
                    <circle cx="182.4" cy="206.8" r="8"/>
                    <circle cx="113.5" cy="206.8" r="8"/>
                    <circle cx="251.3" cy="206.8" r="8"/>
                    <circle cx="113.5" cy="102.7" r="8"/>
                    <circle cx="251.3" cy="102.7" r="8"/>
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CARDANO <span className="font-light">Research Journal</span></h1>
              </div>
            </div>

            {/* Live Preisticker */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-1.5">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-wide">ADA</span>
                {prices.ada ? (
                  <>
                    <span className="text-white text-sm font-semibold">€{prices.ada.eur.toFixed(4)}</span>
                    <span className={`text-xs font-medium ${prices.ada.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {prices.ada.change >= 0 ? "▲" : "▼"} {Math.abs(prices.ada.change).toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">Lädt...</span>
                )}
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-1.5">
                <span className="text-purple-400 font-bold text-xs uppercase tracking-wide">NIGHT</span>
                {prices.night ? (
                  <>
                    <span className="text-white text-sm font-semibold">€{prices.night.eur.toFixed(4)}</span>
                    <span className={`text-xs font-medium ${prices.night.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {prices.night.change >= 0 ? "▲" : "▼"} {Math.abs(prices.night.change).toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">Lädt...</span>
                )}
              </div>

              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" title="Live" />
            </div>

          </div>
        </div>
      </header>

      {/* Main Content - Card Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cardano Deep Dives: Daten, Analysen, Insights
          </h2>
          <p className="text-gray-200 text-lg">
            Unabhängige Analysen zu On-Chain-Daten, Tokenomics und Risiko.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-300 text-xl">Noch keine Artikel vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPost(post.id)}
              >
                <div className="p-7">
                  <div className="mb-4">
                    <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
                      Forschung
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-gray-300 text-xs">
                      <span>{getReadingTime(post.content)} Minuten Lesezeit</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition leading-tight line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-200 text-sm leading-relaxed mb-5 line-clamp-3">
                    {getTextPreview(post.content, 150)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                    <span className="text-gray-300 text-xs">
                      {formatDate(post.created_at)}
                    </span>
                    <span className="text-blue-400 text-sm font-semibold group-hover:gap-2 flex items-center transition-all">
                      Weiterlesen
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Cardano Research Journal. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <a href="/admin/login" className="text-gray-400 hover:text-white text-sm transition">
                Admin
              </a>
              <a href="/impressum" className="text-gray-400 hover:text-white text-sm transition">
                Impressum
              </a>
              <a href="/datenschutz" className="text-gray-400 hover:text-white text-sm transition">
                Datenschutz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}