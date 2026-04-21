"use client";

import { useEffect, useState } from "react";

const stations = [
  { key: "toga", label: "TOGA" },
  { key: "casual", label: "CASUAL" },
  { key: "family", label: "FAMILY" },
  { key: "alampay", label: "ALAMPAY" }
];

const fieldMap: any = {
  toga: { ready: "toga_ready", done: "toga_done" },
  casual: { ready: "casual_ready", done: "casual_done" },
  family: { ready: "family_ready", done: "family_done" },
  alampay: { ready: "alampay_ready", done: "alampay_done" }
};

export default function Dashboard() {
  const [data, setData] = useState<any>({});

  const load = async () => {
    const res = await fetch("/api/orders");
    const json = await res.json();
    const orders = json.data || [];

    const result: any = {};

    stations.forEach((s) => {
      const f = fieldMap[s.key];

      const queue = orders
        .filter((o: any) => o[f.ready] && !o[f.done])
        .sort((a: any, b: any) => a.id.localeCompare(b.id));

      result[s.key] = {
        current: queue[0] || null,
        next: queue[1] || null
      };
    });

    setData(result);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#000",
        color: "white",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 20,
        padding: 20,
        fontFamily: "Segoe UI"
      }}
    >
      {stations.map((s) => {
        const stationData = data[s.key] || {};
        const current = stationData.current;
        const next = stationData.next;

        return (
          <div
            key={s.key}
            style={{
              background: "#111",
              borderRadius: 20,
              padding: 30,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 0 30px rgba(0,255,150,0.1)"
            }}
          >
            {/* TITLE */}
            <h2 style={{ marginBottom: 20 }}>
              {s.label} STATION
            </h2>

            {/* NOW SERVING */}
            <div style={{ textAlign: "center" }}>
              <p style={{ opacity: 0.6 }}>NOW SERVING</p>
              <h1
                style={{
                  fontSize: 36,
                  color: "#00ff9c",
                  textAlign: "center"
                }}
              >
                {current?.name || "---"}
              </h1>
            </div>

            {/* NEXT */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <p style={{ opacity: 0.5 }}>NEXT</p>
              <h3>
                {next?.name || "---"}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}