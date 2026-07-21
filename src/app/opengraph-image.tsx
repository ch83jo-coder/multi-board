import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Panmoa community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "linear-gradient(135deg, #111827 0%, #312e81 55%, #7c3aed 100%)",
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
            color: "#c4b5fd",
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Multi-board community
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
            color: "#e9d5ff",
            display: "flex",
            fontSize: 34,
            marginTop: 24,
          }}
        >
          Discover. Discuss. Connect.
        </div>
      </div>
    </div>,
    size,
  );
}
