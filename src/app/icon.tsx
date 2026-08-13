import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Même mark que src/components/logo.tsx (la case cochée), mais reconstruit en
 * div/transform plutôt qu'en <svg> : le renderer satori de next/og ne supporte
 * pas de façon fiable les path SVG arbitraires.
 */
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
          background: "#1E7A54",
          borderRadius: 96,
        }}
      >
        <div style={{ position: "relative", width: 260, height: 260, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 27,
              top: 147,
              width: 96,
              height: 32,
              borderRadius: 16,
              background: "#F1FBF6",
              transform: "rotate(43deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 78,
              top: 112,
              width: 174,
              height: 32,
              borderRadius: 16,
              background: "#F1FBF6",
              transform: "rotate(-51deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
