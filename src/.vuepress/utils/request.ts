// export const baseUrl = 'https://village.moshangzhu.com.cn';
export const baseUrl = 'http://localhost:5000'; // 本地调试使用
export const imageBaseUrl = 'https://games.moshangzhu.com.cn/';
export const gameBaseUrl = 'https://games.moshangzhu.com.cn/games';

import { getAuthorizationHeaderValue } from "./authStorage.js";
import { computeFarmStats, extractFarmList } from "./farmTransform.js";

function withAuthHeaders(headers: Record<string, string> = {}) {
  const auth = getAuthorizationHeaderValue();
  return auth ? { ...headers, Authorization: auth } : headers;
}

async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(raw: any, fallback: string): string {
  if (!raw) return fallback;
  if (typeof raw === "string") return raw;
  return raw.message || raw.error || raw.msg || raw.title || fallback;
}

// 认证相关 API
export const authApi = {
  async login(username: string, password: string) {
    try {
      const response = await fetch(`${baseUrl}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      return result;
    } catch (error: any) {
      throw new Error(`登录失败: ${error?.message || String(error)}`);
    }
  },
};

// 游戏相关 API 函数
export const gameApi = {
  // 获取游戏列表
  async getGames() {
    try {
      const response = await fetch(`${baseUrl}/games`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`获取游戏列表失败: ${error.message}`);
    }
  },

  // 上传游戏
  async uploadGame(formData) {
    try {
      const response = await fetch(`${baseUrl}/games/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`上传游戏失败: ${error.message}`);
    }
  },

  // 下载游戏
  getDownloadUrl(gameId) {
    return `${baseUrl}/games/download/${gameId}`;
  }
};

// 项目相关 API 函数（使用 farm 端点）
export const farmApi = {
  // 获取项目列表
  async getFarmList() {
    try {
      const response = await fetch(`${baseUrl}/api/Farm`, {
        method: "GET",
        headers: withAuthHeaders(),
      });
      const raw = await readJsonSafe(response);

      // 先把原始结构打出来，便于你确认字段/包装层
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.log("[farmApi] GET /api/Farm raw response:", raw);
        (window as any).__farmLastResponse = raw;
      }

      if (!response.ok) {
        return { success: false, error: getErrorMessage(raw, `请求失败(${response.status})`), raw };
      }

      // 兼容：raw 可能是数组，也可能是 {success,data:[...]} 等
      const data = extractFarmList(raw);
      return { success: true, data, raw };
    } catch (error) {
      return { success: false, error: `获取项目列表失败: ${error.message}`, raw: null };
    }
  },

  // 获取项目统计信息
  async getFarmListStats() {
    try {
      // 不猜测后端 stats 路由，先基于列表计算
      const listRes = await this.getFarmList();
      if (!listRes?.success) return { success: false, error: listRes?.error || "获取项目列表失败", raw: listRes?.raw };
      const stats = computeFarmStats(listRes.data || []);
      return { success: true, data: stats, raw: listRes.raw };
    } catch (error) {
      return { success: false, error: `获取项目统计失败: ${error.message}`, raw: null };
    }
  },

  // 根据ID获取项目详情
  async getFarmProjectById(farmId) {
    try {
      const response = await fetch(`${baseUrl}/api/Farm/${farmId}`, {
        method: "GET",
        headers: withAuthHeaders(),
      });
      const raw = await readJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: getErrorMessage(raw, `请求失败(${response.status})`), raw };
      }
      // 不强行做字段映射，先把 raw 原样返回，方便你看结构
      return { success: true, data: raw?.data ?? raw, raw };
    } catch (error) {
      return { success: false, error: `获取项目详情失败: ${error.message}`, raw: null };
    }
  },

  // 创建新项目
  async createFarmProject(projectData) {
    try {
      const response = await fetch(`${baseUrl}/api/Farm`, {
        method: "POST",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(projectData),
      });
      const raw = await readJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: getErrorMessage(raw, `请求失败(${response.status})`), raw };
      }
      return { success: true, data: raw?.data ?? raw, raw };
    } catch (error) {
      return { success: false, error: `创建项目失败: ${error.message}`, raw: null };
    }
  },

  // 更新项目信息
  async updateFarmProject(farmId, updateData) {
    try {
      const response = await fetch(`${baseUrl}/api/Farm/${farmId}`, {
        method: "PUT",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(updateData),
      });
      const raw = await readJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: getErrorMessage(raw, `请求失败(${response.status})`), raw };
      }
      return { success: true, data: raw?.data ?? raw, raw };
    } catch (error) {
      return { success: false, error: `更新项目失败: ${error.message}`, raw: null };
    }
  },

  // 删除项目
  async deleteFarmProject(farmId) {
    try {
      const response = await fetch(`${baseUrl}/api/Farm/${farmId}`, {
        method: "DELETE",
        headers: withAuthHeaders(),
      });
      const raw = await readJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: getErrorMessage(raw, `请求失败(${response.status})`), raw };
      }
      return { success: true, data: raw?.data ?? raw, raw };
    } catch (error) {
      return { success: false, error: `删除项目失败: ${error.message}`, raw: null };
    }
  }
};

// 项目追踪相关 API 函数
export const projectApi = {
  // 获取项目列表
  async getProjects() {
    try {
      const response = await fetch(`${baseUrl}/projects`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`获取项目列表失败: ${error.message}`);
    }
  },

  // 获取项目统计信息
  async getProjectStats() {
    try {
      const response = await fetch(`${baseUrl}/projects/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`获取项目统计失败: ${error.message}`);
    }
  },

  // 根据ID获取项目详情
  async getProjectById(projectId) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`获取项目详情失败: ${error.message}`);
    }
  },

  // 创建新项目
  async createProject(projectData) {
    try {
      const response = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: {
          ...withAuthHeaders({ 'Content-Type': 'application/json' })
        },
        body: JSON.stringify(projectData)
      });
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`创建项目失败: ${error.message}`);
    }
  },

  // 更新项目信息
  async updateProject(projectId, updateData) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          ...withAuthHeaders({ 'Content-Type': 'application/json' })
        },
        body: JSON.stringify(updateData)
      });
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`更新项目失败: ${error.message}`);
    }
  },

  // 删除项目
  async deleteProject(projectId) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`删除项目失败: ${error.message}`);
    }
  },

  // 添加项目更新
  async addProjectUpdate(projectId, updateData) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}/updates`, {
        method: 'POST',
        headers: {
          ...withAuthHeaders({ 'Content-Type': 'application/json' })
        },
        body: JSON.stringify(updateData)
      });
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`添加项目更新失败: ${error.message}`);
    }
  },

  // 获取项目的所有更新
  async getProjectUpdates(projectId) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}/updates`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`获取项目更新失败: ${error.message}`);
    }
  },

  // 删除项目更新
  async deleteProjectUpdate(projectId, updateId) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}/updates/${updateId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`删除项目更新失败: ${error.message}`);
    }
  }
};