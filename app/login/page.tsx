"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      alert("Login failed. No session returned.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>STAFF LOGIN</h1>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: "100vh",
    background: "radial-gradient(circle at center, #0b2e1f, black)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 320,
    padding: 30,
    borderRadius: 16,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  title: {
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 1,
    color: "white",
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    outline: "none",
  },

  button: {
    padding: 12,
    borderRadius: 8,
    background: "#00ff9c",
    color: "black",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
};
