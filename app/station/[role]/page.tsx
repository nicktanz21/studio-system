"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StationPage() {
  const { role } = useParams();
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const map: any = {
    toga: { ready: "toga_ready", done: "toga_done" },
    casual: { ready: "casual_ready", done: "casual_done" },
    family: { ready: "family_ready", done: "family_done" },
    alampay: { ready: "alampay_ready", done: "alampay_done" }
  };

  const f = map[role as string];

  // 🔐 AUTH CHECK
  useEffect(() => {
    const savedRole = localStorage.getItem("staff_role");

    if (!savedRole || savedRole !== role) {
      router.replace("/station/login");
    } else {
      setChecked(true);
    }
  }, []);

  // 🔄 LOAD ORDERS
  const load = async () => {
    const res = await fetch("/api/orders");
    const json = await res.json();

    const filtered = (json.data || [])
      .filter((o: any) => !o[f.done])
      .sort((a: any, b: any) => a.id.localeCompare(b.id));

    setOrders(filtered);
  };

  useEffect(() => {
    if (!checked) return;

    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, [checked]);

  // 🔊 SOUND
  const playSound = () => {
    const audio = new Audio("/alert.mp3");
    audio.play().catch(() => {});
  };

  // 🔁 UPDATE + AUTO NEXT
  const update = async (id: string, field: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      body: JSON.stringify({ id, field })
    });

    if (field === f.done) {
      const next = orders.find((o) => !o[f.ready] && !o[f.done]);

      if (next) {
        await fetch("/api/orders", {
          method: "PUT",
          body: JSON.stringify({
            id: next.id,
            field: f.ready
          })
        });

        playSound(); // 🔊 alert next
      }
    }

    load();
  };

  const current = orders.find((o) => o[f.ready]);

  if (!checked) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "white",
        padding: 20,
        fontFamily: "Segoe UI"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ textTransform: "uppercase" }}>
          {role} station
        </h2>

        <button
          onClick={() => {
            localStorage.removeItem("staff_role");
            window.location.href = "/station/login";
          }}
          style={{
            background: "red",
            padding: 8,
            border: "none",
            borderRadius: 6
          }}
        >
          Logout
        </button>
      </div>

      {/* NOW SERVING */}
      <div
        style={{
          marginTop: 20,
          background: "#065f46",
          padding: 30,
          borderRadius: 12,
          textAlign: "center",
          transition: "all 0.3s"
        }}
      >
        <p style={{ opacity: 0.7 }}>NOW SERVING</p>
        <h1 style={{ fontSize: 36 }}>
          {current?.name || "---"}
        </h1>
      </div>

      {/* QUEUE LIST */}
      <div style={{ marginTop: 20 }}>
        {orders.map((o, i) => (
          <div
            key={o.id}
            style={{
              background: "#111",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              transition: "0.2s"
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>
                {i + 1}. {o.name}
              </strong>

              <span style={{ marginLeft: 10, opacity: 0.6 }}>
                {o[f.ready] ? "IN PROGRESS" : "WAITING"}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {!o[f.ready] && (
                <button
                  onClick={() => {
                    playSound();
                    update(o.id, f.ready);
                  }}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: "#f59e0b",
                    border: "none",
                    borderRadius: 8
                  }}
                >
                  CALL
                </button>
              )}

              {o[f.ready] && !o[f.done] && (
                <button
                  onClick={() => update(o.id, f.done)}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: "#22c55e",
                    border: "none",
                    borderRadius: 8
                  }}
                >
                  DONE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}