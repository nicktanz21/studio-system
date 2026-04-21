"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const json = await res.json();
      console.log("RESULT:", json);

      setResult(json);
    } catch (err) {
      console.log("ERROR:", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Registration</h2>

      <form onSubmit={submit}>
        <input name="name" placeholder="Name" required /><br/><br/>
        <input name="school" placeholder="School" required /><br/><br/>
        <input name="course" placeholder="Course" required /><br/><br/>
        <input name="contact" placeholder="Contact" required /><br/><br/>
        <select name="package" required>
  <option value="">Select Package</option>
  <option value="550">550</option>
  <option value="850">850</option>
  <option value="1200">1200</option>
</select>
<br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Register"}
        </button>
      </form>

      <hr />

      {result && result.order_id && (
        <div>
          <h3>ID: {result.order_id}</h3>
          <img src={result.qr_code} width={200} />
        </div>
      )}

      {result && result.error && (
        <div style={{ color: "red" }}>
          ERROR: {result.error}
          <br />
          {result.details}
        </div>
      )}
    </div>
  );
}