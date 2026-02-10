"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = "https://gzxyhwhlsxcqjuinjjlg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eHlod2hsc3hjcWp1aW5qamxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjIzMTEsImV4cCI6MjA4NjEzODMxMX0.XtBANUch1vkrrSMTy-V9FELtjH56lz6ostPOmCACxjk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setUser(session.user);
        loadPosts();
      }
    });
  }, [router]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [editingPost]);

  async function loadPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
  }

  function applyFormat(command: string, value?: string) {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }

  function handleEditorInput() {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Fehler: Nicht angemeldet");
      setLoading(false);
      return;
    }

    if (editingPost) {
      const { error } = await supabase
        .from("posts")
        .update({ title, content })
        .eq("id", editingPost.id);

      if (error) {
        setMessage("Fehler: " + error.message);
      } else {
        setMessage("✅ Post erfolgreich aktualisiert!");
        setTitle("");
        setContent("");
        if (editorRef.current) editorRef.current.innerHTML = "";
        setEditingPost(null);
        setShowPreview(false);
        loadPosts();
      }
    } else {
      const { error } = await supabase
        .from("posts")
        .insert([{ 
          title, 
          content,
          user_id: user.id
        }]);

      if (error) {
        setMessage("Fehler: " + error.message);
      } else {
        setMessage("✅ Post erfolgreich erstellt!");
        setTitle("");
        setContent("");
        if (editorRef.current) editorRef.current.innerHTML = "";
        setShowPreview(false);
        loadPosts();
      }
    }
    setLoading(false);
  }

  async function handleDelete(postId: string, postTitle: string) {
    const confirmed = window.confirm(
      `Bist du sicher, dass du den Post "${postTitle}" löschen möchtest?\n\nDieser Vorgang kann nicht rückgängig gemacht werden!`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("🔄 Lösche Post...");

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Löschen fehlgeschlagen:", error);
      setMessage("❌ Fehler beim Löschen: " + error.message);
      alert("Fehler beim Löschen: " + error.message + "\n\nDetails siehe Konsole (F12)");
    } else {
      setMessage("✅ Post erfolgreich gelöscht!");
      await loadPosts();
      setTimeout(() => setMessage(""), 3000);
    }
    
    setLoading(false);
  }

  function handleEdit(post: Post) {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = post.content;
    }
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingPost(null);
    setTitle("");
    setContent("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setShowPreview(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Lade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Admin Panel
              </h1>
              <p className="mt-1 text-gray-600">
                Angemeldet als: <span className="font-semibold">{user.email}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                🏠 Zum Blog
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                🚪 Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {editingPost && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 font-semibold">
                  ✏️ Bearbeitungsmodus aktiv
                </p>
                <button
                  onClick={cancelEdit}
                  className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
                >
                  Abbrechen und neuen Post erstellen
                </button>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {editingPost ? "✏️ Post bearbeiten" : "✍️ Neuen Post erstellen"}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titel
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="z.B. Cardano News Update..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/100 Zeichen
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Inhalt - Formatierungs-Editor
                </label>
                
                <div className="flex flex-wrap gap-1 mb-2 p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-300 shadow-sm">
                  <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded font-bold text-sm transition shadow-sm hover:border-blue-400"
                    title="Fett (Strg+B)"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded italic text-sm transition shadow-sm hover:border-blue-400"
                    title="Kursiv (Strg+I)"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('underline')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded underline text-sm transition shadow-sm hover:border-blue-400"
                    title="Unterstrichen (Strg+U)"
                  >
                    U
                  </button>
                  <div className="w-px bg-gray-400 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', '<h2>')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded text-sm font-bold transition shadow-sm hover:border-blue-400"
                    title="Große Überschrift"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', '<h3>')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded text-sm font-semibold transition shadow-sm hover:border-blue-400"
                    title="Unterüberschrift"
                  >
                    H3
                  </button>
                  <div className="w-px bg-gray-400 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => applyFormat('insertUnorderedList')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded text-sm transition shadow-sm hover:border-blue-400"
                    title="Aufzählungsliste"
                  >
                    • Liste
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('insertOrderedList')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded text-sm transition shadow-sm hover:border-blue-400"
                    title="Nummerierte Liste"
                  >
                    1. Liste
                  </button>
                  <div className="w-px bg-gray-400 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => applyFormat('removeFormat')}
                    className="px-3 py-2 bg-white hover:bg-red-100 border border-gray-300 rounded text-sm text-red-600 transition shadow-sm hover:border-red-400"
                    title="Formatierung entfernen"
                  >
                    ✕ Clear
                  </button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="w-full min-h-[500px] px-5 py-4 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 overflow-y-auto shadow-inner"
                  style={{ maxHeight: '700px' }}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>💡</span>
                  <span>Nutze die Toolbar-Buttons oder Tastenkombinationen (Strg+B, Strg+I, Strg+U)</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
                >
                  {showPreview ? "❌ Vorschau schließen" : "👁️ Vorschau anzeigen"}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md disabled:cursor-not-allowed"
                >
                  {loading ? "⏳ Wird gespeichert..." : editingPost ? "💾 Änderungen speichern" : "📤 Post veröffentlichen"}
                </button>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-center font-semibold ${
                    message.includes("✅")
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                👁️ Live-Vorschau
              </h2>
            </div>

            <div className="p-8 overflow-y-auto" style={{ maxHeight: '800px' }}>
              {!showPreview ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">👈 Klicke auf "Vorschau anzeigen"</p>
                  <p className="text-sm">um zu sehen, wie dein Post aussehen wird</p>
                </div>
              ) : (
                <article className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {title || "Dein Titel erscheint hier..."}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      📅 {formatDate(new Date().toISOString())}
                    </p>
                  </div>

                  <div className="px-6 py-6">
                    <div 
                      className="prose prose-lg max-w-none text-gray-800"
                      style={{
                        lineHeight: '1.8',
                      }}
                      dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400 italic'>Dein formatierter Inhalt erscheint hier...</p>" }}
                    />
                  </div>

                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      💬 Kommentare (0)
                    </h4>
                    <p className="text-gray-500 text-sm italic">
                      Noch keine Kommentare. Sei der Erste!
                    </p>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📚 Meine Posts verwalten ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">Noch keine Posts vorhanden.</p>
              <p className="text-sm mt-2">Erstelle deinen ersten Post oben!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 break-words">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        📅 {formatDate(post.created_at)}
                      </p>
                      <div 
                        className="text-gray-600 line-clamp-2 break-all"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap"
                      >
                        ✏️ Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap"
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            💡 Formatierungs-Tipps für professionelle Posts:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-800">
            <div className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Fett</strong> für wichtige Begriffe verwenden</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✅</span>
              <span><em>Kursiv</em> für Betonungen nutzen</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✅</span>
              <span>Überschriften (H2, H3) für Struktur</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✅</span>
              <span>Listen für übersichtliche Aufzählungen</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✅</span>
              <span>Vorschau vor dem Veröffentlichen prüfen</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✅</span>
              <span>Kurze Absätze für bessere Lesbarkeit</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}