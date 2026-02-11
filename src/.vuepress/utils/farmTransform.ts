type AnyRecord = Record<string, any>;

function pickFirst<T>(...candidates: Array<T | null | undefined>): T | undefined {
  for (const v of candidates) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

export const FARM_STATUS = {
  Planning: 0,
  InProgress: 1,
  Paused: 2,
  Completed: 3,
} as const;

export type FarmStatusCode = (typeof FARM_STATUS)[keyof typeof FARM_STATUS];

const STATUS_CODE_TO_LABEL: Record<number, string> = {
  0: "计划中",
  1: "进行中",
  2: "暂停",
  3: "已完成",
};

const STATUS_LABEL_TO_CODE: Record<string, FarmStatusCode> = {
  计划中: FARM_STATUS.Planning,
  进行中: FARM_STATUS.InProgress,
  暂停: FARM_STATUS.Paused,
  已完成: FARM_STATUS.Completed,
};

export function statusCodeToLabel(code: any): string {
  const n = Number(code);
  if (Number.isFinite(n) && STATUS_CODE_TO_LABEL[n] != null) return STATUS_CODE_TO_LABEL[n];
  return "计划中";
}

export function statusLabelToCode(label: any): FarmStatusCode {
  const s = String(label || "").trim();
  return STATUS_LABEL_TO_CODE[s] ?? FARM_STATUS.Planning;
}

export function nextStatusLabel(currentLabel: any): string {
  const cycle = ["计划中", "进行中", "暂停", "已完成"];
  const idx = Math.max(0, cycle.indexOf(String(currentLabel || "").trim()));
  return cycle[(idx + 1) % cycle.length];
}

export function nextStatusCode(current: any): FarmStatusCode {
  const label = typeof current === "number" ? statusCodeToLabel(current) : String(current || "");
  const nextLabel = nextStatusLabel(label);
  return statusLabelToCode(nextLabel);
}

function isoZFromDateInput(input: any): string | null {
  if (!input) return null;
  if (input instanceof Date) {
    const t = input.getTime();
    return Number.isFinite(t) ? input.toISOString() : null;
  }
  const s = String(input).trim();
  if (!s) return null;

  // YYYY-MM-DD -> 当天 00:00:00Z
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m = s.match(ymd);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`).toISOString();

  // 已经是 ISO / 可解析字符串
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export function normalizeFarmProject(raw: AnyRecord): AnyRecord {
  const title = pickFirst<string>(
    raw.title,
    raw.name,
    raw.projectName,
    raw.project_title,
    raw.projectTitle,
    raw.subject
  );

  const description = pickFirst<string>(raw.description, raw.desc, raw.content, raw.detail);
  const author = pickFirst<string>(raw.author, raw.submitter, raw.creator, raw.createdBy, raw.owner);
  const statusCode = pickFirst<any>(raw.status, raw.statusCode, raw.state, raw.status_code);
  const statusLabel =
    typeof statusCode === "number" || (typeof statusCode === "string" && statusCode.trim() !== "" && !Number.isNaN(Number(statusCode)))
      ? statusCodeToLabel(statusCode)
      : pickFirst<string>(raw.statusLabel, raw.status_text, raw.statusText, raw.statusName, raw.status) || "计划中";
  const category = pickFirst<string>(raw.category, raw.type);
  const create_time = pickFirst<string>(raw.create_time, raw.createdAt, raw.created_at, raw.createTime);

  // 兼容常见 id 字段
  const id = pickFirst<any>(raw.id, raw.farm_id, raw.farmId, raw.projectId, raw.project_id);

  const tags = Array.isArray(raw.tags)
    ? raw.tags
    : typeof raw.tags === "string"
      ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : raw.tags;

  return {
    ...raw,
    ...(id !== undefined ? { id } : null),
    ...(title !== undefined ? { title } : null),
    ...(description !== undefined ? { description } : null),
    ...(author !== undefined ? { author } : null),
    status: statusLabel,
    statusCode: statusLabelToCode(statusLabel),
    ...(category !== undefined ? { category } : null),
    ...(create_time !== undefined ? { create_time } : null),
    ...(tags !== undefined ? { tags } : null),
  };
}

export function extractFarmList(raw: any): AnyRecord[] {
  if (Array.isArray(raw)) return raw.map((x) => (x && typeof x === "object" ? normalizeFarmProject(x) : x));

  // 常见包装：{ success, data: [...] } / { data: [...] } / { items: [...] } / { list: [...] }
  const candidates = [raw?.data, raw?.items, raw?.list, raw?.rows, raw?.result];
  for (const c of candidates) {
    if (Array.isArray(c)) return c.map((x) => (x && typeof x === "object" ? normalizeFarmProject(x) : x));
  }

  return [];
}

export function computeFarmStats(projects: AnyRecord[]): { total: number; active: number; completed: number } {
  const total = projects.length;
  const statusStr = (s: any) => String(s || "").toLowerCase();

  const isActive = (p: AnyRecord) => {
    if (typeof p.statusCode === "number") return Number(p.statusCode) === FARM_STATUS.InProgress;
    const s = statusStr(p.status);
    return s === "进行中" || s === "inprogress" || s === "in_progress" || s === "active" || s.includes("progress");
  };
  const isCompleted = (p: AnyRecord) => {
    if (typeof p.statusCode === "number") return Number(p.statusCode) === FARM_STATUS.Completed;
    const s = statusStr(p.status);
    return s === "已完成" || s === "completed" || s === "done" || s.includes("complete") || s.includes("finish");
  };

  const active = projects.filter(isActive).length;
  const completed = projects.filter(isCompleted).length;
  return { total, active, completed };
}

export function buildFarmCreatePayload(input: {
  title: string;
  description: string;
  author: string;
  category?: string;
  statusLabel?: string;
  progress?: number;
  tags?: string[] | string;
  startDate?: string | Date | null;
  expectedEndDate?: string | Date | null;
  actualEndDate?: string | Date | null;
  githubUrl?: string;
  demoUrl?: string;
  audit?: {
    userId?: number;
    userName?: string;
  };
}): AnyRecord {
  const tagsArr = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string"
      ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  const nowIso = new Date().toISOString();
  const createId = Number.isFinite(Number(input.audit?.userId)) ? Number(input.audit?.userId) : 0;
  const createBy = String(input.audit?.userName || "").trim() || String(input.author || "").trim() || "anonymous";

  return {
    // 生成默认值（你要求由前端补齐）
    id: 0,
    enabled: true,
    isDeleted: false,
    createId,
    createBy,
    createTime: nowIso,
    modifyId: createId,
    modifyBy: createBy,
    modifyTime: nowIso,
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    author: String(input.author || "").trim(),
    category: String(input.category || "").trim(),
    status: statusLabelToCode(input.statusLabel ?? "计划中"),
    progress: Number.isFinite(Number(input.progress)) ? Number(input.progress) : 0,
    tags: tagsArr.join(","),
    startDate: isoZFromDateInput(input.startDate),
    expectedEndDate: isoZFromDateInput(input.expectedEndDate),
    actualEndDate: isoZFromDateInput(input.actualEndDate),
    githubUrl: String(input.githubUrl || "").trim(),
    demoUrl: String(input.demoUrl || "").trim(),
  };
}


