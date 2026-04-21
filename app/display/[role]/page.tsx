"use client";

import { use } from "react";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

type Order = {
  id: string;
  name: string;
  status: "waiting" | "serving" | "done";
};

export default function Page({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  const [nowServing, setNowServing] = useState<Order | null>(null);
  const [queue, setQueue] = useState<Order[]>([]);
  const prevServing = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
  }, []);

  const fetchOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("station", role)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const serving = data.find((o) => o.status === "serving") || null;
  const waiting = data.filter((o) => o.status === "waiting");

  if (serving && prevServing.current !== serving.id) {
    prevServing.current = serving.id;
    audioRef.current?.play().catch(() => {});
  }

  setNowServing(serving);
  setQueue(waiting);
};

useEffect(() => {
  fetchOrders();

  const channel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        fetchOrders(); // 🔥 auto refresh when DB changes
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [params.role]);

  return (
    <div style={styles.container}>
      {/* ANIMATIONS */}
      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 10px rgba(0,255,150,0.2); }
          50% { box-shadow: 0 0 40px rgba(0,255,150,0.5); }
          100% { box-shadow: 0 0 10px rgba(0,255,150,0.2); }
        }
        `}
      </style>

      {/* LOGO */}
      <div style={styles.logoWrapper}>
        <img src="/logo-v2.png" style={styles.logo} />
      </div>

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
    background: "radial-gradient(circle at center, #0b2e1f, black)",
    color: "white",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  logoWrapper: {
    position: "relative",
    marginBottom: 20,
  },

  logo: {
    width: 140,
    animation: "float 4s ease-in-out infinite",
    filter: "drop-shadow(0 0 12px rgba(0,255,150,0.6))",
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
    animation: "pulse 2s infinite",
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

