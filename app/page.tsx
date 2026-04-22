"use client";

export default function Home() {
  return (
    <div style={styles.container}>
      {/* 🌄 BACKGROUND OVERLAY */}
      <div style={styles.overlay}></div>

      {/* 🔝 TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.logoWrap}>
          <img src="/logo.png" style={styles.logo} />
          <span style={styles.logoText}>STREAMS STUDIO</span>
        </div>

        <a href="/login" style={styles.staffLink}>
          Staff Login
        </a>
      </div>

      {/* 🎯 CENTER HERO */}
      <div style={styles.center}>
        <h1 style={styles.title}>STREAMS STUDIO</h1>

        <p style={styles.subtitle}>
          Graduation Sessions • Premium Portrait Experience
        </p>

        <a href="/register" style={styles.cta}>
          BOOK A SESSION
        </a>
      </div>

      {/* ⬇️ BOTTOM BRANDING */}
      <div style={styles.bottom}>
        <p style={styles.tagline}>
          Make moments by the{" "}
          <span style={{ color: "#00ff9c" }}>Streams</span>
        </p>
        <p style={styles.verse}>Psalms 1:1-3</p>
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const styles: any = {
  container: {
    height: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",

    /* ✅ FALLBACK (works NOW) */
    background:
      "radial-gradient(circle at center, #0b2e1f 0%, #000 100%)",

    /* 🔥 FUTURE BACKGROUND (just add image later) */
    backgroundImage: "url('/graduation-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",

    color: "white",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
  },

  topBar: {
    position: "absolute",
    top: 20,
    left: 30,
    right: 30,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 40,
    filter: "brightness(0) invert(1)",
  },

  logoText: {
    fontSize: 13,
    letterSpacing: 2,
    opacity: 0.8,
  },

  staffLink: {
    fontSize: 13,
    opacity: 0.7,
    textDecoration: "none",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    transition: "all 0.3s ease",
  },

  center: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    zIndex: 2,
  },

  title: {
    fontSize: "3rem",
    letterSpacing: "0.4rem",
    marginBottom: 10,
  },

  subtitle: {
    opacity: 0.8,
    marginBottom: 30,
  },

  cta: {
    padding: "14px 30px",
    background: "#00ff9c",
    color: "black",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 0 20px rgba(0,255,150,0.5)",
    transition: "all 0.3s ease",
  },

  bottom: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    textAlign: "center",
    zIndex: 2,
  },

  tagline: {
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 5,
  },

  verse: {
    fontSize: 12,
    opacity: 0.6,
  },
};