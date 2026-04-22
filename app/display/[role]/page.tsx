"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
const [orders, setOrders] = useState<any[]>([]);

type Order = {
  id: string;
  name: string;
  queue_number: number;
  step: string;
  status: "waiting" | "serving" | "done";
};

export default function DisplayPage() {
  const params = useParams();
  const role = params.role as string;

  const [nowServing, setNowServing] = useState<Order | null>(null);
  const [queue, setQueue] = useState<Order[]>([]);
  const prevId = useRef<string | null>(null);

  const formatQueue = (num?: number) =>
    num ? "#" + String(num).padStart(3, "0") : "---";

  // 🔊 Voice (stable)
  const speak = (text: string) => {
    if (typeof window === "undefined") return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1;

    window.speechSynthesis.cancel(); // prevent stacking
    window.speechSynthesis.speak(utter);
  };

  // 🔥 FETCH
  const fetchOrders = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("booking_date", today)
    .order("queue_number", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  if (data) setOrders(data);


    const serving = data?.find((o) => o.status === "serving");
const waiting = data?.filter((o) => o.status === "waiting");

setNowServing(serving);
setQueue(waiting);
  };

  // 🔁 REALTIME
  useEffect(() => {
  fetchOrders();

  const interval = setInterval(() => {
    fetchOrders();
  }, 3000); // every 3 seconds

  return () => clearInterval(interval);
}, []);

  return (
    <div style={styles.container}>
      {/* LOGO */}
      <img src="/logo.png" style={styles.logo} />

      {/* TITLE */}
      <div style={styles.header}>
        <h1 style={styles.title}>STREAMS STUDIO</h1>
        <div style={styles.station}>
          {role?.toUpperCase()} STATION
        </div>
      </div>

      {/* NOW SERVING */}
      <div style={styles.card}>
        <div style={styles.label}>NOW SERVING</div>

        <div style={styles.number}>
          {formatQueue(nowServing?.queue_number)}
        </div>

        <div style={styles.name}>
          {nowServing?.name || "WAITING..."}
        </div>
      </div>

      {/* QUEUE */}
      <div style={styles.queue}>
        <div style={styles.upNext}>UP NEXT</div>

        {queue.length === 0 && (
          <div style={{ opacity: 0.5 }}>No queue</div>
        )}

        {queue.slice(0, 3).map((q) => (
          <div key={q.id} style={styles.queueItem}>
            {formatQueue(q.queue_number)} — {q.name}
          </div>
        ))}
      </div>

      {/* 🔥 CSS ANIMATION FIX */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

/* 🎨 PREMIUM STYLES */
const styles: any = {
  container: {
    height: "100vh",
    background: "radial-gradient(circle, #0b2e1f, black)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 120,
    marginBottom: 20,
    animation: "float 4s ease-in-out infinite",
    filter: "drop-shadow(0 0 25px rgba(0,255,150,0.6))",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: "2.8rem",
    letterSpacing: "0.35rem",
  },

  station: {
    opacity: 0.6,
    fontSize: "0.9rem",
  },

  card: {
    background: "#111",
    padding: "45px 90px",
    borderRadius: 20,
    textAlign: "center",
    marginBottom: 30,
    boxShadow: "0 0 60px rgba(0,255,150,0.25)",
  },

  label: {
    opacity: 0.6,
    letterSpacing: 1,
  },

  number: {
    fontSize: "4.5rem",
    fontWeight: "bold",
    color: "#00ff9c",
    margin: "10px 0",
  },

  name: {
    fontSize: "1.5rem",
    opacity: 0.8,
  },

  queue: {
    textAlign: "center",
  },

  upNext: {
    opacity: 0.6,
    marginBottom: 10,
  },

  queueItem: {
    fontSize: "1.3rem",
    margin: 6,
  },
};