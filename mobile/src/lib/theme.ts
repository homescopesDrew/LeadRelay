/**
 * LeadRelay "job site" design tokens — mirrors the web app's tailwind.config.ts.
 */
export const colors = {
  steel50: "#f4f6f7",
  steel100: "#e3e8ea",
  steel200: "#c4cfd4",
  steel300: "#9badb6",
  steel400: "#6b8392",
  steel500: "#4f6877",
  steel600: "#445665",
  steel700: "#3b4854",
  steel800: "#353e48",
  steel900: "#1d242c",
  steel950: "#12171d",
  safety400: "#ff8a3d",
  safety500: "#f96a16",
  safety600: "#e0540a",
  blueprint500: "#2f6db5",
  blueprint700: "#1f4d85",
  white: "#ffffff",
} as const;

export const fonts = {
  display: "BarlowCondensed_700Bold",
  displaySemi: "BarlowCondensed_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  mono: "IBMPlexMono_500Medium",
} as const;

/** Approximates the web's shadow-ticket box shadow. */
export const ticketShadow = {
  shadowColor: colors.steel950,
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 8,
  elevation: 3,
} as const;
