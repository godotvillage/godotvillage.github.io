export const baseUrl = 'http://117.72.182.158:31024';
export const imageBaseUrl = 'http://117.72.182.158:31025/uploads/cover';


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
      const response = await fetch(`${baseUrl}/upload`, {
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
    return `${baseUrl}/download/${gameId}`;
  }
};