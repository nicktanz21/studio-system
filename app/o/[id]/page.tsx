"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [all, setAll] = useState<any[]>([]);

  // 🔁 Fetch BOTH: this user + all orders
  const fetchData = async () => {
    const res1 = await fetch(`/api/orders?id=${id}`);
    const json1 = await res1.json();

    const res2 = await fetch(`/api/orders`);
    const json2 = await res2.json();

    setData(json1.data);
    setAll(json2.data || []);
  };

  useEffect(() => {
    if (!id) return;

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <div style={{ padding: 20 }}>Loading...</div>;

  // 🔥 QUEUE CALCULATOR
  const getQueueStatus = (field: string) => {
    const pending = all.filter(o => !o[field]);

    const index = pending.findIndex(o => o.id === data.id);

    if (index === -1) return "DONE";
    if (index === 0) return "NOW SERVING";
    if (index === 1) return "NEXT";

    return `WAITING (${index} ahead)`;
  };

  const rows = [
    { label: "TOGA", field: "toga_done" },
    { label: "CASUAL", field: "casual_done" },
    { label: "FAMILY", field: "family_done" },
    { label: "ALAMPAY", field: "alampay_done" }
  ];

  return (
    <div style={{
      padding: 20,
      color: "white",
      maxWidth: 400,
      margin: "auto"
    }}>
      <h2>{data.name}</h2>
      <p style={{ opacity: 0.7 }}>ID: {data.id}</p>

      <hr style={{ margin: "15px 0" }} />

      {rows.map(item => {
        const done = data[item.field];
        const queue = getQueueStatus(item.field);

        return (
          <div key={item.field} style={{
            background: "#111",
            padding: 15,
            borderRadius: 10,
            marginBottom: 12
          }}>
            <div style={{ fontWeight: "bold" }}>
              {item.label}
            </div>

            <div style={{
              color: done ? "#22c55e" : "#f59e0b",
              marginTop: 5
            }}>
              {done ? "DONE" : queue}
            </div>
          </div>
        );
      })}
    </div>
  );
}