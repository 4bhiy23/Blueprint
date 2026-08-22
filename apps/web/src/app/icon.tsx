import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EFF6FF",
          border: "2px solid #0F172A",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        {/* Node Start Dot */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
            width: "6px",
            height: "6px",
            borderRadius: "2px",
            background: "#FFFFFF",
            border: "1.5px solid #0F172A",
          }}
        />

        {/* Main Response Node with SVG Checkmark */}
        <div
          style={{
            width: "16px",
            height: "14px",
            background: "#1D4ED8",
            border: "1.5px solid #0F172A",
            borderRadius: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 2 6 L 5 9 L 10 3" />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
