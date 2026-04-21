export default function Page({ params }: { params: { role: string } }) {
  return (
    <div style={{
      background: "black",
      color: "white",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem"
    }}>
      DISPLAY WORKING: {params.role}
    </div>
  );
}