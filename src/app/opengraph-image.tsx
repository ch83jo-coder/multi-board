import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Panmoa Tesla owner decision community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 58%, #166534 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "72px 88px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: 28,
          display: "flex",
          flexDirection: "column",
          padding: "54px 72px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#bfdbfe",
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Tesla owner decision community
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: -5,
            lineHeight: 1.05,
            marginTop: 24,
          }}
        >
          Panmoa
        </div>
        <div
          style={{
            color: "#dbeafe",
            display: "flex",
            fontSize: 34,
            marginTop: 24,
          }}
        >
          Real charging, cost and ownership data.
        </div>
      </div>
    </div>,
    size,
  );
}
