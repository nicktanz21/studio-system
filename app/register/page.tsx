"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState("");
  const [slot, setSlot] = useState("");
  
  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

  const [qr, setQr] = useState<string | null>(null);
  const [queue, setQueue] = useState<number | null>(null);
  const [fullSlots, setFullSlots] = useState<string[]>([]);



  // 🔥 SLOT GENERATOR (1 HOUR)
  const generateSlots = () => {
    const slots: string[] = [];
    let start = 8 * 60 + 30;
    const end = 17 * 60 + 30;

    while (start < end) {
      const next = start + 60;

      const format = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      slots.push(`${format(start)} - ${format(next)}`);
      start += 60;
    }

    return slots;
  };

  const slots = generateSlots();

  // 🔥 LOAD FULL SLOTS
  const loadFullSlots = async () => {
    const result: string[] = [];

    for (const s of slots) {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("slot_time", s)
        .eq("booking_date", selectedDate);

      if ((count || 0) >= 5) result.push(s);
    }

    setFullSlots(result);
  };

  useEffect(() => {
  loadFullSlots();
}, [selectedDate]);

  // 🔥 REGISTER
  const register = async () => {
    if (!name || !email || !phone || !pkg || !slot) {
      return alert("Please complete all fields");
    }

    if (fullSlots.includes(slot)) {
      return alert("This slot is FULL");
    }

    const { data: last } = await supabase
  .from("orders")
  .select("queue_number")
  .eq("booking_date", selectedDate)
      .limit(1);

    const nextQueue = (last?.[0]?.queue_number || 0) + 1;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        name,
        email,
        phone,
        package: pkg,
        queue_number: nextQueue,
        step: "intake",
        status: "waiting",
        slot_time: slot,
        booking_date: selectedDate,
        payment_status: "pending",
        selected: false,
        edited: false,
        printed: false,
        emailed: false,
      })
      .select()
      .single();

    if (error) return alert(error.message);

    setQr(data.id);
    setQueue(nextQueue);

    loadFullSlots();
  };

  return (
    <div style={styles.container}>
      <img src="/logo.png" style={styles.logo} />

      <h1 style={styles.title}>STREAMS STUDIO</h1>
      <p style={styles.subtitle}>Graduation Registration</p>

      {!qr && (
        <div style={styles.card}>
          <input placeholder="Full Name" onChange={(e) => setName(e.target.value)} style={styles.input} />
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} style={styles.input} />

          <select onChange={(e) => setPkg(e.target.value)} style={styles.input}>
            <option value="">Select Package</option>
            <option value="550">Package 550</option>
            <option value="650">Package 650</option>
            <option value="1250">Package 1250</option>
          </select>
          <input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  min={new Date().toISOString().split("T")[0]}
  style={styles.input}
/>

          <select onChange={(e) => setSlot(e.target.value)} style={styles.input}>
            <option value="">Select Time Slot</option>
            {slots.map((s) => (
              <option key={s} value={s} disabled={fullSlots.includes(s)}>
                {s} {fullSlots.includes(s) ? "(FULL)" : ""}
              </option>
            ))}
          </select>

          <button onClick={register} style={styles.button}>
            REGISTER
          </button>
        </div>
      )}

      {qr && (
        <div style={styles.card}>
          <h2>Registration Complete</h2>
          <h3>Queue #{String(queue).padStart(3, "0")}</h3>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qr}`}
            style={{ margin: 20 }}
          />

          <p>⚠️ Proceed to payment counter</p>

          <button onClick={() => window.location.reload()} style={styles.button}>
            New Registration
          </button>
        </div>
      )}
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle, #0b2e1f, black)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
  title: {
    letterSpacing: "0.3rem",
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 20,
  },
  card: {
    background: "#111",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 0 40px rgba(0,255,150,0.2)",
    textAlign: "center",
  },
  input: {
    display: "block",
    margin: "10px auto",
    padding: 12,
    width: 260,
    borderRadius: 8,
    border: "none",
  },
  button: {
    marginTop: 15,
    padding: "12px 25px",
    background: "#00ff9c",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
};