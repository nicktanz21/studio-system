"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (password === "admin123") {
      localStorage.setItem("admin_auth", "true");
      router.replace("/admin");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#000",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI"
      }}
    >
      <div style={{ width: 300, textAlign: "center" }}>
        <h2>Admin Login</h2>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 10,
            borderRadius: 6,
            border: "none"
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            marginTop: 10,
            padding: 10,
            width: "100%",
            background: "#22c55e",
            border: "none",
            borderRadius: 6
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}