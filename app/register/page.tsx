"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState("");
  const [slotTime, setSlotTime] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
    
  );

  const [qr, setQr] = useState<string | null>(null);
  const [queue, setQueue] = useState<number | null>(null);
  const [fullSlots, setFullSlots] = useState<string[]>([]);

  // 🔥 SLOT GENERATOR
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

  // 🔥 REGISTER (FIXED — USES API)
 const register = async () => {
  if (!name || !email || !phone || !pkg || !slotTime) {
    return alert("Please complete all fields");
  }

  if (fullSlots.includes(slotTime)) {
    return alert("This slot is FULL");
  }


    // 👉 GET NEXT QUEUE
    const { data: last } = await supabase
      .from("orders")
      .select("queue_number")
      .eq("booking_date", selectedDate)
      .order("queue_number", { ascending: false })
      .limit(1);

    const nextQueue = (last?.[0]?.queue_number || 0) + 1;

    // ✅ CALL API INSTEAD OF DIRECT INSERT
    const res = await fetch("/api/add-order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name,
    email,
    phone,
    package: pkg,
    slot_time: slotTime,
    booking_date: selectedDate,
  }),
});

let data;

try {
  data = await res.json();
} catch {
  return alert("Server error");
}

if (data.error) return alert(data.error);

// ✅ SUCCESS
setQr(data.id);
setQueue(data.queue_number);
};
const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  outline: "none",
};

 return (
  <div
    style={{
      minHeight: "100vh",
      backgroundImage: "url('/bgfront.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      fontFamily: "sans-serif",
    }}
  >
    {/* 🔥 DARK OVERLAY (FIXES BRIGHTNESS) */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
      }}
    />

    {/* 🔥 FORM CARD */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        width: 360,
        padding: 30,
        borderRadius: 16,

        // 🔥 DARK GLASS (THUNDER GREY)
        background: "rgba(30,30,30,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",

        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",

        textAlign: "center",
        color: "#fff",
      }}
    >
      {/* LOGO */}
      <img
        src="/logo.png"
        style={{
          height: 60,
          marginBottom: 20,
          opacity: 0.9,
        }}
      />

      {/* TITLE */}
      <h2
        style={{
          marginBottom: 20,
          letterSpacing: 2,
          color: "#e5e5e5",
        }}
      >
        REGISTER
      </h2>

     {/* NAME */}
<input
  placeholder="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={inputStyle}
/>

{/* EMAIL */}
<input
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={inputStyle}
/>

{/* PHONE */}
<input
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  style={inputStyle}
/>

{/* TIME SLOT */}
<select
  value={slotTime}
  onChange={(e) => setSlotTime(e.target.value)}
  style={inputStyle}
>
  <option value="">Select Time Slot</option>
  <option value="08:30 - 09:30">08:30 - 09:30</option>
  <option value="09:30 - 10:30">09:30 - 10:30</option>
  <option value="10:30 - 11:30">10:30 - 11:30</option>
  <option value="11:30 - 12:30">11:30 - 12:30</option>
  <option value="1:00 - 2:30">1:00 - 2:30</option>
  <option value="2:00 - 3:30">2:00 - 3:30</option>
  <option value="4:30 - 5:30">4:30 - 5:30</option>

</select>

{/* BUTTON */}
<button
  style={{
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg, #444, #111)",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  SUBMIT
</button>
    </div>

    {/* 🔧 PLACEHOLDER FIX */}
    <style jsx>{`
  input::placeholder {
    color: #bbb;
  }

  select {
    color: #fff;
  }

  option {
    color: #000;
  }
`}</style>
  </div>
);
}