"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  name: string;
  service: string;
  step: string;
  status: "waiting" | "serving" | "done";
};

export default function StationPage() {
  const params = useParams();
  const role = params.role as string;

  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("step", role) // ✅ FIXED
      .order("created_at", { ascending: true });

    if (!error) setOrders(data || []);
  };

  const serveNext = async () => {
    const current = orders.find((o) => o.status === "serving");

    if (current) {
      const flow: any = {
        intake: "shoot",
        shoot: "select",
        select: "edit",
        edit: "print",
        print: "done",
      };

      const nextStep = flow[current.step];

      await supabase
        .from("orders")
        .update({
          status: "waiting",
          step: nextStep,
        })
        .eq("id", current.id);
    }

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
      .channel("station-" + role) // ✅ FIXED
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]); // ✅ FIXED

  return (
    <div style={{ padding: 40, background: "black", minHeight: "100vh", color: "white" }}>
      <h1>{role?.toUpperCase()} STATION</h1>

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
        NEXT
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
            {o.name} — {o.service} — {o.status}
          </div>
        ))}
      </div>
    </div>
  );
}