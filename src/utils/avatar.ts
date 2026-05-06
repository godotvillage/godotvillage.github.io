/**
 * 生成用户头像 URL
 * @param seed 用于生成头像的种子字符串（如用户名、邮箱等）
 * @returns 头像的完整 URL
 */
export const getAvatarUrl = (seed?: string | null): string => {
  if (!seed) {
    // 提供一个默认的空头像或随机种子
    return 'https://api.dicebear.com/7.x/initials/svg?seed=User'
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`
}
