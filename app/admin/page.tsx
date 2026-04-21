"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  name: string;
  email: string;
  queue_number: number;
  step: string;
  status: "waiting" | "serving" | "done";
  selected: boolean;
  edited: boolean;
  printed: boolean;
  emailed: boolean;
  payment_status: string; // ✅ FIXED
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const formatQueue = (num?: number) =>
    num !== undefined ? "#" + String(num).padStart(3, "0") : "---";

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setOrders(data);
  };

  /* ================= ADD ================= */
  const addCustomer = async () => {
    if (!name) return alert("Enter name");

    const { data } = await supabase
      .from("orders")
      .select("queue_number")
      .order("queue_number", { ascending: false })
      .limit(1);

    const nextNumber = (data?.[0]?.queue_number || 0) + 1;

    await supabase.from("orders").insert({
      name,
      email,
      queue_number: nextNumber,
      step: "intake",
      status: "waiting",
      payment_status: "pending", // ✅ IMPORTANT
      selected: false,
      edited: false,
      printed: false,
      emailed: false,
    });

    setName("");
    setEmail("");
  };

  /* ================= FLAGS ================= */
  const updateFlag = async (id: string, field: string) => {
    await supabase
      .from("orders")
      .update({ [field]: true })
      .eq("id", id);
  };

  /* ================= PAYMENT ================= */
  const markPaid = async (id: string) => {
    await supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", id);
  };

  /* ================= NEXT ================= */
  const serveNext = async () => {
    const current = orders.find((o) => o.status === "serving");

    const flow: any = {
      intake: "toga",
      toga: "alampay",
      alampay: "family",
      family: "casual",
      casual: "select",
    };

    if (current) {
      const nextStep = flow[current.step];

      await supabase
        .from("orders")
        .update({ step: nextStep, status: "waiting" })
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

  /* ================= AUTO WORKFLOW ================= */
  const processWorkflow = async (list: Order[]) => {
    for (const o of list) {
      if (o.step === "select" && o.selected) {
        await supabase
          .from("orders")
          .update({ step: "edit" })
          .eq("id", o.id);
      }

      if (o.step === "edit" && o.edited) {
        await supabase
          .from("orders")
          .update({ step: "print" })
          .eq("id", o.id);
      }

      if (o.step === "print" && o.printed && !o.emailed) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: o.email,
            name: o.name,
            queue: o.queue_number,
          }),
        });

        await supabase
          .from("orders")
          .update({
            step: "done",
            status: "done",
            emailed: true,
          })
          .eq("id", o.id);
      }
    }
  };

  /* ================= REALTIME ================= */
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async () => {
          const { data } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: true });

          if (data) {
            setOrders(data);
            processWorkflow(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>STREAMS STUDIO</h1>

      {/* CONTROL */}
      <div style={styles.control}>
        <input
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={addCustomer} style={styles.addBtn}>
          ADD
        </button>
      </div>

      <button onClick={serveNext} style={styles.nextBtn}>
        NEXT CUSTOMER →
      </button>

      {/* LIST */}
      <div style={{ marginTop: 30 }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              ...styles.card,
              background:
                o.status === "serving"
                  ? "#145a3b"
                  : o.payment_status === "paid"
                  ? "#1a3d2f"
                  : "#222",
            }}
          >
            <div style={styles.row}>
              <div>
                <div style={styles.queue}>
                  {formatQueue(o.queue_number)}
                </div>
                <div style={styles.name}>{o.name}</div>
              </div>

              <div style={styles.status}>
                {o.step.toUpperCase()} • {o.status.toUpperCase()}
              </div>
            </div>

            {/* FLAGS */}
            <div style={styles.badges}>
              <span style={badge(o.selected)}>SELECTED</span>
              <span style={badge(o.edited)}>EDITED</span>
              <span style={badge(o.printed)}>PRINTED</span>
              <span style={badge(o.emailed)}>EMAILED</span>
            </div>

            {/* ACTIONS */}
            <div style={styles.actions}>
              <button onClick={() => updateFlag(o.id, "selected")}>
                SELECT
              </button>

              <button onClick={() => updateFlag(o.id, "edited")}>
                EDIT
              </button>

              <button onClick={() => updateFlag(o.id, "printed")}>
                PRINT
              </button>

              <button
                onClick={() => markPaid(o.id)}
                style={{
                  background:
                    o.payment_status === "paid" ? "#00ff9c" : "#444",
                  color:
                    o.payment_status === "paid" ? "black" : "white",
                }}
              >
                {o.payment_status === "paid" ? "PAID" : "MARK PAID"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: any = {
  container: {
    padding: 40,
    minHeight: "100vh",
    background: "radial-gradient(circle, #0b2e1f, black)",
    color: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 3,
  },
  control: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    width: 200,
  },
  addBtn: {
    padding: "10px 20px",
    background: "#00ff9c",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
  },
  nextBtn: {
    width: "100%",
    padding: 15,
    background: "#00ff9c",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
  },
  queue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00ff9c",
  },
  name: {
    fontSize: 16,
  },
  status: {
    opacity: 0.7,
  },
  badges: {
    marginTop: 10,
    display: "flex",
    gap: 10,
  },
  actions: {
    marginTop: 10,
    display: "flex",
    gap: 10,
  },
};

const badge = (active: boolean) => ({
  padding: "5px 10px",
  borderRadius: 6,
  background: active ? "#00ff9c" : "#444",
  color: active ? "black" : "#aaa",
  fontSize: 12,
});