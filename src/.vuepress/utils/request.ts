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

// 项目相关 API 函数
export const projectApi = {
  // 获取项目分类列表（参考论坛分类实现）
  async getProjectCategories() {
    try {
      const response = await fetch(`${baseUrl}/projects/categories`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`获取项目分类失败: ${error.message}`);
    }
  },

  // 获取项目列表（支持分类筛选）
  async getProjects(categoryId = null, status = null, pageSize = 20, after = null) {
    try {
      let url = `${baseUrl}/projects/list`;
      const params = new URLSearchParams();
      
      if (categoryId) {
        params.append('categoryId', categoryId);
      }
      if (status) {
        params.append('status', status);
      }
      if (after) {
        params.append('after', after);
      }
      params.append('pageSize', pageSize.toString());
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url);
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
      const response = await fetch(`${baseUrl}/projects/detail/${projectId}`);
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

  // 创建新项目（参考论坛创建逻辑）
  async createProject(projectData) {
    try {
      const response = await fetch(`${baseUrl}/projects/create`, {
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
      const response = await fetch(`${baseUrl}/projects/${projectId}/update`, {
        method: 'PUT',
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
      throw new Error(`更新项目失败: ${error.message}`);
    }
  },

  // 添加项目更新记录
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

  // 删除项目
  async deleteProject(projectId) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}/delete`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`删除项目失败: ${error.message}`);
    }
  }
};