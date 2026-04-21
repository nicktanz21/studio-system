"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  name: string;
  status: "waiting" | "serving" | "done";
  station: string;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setOrders(data);
  };

  // 🔥 MAIN LOGIC
  const serveNext = async () => {
    // 1. find current serving
    const current = orders.find((o) => o.status === "serving");

    if (current) {
      await supabase
        .from("orders")
        .update({ status: "done" })
        .eq("id", current.id);
    }

    // 2. find next waiting
    const next = orders.find((o) => o.status === "waiting");

    if (next) {
      await supabase
        .from("orders")
        .update({ status: "serving" })
        .eq("id", next.id);
    }
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
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  return (
    <div style={{ padding: 40, background: "black", minHeight: "100vh", color: "white" }}>
      <h1>ADMIN CONTROL</h1>

      <button
        onClick={serveNext}
        style={{
          padding: "15px 25px",
          background: "#145a3b",
          border: "none",
          borderRadius: 10,
          color: "white",
          cursor: "pointer",
        }}
      >
        NEXT CUSTOMER
      </button>

      <div style={{ marginTop: 30 }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              padding: 10,
              marginBottom: 10,
              background:
                o.status === "serving"
                  ? "#145a3b"
                  : o.status === "waiting"
                  ? "#222"
                  : "#555",
              borderRadius: 8,
            }}
          >
            {o.name} — {o.status} ({o.station})
          </div>
        ))}
      </div>
    </div>
  );
}