"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  payment_status: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }
  router.replace("/login");
};

  // 🔐 AUTH
  useEffect(() => {
  const checkAccess = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("SESSION:", session);
    console.log("SESSION USER ID:", session?.user?.id);
    console.log("SESSION USER EMAIL:", session?.user?.email);
    if (!session) {
      window.location.href = "/login";
      return;
    }
    const user = session.user;
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();
    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", error);
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", user.email)
      .maybeSingle();
    console.log("PROFILE BY EMAIL:", profileByEmail);
    if (!profile || !["admin", "staff"].includes(profile.role)) {
      window.location.href = "/login";
      return;
    }
    console.log("ACCESS GRANTED");
    setAuthorized(true);
setCheckingAccess(false);
  };
  checkAccess();
}, []);

  

  // 🔄 FETCH
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch orders failed:", error);
      return;
    }

    if (data) setOrders(data);
  };

  // 🔄 LOAD ONLY AFTER AUTHORIZED
  useEffect(() => {
    if (!authorized) return;
    fetchOrders();
  }, [authorized]);

  // 🔥 REALTIME ONLY AFTER AUTHORIZED
  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  // ➕ ADD CUSTOMER
  const addCustomer = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      const res = await fetch("/api/add-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setName("");
      setEmail("");
    } catch (err) {
      alert("Something went wrong. Try again.");
    }
  };

  // 🔧 UPDATE FLAGS
  const updateFlag = async (id: string, field: string) => {
    try {
      const res = await fetch("/api/update-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, field }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  // 💰 MARK PAID
  const markPaid = async (id: string) => {
    await fetch("/api/mark-paid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  };

  // ▶️ NEXT CUSTOMER
  const serveNext = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    try {
      await fetch("/api/serve-next", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      alert("Failed to move to next customer");
    }
  };

  if (checkingAccess) {
    return (
      <div style={styles.container}>
        <p>Checking access...</p>
      </div>
    );
    const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }
  router.replace("/login");
};
  }

  if (!authorized) {
    return null;
  }

  return (
  <div style={styles.container}>
    <div style={styles.topBar}>
      <div>
        <h1 style={styles.title}>STREAMS STUDIO</h1>
        <p style={styles.subtitle}>Admin Control Panel</p>
      </div>
      <button onClick={handleLogout} style={styles.logoutBtn}>
        LOGOUT
      </button>
    </div>
    <div style={styles.card}>
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

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            ...styles.orderCard,
            background:
              o.status === "serving"
                ? "#145a3b"
                : o.status === "waiting"
                ? "#1a1a1a"
                : "#333",
          }}
        >
          <div style={styles.header}>
            <strong>#{String(o.queue_number).padStart(3, "0")}</strong> — {o.name}
          </div>

          <div style={styles.meta}>
            {o.step} → {o.status}
          </div>

          <button
            onClick={() => markPaid(o.id)}
            style={{
              ...styles.payBtn,
              background: o.payment_status === "paid" ? "#00ff9c" : "#444",
              color: o.payment_status === "paid" ? "black" : "white",
            }}
          >
            {o.payment_status === "paid" ? "PAID" : "MARK PAID"}
          </button>
        </div>
      ))}
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    padding: 40,
    background: "radial-gradient(circle, #0b2e1f, black)",
    color: "white",
  },

  title: {
    fontSize: "2rem",
    letterSpacing: "0.2rem",
  },

  subtitle: {
    opacity: 0.6,
    marginBottom: 20,
  },
  
card: {
  display: "flex",
  gap: 10,
  marginBottom: 20,
},

  input: {
    padding: 10,
    borderRadius: 8,
    border: "none",
  },

  addBtn: {
    padding: "10px 20px",
    background: "#00ff9c",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  nextBtn: {
    width: "100%",
    padding: 15,
    background: "#00ff9c",
    border: "none",
    borderRadius: 10,
    marginBottom: 20,
    cursor: "pointer",
  },

  orderCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  header: {
    fontWeight: "bold",
  },

  meta: {
    opacity: 0.7,
    marginTop: 5,
  },

  payBtn: {
    marginTop: 10,
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
