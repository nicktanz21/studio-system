"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("toga");
  const router = useRouter();

  const passwords: any = {
    toga: "toga123",
    casual: "casual123",
    family: "family123",
    alampay: "alampay123"
  };

  const login = () => {
    if (password === passwords[role]) {
      localStorage.setItem("staff_role", role);
      router.replace(`/station/${role}`);
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div style={{ width: 300 }}>
        <h2>Staff Login</h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        >
          <option value="toga">Toga</option>
          <option value="casual">Casual</option>
          <option value="family">Family</option>
          <option value="alampay">Alampay</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        />

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 10,
            background: "green",
            border: "none"
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}