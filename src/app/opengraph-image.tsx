import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/constants/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(194,139,83,0.34), transparent 32%), linear-gradient(135deg, #2d221b 0%, #17120f 100%)",
          color: "#F3EBDD",
          padding: "72px 78px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(233,215,190,0.12)",
            borderRadius: 28,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 18,
                letterSpacing: "0.36em",
                textTransform: "uppercase",
                color: "rgba(243,235,221,0.72)",
              }}
            >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#C28B53",
                    display: "flex",
                  }}
                />
              Boutique Villa Collection
            </div>
            <div style={{ fontSize: 78, lineHeight: 0.92, fontWeight: 700, letterSpacing: "0.04em" }}>
              {SITE_CONFIG.name}
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.4, maxWidth: 760, color: "rgba(243,235,221,0.78)" }}>
              Luxury stays, bilingual booking flow, and a polished admin surface presented as a premium resort demo.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 18 }}>
              {["Curated villas", "Booking flow", "Admin tools"].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(233,215,190,0.14)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 18,
                    color: "rgba(243,235,221,0.78)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 164,
                height: 164,
                borderRadius: 999,
                border: "1px solid rgba(233,215,190,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "#E9D7BE",
                fontSize: 46,
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            >
              RG
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
