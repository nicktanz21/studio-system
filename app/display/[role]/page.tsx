"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DisplayPage() {
  const { role } = useParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [animate, setAnimate] = useState(false);

  const map: any = {
    toga: { ready: "toga_ready", done: "toga_done" },
    casual: { ready: "casual_ready", done: "casual_done" },
    family: { ready: "family_ready", done: "family_done" },
    alampay: { ready: "alampay_ready", done: "alampay_done" }
  };

  const f = map[role as string];

  const playSound = () => {
    const audio = new Audio("/alert.mp3");
    audio.play().catch(() => {});
  };

  const load = async () => {
    const res = await fetch("/api/orders");
    const json = await res.json();

    const filtered = (json.data || [])
      .filter((o: any) => !o[f.done])
      .sort((a: any, b: any) => a.id.localeCompare(b.id));

    setOrders(filtered);

    const current = filtered.find((o: any) => o[f.ready]);

    if (current && current.name !== currentName) {
      setCurrentName(current.name);
      setAnimate(true);
      playSound();
      setTimeout(() => setAnimate(false), 700);
    }
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, []);

  const current = orders.find((o) => o[f.ready]);
  const nextList = orders.filter((o) => !o[f.ready]).slice(0, 4);

  return (
    <div style={styles.wrapper}>
      
      {/* BACKGROUND GLOW */}
      <div style={styles.light} />

      {/* 🔝 HEADER (CENTERED) */}
      <div style={styles.header}>
        <img src="/logo.png" style={styles.logo} />

        <h1 style={styles.brand}>
          STREAMS STUDIO
        </h1>
      </div>

      {/* STATION */}
      <div style={styles.station}>
        {role?.toString().toUpperCase()} STATION
      </div>

      {/* NOW SERVING */}
      <div
        style={{
          ...styles.card,
          ...(animate ? styles.cardActive : {})
        }}
      >
        <div style={styles.label}>NOW SERVING</div>

        <div style={styles.name}>
          {current?.name || (
            <span style={{ opacity: 0.4, letterSpacing: 10 }}>
              • • •
            </span>
          )}
        </div>
      </div>

      {/* NEXT */}
      <div style={styles.nextSection}>
        <div style={styles.labelSmall}>UP NEXT</div>

        {nextList.length === 0 ? (
          <div style={{ opacity: 0.3 }}>Waiting for queue...</div>
        ) : (
          nextList.map((o, i) => (
            <div key={o.id} style={styles.row}>
              <span>#{(i + 1).toString().padStart(3, "0")}</span>
              <span>{o.name}</span>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        Please prepare when your name is called
      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    height: "100vh",
    background: "#000",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Segoe UI",
    textAlign: "center",
    position: "relative",
    overflow: "hidden"
  },

  light: {
    position: "absolute",
    width: "120%",
    height: "120%",
    background:
      "radial-gradient(circle at center, rgba(34,197,94,0.25), transparent 60%)",
    filter: "blur(120px)",
    animation: "pulse 6s infinite"
  },

  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5vh"
  },

  logo: {
    height: "14vh",   // 🔥 BIG + SCALES
    maxHeight: 160,
    objectFit: "contain",
    marginBottom: "1.5vh"
  },

  brand: {
    fontSize: "5.5vh",
    letterSpacing: "0.8vh",
    fontWeight: 300
  },

  station: {
    marginBottom: "2vh",
    opacity: 0.6,
    letterSpacing: "0.3vh"
  },

  card: {
    padding: "60px 140px",
    borderRadius: 30,
    background: "rgba(6,95,70,0.9)",
    boxShadow: "0 0 30px rgba(34,197,94,0.5)",
    transition: "all 0.3s ease"
  },

  cardActive: {
    boxShadow: "0 0 100px #22c55e",
    transform: "scale(1.05)"
  },

  label: {
    opacity: 0.6
  },

  name: {
    fontSize: "7vh",
    fontWeight: "bold",
    marginTop: 10
  },

  nextSection: {
    marginTop: "5vh",
    width: "50%"
  },

  labelSmall: {
    opacity: 0.5,
    marginBottom: 10
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 18px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    marginTop: 8,
    fontSize: "2.2vh"
  },

  footer: {
    position: "absolute",
    bottom: 20,
    opacity: 0.3
  }
};