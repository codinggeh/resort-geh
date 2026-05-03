import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2f241d 0%, #17120f 100%)",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="58" fill="#F5EBDD" stroke="#C28B53" strokeWidth="7" />
          <g
            transform="translate(49 45) scale(3.4)"
            stroke="#7A5431"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 22v-6.57" />
            <path d="M12 11h.01" />
            <path d="M12 7h.01" />
            <path d="M14 15.43V22" />
            <path d="M15 16a5 5 0 0 0-6 0" />
            <path d="M16 11h.01" />
            <path d="M16 7h.01" />
            <path d="M8 11h.01" />
            <path d="M8 7h.01" />
            <rect x="4" y="2" width="16" height="20" rx="2" />
          </g>
        </svg>
      </div>
    ),
    size
  );
}
