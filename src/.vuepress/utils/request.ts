export const baseUrl = 'https://village.moshangzhu.com.cn';
// export const baseUrl = 'http://localhost:31024'; // 本地调试使用
export const imageBaseUrl = 'https://games.moshangzhu.com.cn/';
export const gameBaseUrl = 'https://games.moshangzhu.com.cn/games';

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
      const response = await fetch(`${baseUrl}/farms`);
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`获取项目列表失败: ${error.message}`);
    }
  },

  // 获取项目统计信息
  async getFarmListStats() {
    try {
      const response = await fetch(`${baseUrl}/farms/stats`);
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
  async getFarmProjectById(farmId) {
    try {
      const response = await fetch(`${baseUrl}/farms/${farmId}`);
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
  async createFarmProject(projectData) {
    try {
      const response = await fetch(`${baseUrl}/farms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`创建项目失败: ${error.message}`);
    }
  },

  // 更新项目信息
  async updateFarmProject(farmId, updateData) {
    try {
      const response = await fetch(`${baseUrl}/farms/${farmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
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
  async deleteFarmProject(farmId) {
    try {
      const response = await fetch(`${baseUrl}/farms/${farmId}`, {
        method: 'DELETE'
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
          'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
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
        method: 'DELETE'
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
          'Content-Type': 'application/json'
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