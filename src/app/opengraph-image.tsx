import { ImageResponse } from "next/og";

export const alt = "BedrockNexus Plugins — GitHub-powered publishing for Bedrock server software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 76px",
        color: "#effff8",
        background: "linear-gradient(135deg, #101a24 0%, #102b28 62%, #0f3a31 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 27, fontWeight: 700 }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 15,
            background: "#eaf7f1",
            color: "#14202a",
            fontSize: 21,
            fontWeight: 900,
          }}
        >
          BN
        </div>
        BedrockNexus <span style={{ color: "#63e6a9" }}>Plugins</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
        <div
          style={{
            maxWidth: 980,
            fontSize: 70,
            lineHeight: 1.04,
            letterSpacing: -3,
            fontWeight: 800,
          }}
        >
          Plugins for every Minecraft Bedrock server software.
        </div>
        <div style={{ fontSize: 25, color: "#a6c2b8" }}>
          Publish from GitHub. Build with traceability. Discover across ecosystems.
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, color: "#75e8b1", fontSize: 21 }}>
        plugins.bedrocknexus.com
      </div>
    </div>,
    size,
  );
}
