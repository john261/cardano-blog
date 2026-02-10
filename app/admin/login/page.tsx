"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = "https://gzxyhwhlsxcqjuinjjlg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eHlod2hsc3hjcWp1aW5qamxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjIzMTEsImV4cCI6MjA4NjEzODMxMX0.XtBANUch1vkrrSMTy-V9FELtjH56lz6ostPOmCACxjk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("🔵 Login wird versucht mit:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("🔵 Login Antwort - Data:", data);
    console.log("🔵 Login Antwort - Error:", error);

    if (error) {
      console.log("🔴 Login fehlgeschlagen:", error.message);
      setError("Login fehlgeschlagen: " + error.message);
      setLoading(false);
    } else {
      console.log("✅ Login erfolgreich! Weiterleitung zu /admin");
      window.location.href = "/admin";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </button>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}