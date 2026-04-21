"use client";

import { useEffect, useRef, useState } from "react";

type Order = {
  id: string;
  name: string;
  status: "waiting" | "serving" | "done";
  station?: string;
  created_at?: string;
};

export default function DisplayPage({
  params,
}: {
  params: { role: string };
}) {
  const { role } = params;

  const [nowServing, setNowServing] = useState<Order | null>(null);
  const [queue, setQueue] = useState<Order[]>([]);
  const prevServingRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load audio once
  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
  }, []);

  // Fetch data (adjust API to your backend)
  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?station=${role}`, {
        cache: "no-store",
      });
      const data: Order[] = await res.json();

      const serving = data.find((o) => o.status === "serving") || null;
      const waiting = data.filter((o) => o.status === "waiting");

      // Play sound if changed
      if (serving && prevServingRef.current !== serving.id) {
        prevServingRef.current = serving.id;
        audioRef.current?.play().catch(() => {});
      }

      setNowServing(serving);
      setQueue(waiting);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Poll every 2s
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <div style={styles.container}>
      {/* BACKGROUND GLOW */}
      <div style={styles.bgGlow} />

      {/* HEADER */}
      <div style={styles.header}>
        <img src="/LOGO.png" alt="logo" style={styles.logo} />
        <h1 style={styles.title}>STREAMS STUDIO</h1>
        <div style={styles.station}>TOGA STATION</div>
      </div>

      {/* NOW SERVING */}
      <div style={styles.card}>
        <div style={styles.label}>NOW SERVING</div>
        <div style={styles.name}>
          {nowServing?.name || "— — —"}
        </div>
      </div>

      {/* UP NEXT */}
      <div style={styles.nextSection}>
        <div style={styles.nextLabel}>UP NEXT</div>
        <div style={styles.queue}>
          {queue.slice(0, 3).map((q, i) => (
            <div key={q.id} style={styles.queueItem}>
              {i + 1}. {q.name}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        streams studio • premium experience
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    overflow: "hidden",
  },

  bgGlow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(0,255,150,0.2), transparent)",
    filter: "blur(120px)",
    zIndex: 0,
  },

  header: {
    textAlign: "center",
    marginBottom: 30,
    zIndex: 1,
  },

  logo: {
    width: 90,
    marginBottom: 10,
    opacity: 0.9,
  },

  title: {
    fontSize: "3rem",
    letterSpacing: "0.4rem",
    fontWeight: 300,
    margin: 0,
  },

  station: {
    opacity: 0.6,
    marginTop: 10,
    letterSpacing: "0.2rem",
  },

  card: {
    background: "#0f5132",
    padding: "50px 80px",
    borderRadius: 30,
    textAlign: "center",
    boxShadow: "0 0 60px rgba(0,255,150,0.3)",
    zIndex: 1,
    minWidth: 400,
  },

  label: {
    opacity: 0.7,
    marginBottom: 15,
    letterSpacing: "0.2rem",
  },

  name: {
    fontSize: "3rem",
    fontWeight: 600,
    letterSpacing: "0.1rem",
  },

  nextSection: {
    marginTop: 40,
    textAlign: "center",
    zIndex: 1,
  },

  nextLabel: {
    opacity: 0.6,
    marginBottom: 10,
    letterSpacing: "0.2rem",
  },

  queue: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  queueItem: {
    opacity: 0.85,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    opacity: 0.3,
    fontSize: 12,
    letterSpacing: "0.2rem",
  },
};