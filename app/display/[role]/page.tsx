"use client";

import { useEffect, useRef, useState } from "react";

type Order = {
  id: string;
  name: string;
  status: "waiting" | "serving" | "done";
};

export default function Page({ params }: { params: { role: string } }) {
  const [nowServing, setNowServing] = useState<Order | null>(null);
  const [queue, setQueue] = useState<Order[]>([]);
  const prevServing = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?station=${params.role}`, {
        cache: "no-store",
      });
      const data: Order[] = await res.json();

      const serving = data.find((o) => o.status === "serving") || null;
      const waiting = data.filter((o) => o.status === "waiting");

      if (serving && prevServing.current !== serving.id) {
        prevServing.current = serving.id;
        audioRef.current?.play().catch(() => {});
      }

      setNowServing(serving);
      setQueue(waiting);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, [params.role]);

  return (
    <div style={styles.container}>
      {/* LOGO */}
      <img src="/logo-v2.png" style={styles.logo} />

      {/* TITLE */}
      <h1 style={styles.title}>STREAMS STUDIO</h1>
      <div style={styles.station}>TOGA STATION</div>

      {/* NOW SERVING */}
      <div style={styles.card}>
        <div style={styles.label}>NOW SERVING</div>
        <div style={styles.name}>
          {nowServing?.name || "— — —"}
        </div>
      </div>

      {/* QUEUE */}
      <div style={styles.queue}>
        <div style={styles.upNext}>UP NEXT</div>
        {queue.slice(0, 3).map((q, i) => (
          <div key={q.id} style={styles.queueItem}>
            #{String(i + 1).padStart(3, "0")} {q.name}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    background: "black",
    color: "white",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 140,
    marginBottom: 20,
  },

  title: {
    fontSize: "3rem",
    letterSpacing: "0.4rem",
  },

  station: {
    opacity: 0.6,
    marginBottom: 30,
  },

  card: {
    background: "#145a3b",
    padding: "40px 80px",
    borderRadius: 25,
    marginBottom: 30,
  },

  label: {
    opacity: 0.7,
    textAlign: "center",
  },

  name: {
    fontSize: "2.5rem",
    textAlign: "center",
    marginTop: 10,
  },

  queue: {
    textAlign: "center",
  },

  upNext: {
    opacity: 0.6,
    marginBottom: 10,
  },

  queueItem: {
    margin: 5,
    fontSize: "1.2rem",
  },
};