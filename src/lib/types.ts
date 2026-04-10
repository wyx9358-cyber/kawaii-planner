export type ThemeKey = "milkBlue" | "sakura" | "cream" | "sage" | "lavender";

export type Shift = {
  id: string;
  date: string;
  locationName?: string;
  roleName?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes: number;
  isDayOff: boolean;
  isBreakPaid?: boolean;
  baseHourlyRate?: number;
  bonusAmount?: number;
  tipsAmount?: number;
  deductionAmount?: number;
  note?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ComputedShift = Shift & {
  rawMinutes: number;
  regularMinutes: number;
  workMinutes: number;
  overtimeMinutes: number;
  grossPay: number;
  netPay: number;
  appliedRate: number;
};

export type Task = {
  id: string;
  title: string;
  category: "work" | "study" | "health" | "life" | "custom";
  color?: string;
  icon?: string;
  priority?: "low" | "medium" | "high";
  repeatRule?: string;
  reminderEnabled?: boolean;
  streakCount?: number;
  note?: string;
};

export type TaskLog = {
  id: string;
  taskId: string;
  date: string;
  completed: boolean;
  completedAt?: string | null;
};

export type ReminderSettings = {
  beforeWork: boolean;
  afterWork: boolean;
  missingRecord: boolean;
  weeklySummary: boolean;
};

export type Settings = {
  theme: ThemeKey;
  darkMode: boolean;
  wallpaper: string;
  defaultBreakMinutes: number;
  defaultHourlyRate: number;
  weekStartsOnMonday: boolean;
  currency: string;
  language: string;
  paidBreak: boolean;
  overtimeThresholdHours: number;
  overtimeMultiplier: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  taxRate: number;
  showNetPay: boolean;
  locationRates: Record<string, number>;
  reminders: ReminderSettings;
};

export type ParsedShiftDraft = {
  tempId: string;
  sourceText: string;
  date: string;
  locationName?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes: number;
  isDayOff: boolean;
  confidence: number;
  warnings?: string[];
};

export type ThemePreset = {
  key: ThemeKey;
  name: string;
  bg: string;
  card: string;
  soft: string;
  accent: string;
  accentText: string;
  ring: string;
  button: string;
  iconHex: string;
};
