// Colour themes for the dashboard cards, keyed by the card's permissionName.
// Each theme drives one card's gradient background, glossy icon tile, glow shadow
// and the colours used by its illustration (see components/dashboard/illustrations).

export interface CardTheme {
  /** soft gradient of the card face (top-left → bottom-right) */
  from: string;
  to: string;
  /** vivid gradient for the icon tile and illustration accents */
  deep: string;
  deep2: string;
  /** readable dark colour for the title / text in the same hue */
  ink: string;
  /** shadow colour (rgb triplet) */
  glow: string;
}

export const DASHBOARD_THEMES: Record<string, CardTheme> = {
  attendance_system:   { from: "#EAF2FF", to: "#C7DBFF", deep: "#3B82F6", deep2: "#1D4ED8", ink: "#0F2A63", glow: "37 99 235" },
  supplies_system:     { from: "#EAFBF0", to: "#BDEFD0", deep: "#22C55E", deep2: "#15803D", ink: "#0B3B1F", glow: "22 163 74" },
  student_affairs:     { from: "#F4ECFF", to: "#DAC6FF", deep: "#A855F7", deep2: "#7E22CE", ink: "#3B0F6B", glow: "147 51 234" },
  internal_activities: { from: "#FFEBF1", to: "#FFC4D7", deep: "#FB7185", deep2: "#E11D48", ink: "#6B0F2B", glow: "225 29 72" },
  all_activities:      { from: "#ECEEFF", to: "#C9CDFF", deep: "#6366F1", deep2: "#4338CA", ink: "#1E1B6B", glow: "79 70 229" },
  public_relations:    { from: "#FFE9F6", to: "#F8BFE3", deep: "#EC4899", deep2: "#BE185D", ink: "#6B0F42", glow: "219 39 119" },
  media_library:       { from: "#FFF1E3", to: "#FFD2A3", deep: "#FB923C", deep2: "#C2410C", ink: "#5C2308", glow: "234 88 12" },
  document_upload:     { from: "#E4FAFF", to: "#B3EDF8", deep: "#06B6D4", deep2: "#0E7490", ink: "#083B47", glow: "8 145 178" },
  personnel_system:    { from: "#E3FAF5", to: "#ADEBDD", deep: "#14B8A6", deep2: "#0F766E", ink: "#08403B", glow: "13 148 136" },
  students_system:     { from: "#E5FBEF", to: "#A9F0CB", deep: "#10B981", deep2: "#047857", ink: "#06402D", glow: "5 150 105" },
  pp5_system:          { from: "#FFE9F1", to: "#FBC1D9", deep: "#EC4899", deep2: "#BE185D", ink: "#4A0D2B", glow: "190 24 93" },
  omr_system:          { from: "#F5FCD9", to: "#DEF397", deep: "#84CC16", deep2: "#4D7C0F", ink: "#2C4408", glow: "101 163 13" },
  teacher_import:      { from: "#E5F5FF", to: "#B8E2FF", deep: "#0EA5E9", deep2: "#0369A1", ink: "#08365A", glow: "2 132 199" },
  menu_permissions:    { from: "#EFE9FF", to: "#D2C4FF", deep: "#8B5CF6", deep2: "#5B21B6", ink: "#2B1466", glow: "109 40 217" },
  textbook_system:     { from: "#FFF7DD", to: "#FFE08C", deep: "#F59E0B", deep2: "#B45309", ink: "#5A3304", glow: "217 119 6" },
  home_slider:         { from: "#FCE9FF", to: "#F0BFFB", deep: "#D946EF", deep2: "#A21CAF", ink: "#590F63", glow: "192 38 211" },
  admin_panel:         { from: "#FFEBEB", to: "#FFC3C3", deep: "#EF4444", deep2: "#B91C1C", ink: "#5E0F0F", glow: "220 38 38" },
};

/** neutral fallback for a card that has no theme yet */
export const FALLBACK_THEME: CardTheme = {
  from: "#F1F5F9", to: "#CBD5E1", deep: "#64748B", deep2: "#334155", ink: "#0F172A", glow: "71 85 105",
};

export const themeFor = (key?: string): CardTheme => (key && DASHBOARD_THEMES[key]) || FALLBACK_THEME;
