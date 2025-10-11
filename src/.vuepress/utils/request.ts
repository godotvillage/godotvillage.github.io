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
  // 获取项目列表
  async getProjects() {
    try {
      const response = await fetch(`${baseUrl}/projects`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`获取项目列表失败: ${error.message}`);
    }
  },

  // 获取项目统计信息
  async getProjectStats() {
    try {
      const response = await fetch(`${baseUrl}/projects/cstats`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`获取项目统计失败: ${error.message}`);
    }
  },

  // 根据ID获取项目详情
  async getProjectById(projectId) {
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`);
      const data = await response.json();
      return data;
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
      const data = await response.json();
      return data;
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
      const data = await response.json();
      return data;
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
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`删除项目失败: ${error.message}`);
    }
  }
};