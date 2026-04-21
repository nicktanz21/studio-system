"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [q, setQ] = useState("");

  // ✅ PROPER AUTH CHECK
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");

    if (!isAuth) {
      router.replace("/admin/login"); // 🔥 use replace
    } else {
      setAuthorized(true);
      load();
    }

    setChecked(true);
  }, []);

  const load = async () => {
    const res = await fetch("/api/orders");
    const json = await res.json();
    setOrders(json.data || []);
  };

  const resetOrder = async (id: string) => {
    await supabase
      .from("orders")
      .update({
        toga_ready: false,
        toga_done: false,
        casual_ready: false,
        casual_done: false,
        family_ready: false,
        family_done: false,
        alampay_ready: false,
        alampay_done: false
      })
      .eq("id", id);

    load();
  };

  const deleteOrder = async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
    load();
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    router.replace("/admin/login");
  };

  const filtered = orders.filter((o) =>
    `${o.name} ${o.id}`.toLowerCase().includes(q.toLowerCase())
  );

  const status = (o: any) => {
    if (o.toga_ready && !o.toga_done) return "TOGA";
    if (o.casual_ready && !o.casual_done) return "CASUAL";
    if (o.family_ready && !o.family_done) return "FAMILY";
    if (o.alampay_ready && !o.alampay_done) return "ALAMPAY";
    return "WAITING";
  };

  // 🚫 BLOCK RENDER UNTIL CHECKED
  if (!checked) return null;

  // 🚫 BLOCK IF NOT AUTHORIZED
  if (!authorized) return null;

  return (
    <div
      style={{
        padding: 20,
        background: "#000",
        color: "white",
        minHeight: "100vh"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>ADMIN PANEL</h2>

        <button
          onClick={logout}
          style={{
            background: "red",
            padding: 10,
            border: "none",
            borderRadius: 6
          }}
        >
          Logout
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search name or ID..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          margin: "20px 0",
          borderRadius: 8,
          border: "none"
        }}
      />

      {/* LIST */}
      {filtered.map((o) => (
        <div
          key={o.id}
          style={{
            background: "#111",
            padding: 12,
            borderRadius: 10,
            marginBottom: 10
          }}
        >
          <strong>{o.name}</strong>

          <div style={{ fontSize: 12, opacity: 0.6 }}>
            {o.id}
          </div>

          <div style={{ color: "#00ff9c", marginTop: 6 }}>
            STATUS: {status(o)}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              onClick={() => resetOrder(o.id)}
              style={{
                flex: 1,
                padding: 8,
                background: "#3b82f6",
                border: "none",
                borderRadius: 6
              }}
            >
              RESET
            </button>

            <button
              onClick={() => deleteOrder(o.id)}
              style={{
                flex: 1,
                padding: 8,
                background: "#ef4444",
                border: "none",
                borderRadius: 6
              }}
            >
              DELETE
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}