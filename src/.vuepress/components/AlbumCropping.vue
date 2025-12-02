<template>
  <div class="album-cropping-wrapper">
    <!-- 主容器 -->
    <div id="app" class="h-screen flex flex-col">
      <!-- 顶部工具栏 -->
      <header id="toolbar" class="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <!-- 左侧工具组 -->
        <div class="flex items-center space-x-4">
          <!-- Logo和标题 -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-cut text-white text-sm"></i>
            </div>
            <h1 class="text-lg font-semibold text-white">图集裁剪工具</h1>
          </div>
          <!-- 文件操作 -->
          <div class="flex items-center space-x-2">
            <button id="openFileBtn" class="btn-primary">
              <i class="fas fa-folder-open mr-2"></i>
              打开图片
            </button>
            <button id="backToListBtn" class="btn-primary">
              <i class="fas fa-backward mr-2"></i>
              回到列表
            </button>
            <input type="file" id="fileInput" accept="image/*" class="hidden">
          </div>
        </div>
        <!-- 中间工具组 -->
        <div class="flex items-center space-x-2">
          <!-- 检测工具 -->
          <div class="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg">
            <button id="autoDetectBtn" class="btn-secondary" disabled>
              <i class="fas fa-magic mr-2"></i>
              自动检测
            </button>
            <div class="w-px h-6 bg-gray-600"></div>
            <button id="clearRegionsBtn" class="btn-ghost" disabled>
              <i class="fas fa-eraser mr-1"></i>
              清除
            </button>
          </div>
          <!-- 编辑工具 -->
          <div class="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg">
            <button id="selectModeBtn" class="btn-tool active" data-tool="select">
              <i class="fas fa-mouse-pointer"></i>
            </button>
            <button id="rectangleModeBtn" class="btn-tool" data-tool="rectangle">
              <i class="fas fa-square"></i>
            </button>
            <button id="circleModeBtn" class="btn-tool" data-tool="circle">
              <i class="fas fa-circle"></i>
            </button>
            <button id="panModeBtn" class="btn-tool" data-tool="pan">
              <i class="fas fa-hand-paper"></i>
            </button>
          </div>
        </div>
        <!-- 右侧工具组 -->
        <div class="flex items-center space-x-2">
          <!-- 历史操作 -->
          <div class="flex items-center space-x-1">
            <button id="undoBtn" class="btn-ghost" disabled title="撤销 (Ctrl+Z)">
              <i class="fas fa-undo"></i>
            </button>
            <button id="redoBtn" class="btn-ghost" disabled title="重做 (Ctrl+Y)">
              <i class="fas fa-redo"></i>
            </button>
          </div>
          <!-- 导出操作 -->
          <div class="flex items-center space-x-2">
            <button id="exportBtn" class="btn btn-primary" title="导出选中区域">
              <i class="fas fa-download"></i> 导出
            </button>
            <button id="exportAllBtn" class="btn btn-secondary" title="导出所有区域">
              <i class="fas fa-file-archive"></i> 导出全部
            </button>
            <button id="exportDataBtn" class="btn btn-secondary" title="导出区域数据">
              <i class="fas fa-database"></i> 导出数据
            </button>
          </div>
          <!-- 设置 -->
          <button id="settingsBtn" class="btn-ghost">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </header>
      <!-- 主内容区域 -->
      <main class="flex-1 flex overflow-hidden">
        <!-- 左侧边栏 -->
        <aside id="sidebar" class="w-80 bg-gray-800 border-r border-gray-700 flex flex-col overflow-scroll">
          <!-- 侧边栏标题 -->
          <div class="px-4 py-3 border-b border-gray-700">
            <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wide">控制面板</h2>
          </div>
          <!-- 检测参数面板 -->
          <div id="detectionPanel" class="p-4 border-b border-gray-700">
            <h3 class="text-sm font-medium text-white mb-3">检测参数</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">敏感度</label>
                <div class="flex items-center space-x-2">
                  <input type="range" id="sensitivitySlider" min="1" max="100" value="50" class="flex-1 slider">
                  <span id="sensitivityValue" class="text-xs text-gray-300 w-8">50</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">最小区域大小</label>
                <div class="flex items-center space-x-2">
                  <input type="range" id="minSizeSlider" min="10" max="1000" value="100" class="flex-1 slider">
                  <span id="minSizeValue" class="text-xs text-gray-300 w-12">100px</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">边缘检测强度</label>
                <div class="flex items-center space-x-2">
                  <input type="range" id="edgeThresholdSlider" min="1" max="100" value="30" class="flex-1 slider">
                  <span id="edgeThresholdValue" class="text-xs text-gray-300 w-8">30</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 区域列表面板 -->
          <div id="regionsPanel" class="flex-1 flex flex-col">
            <div class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 class="text-sm font-medium text-white">检测区域</h3>
              <div class="flex items-center space-x-2">
                <button id="selectAllBtn" class="text-xs text-blue-400 hover:text-blue-300" disabled>全选</button>
                <button id="deselectAllBtn" class="text-xs text-gray-400 hover:text-gray-300" disabled>取消</button>
              </div>
            </div>
            <div id="regionsList" class="flex-1 overflow-y-auto p-2">
              <div class="text-center text-gray-500 text-sm py-8">
                <i class="fas fa-image text-2xl mb-2 block"></i>
                请先加载图片并进行区域检测
              </div>
            </div>
          </div>
          <!-- 导出设置面板 -->
          <div id="exportPanel" class="p-4 border-t border-gray-700">
            <h3 class="text-sm font-medium text-white mb-3">导出设置</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">文件格式</label>
                <select id="exportFormat" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                  <option value="png">PNG (推荐)</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WebP</option>
                  <option value="bmp">BMP</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">质量</label>
                <div class="flex items-center space-x-2">
                  <input type="range" id="exportQuality" min="0.1" max="1" step="0.1" value="0.9" class="flex-1 slider">
                  <span id="qualityValue" class="text-xs text-gray-300 w-8">90%</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">边距</label>
                <input type="number" id="exportPadding" min="0" max="50" value="0" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">缩放</label>
                <div class="flex items-center space-x-2">
                  <input type="range" id="exportScale" min="0.1" max="3" step="0.1" value="1" class="flex-1 slider">
                  <span id="scaleValue" class="text-xs text-gray-300 w-12">100%</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">命名模式</label>
                <input type="text" id="namingPattern" value="region_{index}" placeholder="region_{index}" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
              </div>
              <div>
                <label class="flex items-center text-xs text-gray-400">
                  <input type="checkbox" id="zipOutput" class="mr-2"> 打包为ZIP
                </label>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">背景色</label>
                <div class="flex items-center space-x-2">
                  <input type="color" id="backgroundColor" value="#ffffff" class="w-8 h-8 rounded border border-gray-600">
                  <span class="text-xs text-gray-300">透明背景</span>
                  <input type="checkbox" id="transparentBg" checked class="ml-auto">
                </div>
              </div>
            </div>
          </div>
        </aside>
        <!-- 中央画布区域 -->
        <section id="canvasArea" class="flex-1 flex flex-col bg-gray-900 relative">
          <!-- 画布工具栏 -->
          <div class="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div id="imageInfo" class="text-sm text-gray-400">
                <span id="imageName">未加载图片</span>
                <span id="imageDimensions" class="ml-2"></span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- 缩放控制 -->
              <div class="flex items-center space-x-2 text-sm">
                <button id="zoomOutBtn" class="btn-ghost-sm">
                  <i class="fas fa-search-minus"></i>
                </button>
                <span id="zoomLevel" class="text-gray-400 w-12 text-center">100%</span>
                <button id="zoomInBtn" class="btn-ghost-sm">
                  <i class="fas fa-search-plus"></i>
                </button>
                <button id="fitToScreenBtn" class="btn-ghost-sm ml-2" title="适应屏幕">
                  <i class="fas fa-expand-arrows-alt"></i>
                </button>
              </div>
            </div>
          </div>
          <!-- 画布容器 -->
          <div id="canvasContainer" class="flex-1 relative overflow-hidden">
            <!-- 拖拽上传区域 -->
            <div id="dropZone" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <i class="fas fa-cloud-upload-alt text-3xl text-gray-500"></i>
                </div>
                <h3 class="text-xl font-medium text-gray-300 mb-2">拖拽图片到此处</h3>
                <p class="text-gray-500 mb-4">或点击上方"打开图片"按钮选择文件</p>
                <p class="text-sm text-gray-600">支持 PNG, JPG, GIF, WebP 格式</p>
              </div>
            </div>
            <!-- 主画布 -->
            <canvas id="mainCanvas" class="absolute top-0 left-0 cursor-crosshair hidden"></canvas>
            <!-- 区域覆盖层 -->
            <canvas id="overlayCanvas" class="absolute top-0 left-0 pointer-events-none hidden"></canvas>
            <!-- 加载指示器 -->
            <div id="loadingIndicator" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p class="text-white">处理中...</p>
                <div id="progressBar" class="w-64 bg-gray-700 rounded-full h-2 mt-2">
                  <div id="progressFill" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <!-- 底部状态栏 -->
      <footer id="statusBar" class="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
        <div class="flex items-center space-x-4">
          <span id="statusText" class="text-gray-400">就绪</span>
          <div id="regionCount" class="text-gray-500">区域: 0</div>
          <div id="selectedCount" class="text-gray-500">已选: 0</div>
        </div>
        <div class="flex items-center space-x-4">
          <div id="mousePos" class="text-gray-500">0, 0</div>
          <div id="imageSize" class="text-gray-500">0 × 0</div>
          <div id="performanceInfo" class="text-gray-500">内存: 0MB</div>
        </div>
      </footer>
    </div>
    <!-- 模态框容器 -->
    <div id="modalContainer"></div>
    <!-- 导出进度模态框 -->
    <div id="exportModal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h3>导出进度</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="progress-container">
            <div class="progress-bar">
              <div id="exportProgress" class="progress-fill"></div>
            </div>
            <div id="exportStatus" class="progress-text">准备导出...</div>
          </div>
          <div id="exportDetails" class="export-details"></div>
        </div>
        <div class="modal-footer">
          <button id="cancelExportBtn" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>
    <!-- 数据导出模态框 -->
    <div id="dataExportModal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h3>导出区域数据</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="dataFormat">数据格式:</label>
            <select id="dataFormat" class="form-control">
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="includePixels"> 包含像素数据
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="relativePaths" checked> 使用相对坐标
            </label>
          </div>
          <div class="preview-container">
            <h4>预览:</h4>
            <pre id="dataPreview" class="data-preview"></pre>
          </div>
        </div>
        <div class="modal-footer">
          <button id="downloadDataBtn" class="btn btn-primary">下载</button>
          <button class="btn btn-secondary modal-close">取消</button>
        </div>
      </div>
    </div>
    <!-- 上下文菜单 -->
    <div id="contextMenu" class="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 hidden z-50">
      <button class="context-menu-item" data-action="select">
        <i class="fas fa-mouse-pointer mr-2"></i>选择区域
      </button>
      <button class="context-menu-item" data-action="edit">
        <i class="fas fa-edit mr-2"></i>编辑边界
      </button>
      <div class="border-t border-gray-600 my-1"></div>
      <button class="context-menu-item" data-action="merge">
        <i class="fas fa-object-group mr-2"></i>合并区域
      </button>
      <button class="context-menu-item" data-action="split">
        <i class="fas fa-cut mr-2"></i>分割区域
      </button>
      <div class="border-t border-gray-600 my-1"></div>
      <button class="context-menu-item" data-action="export">
        <i class="fas fa-download mr-2"></i>导出区域
      </button>
      <button class="context-menu-item text-red-400" data-action="delete">
        <i class="fas fa-trash mr-2"></i>删除区域
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlbumCropping',
  data() {
    return {
      scriptsLoaded: false
    }
  },
  mounted() {
    this.loadExternalResources()
  },
  beforeUnmount() {
    // 清理资源
    if (window.albumCroppingCleanup) {
      window.albumCroppingCleanup()
    }
  },
  methods: {
    loadExternalResources() {
      // 加载外部CSS资源
      const cssLinks = [
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
        'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap'
      ]

      cssLinks.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = href
          document.head.appendChild(link)
        }
      })

      // 加载本地CSS
      const localCss = document.createElement('link')
      localCss.rel = 'stylesheet'
      localCss.href = '/tools/album_cropping/css/main.css'
      document.head.appendChild(localCss)

      // 加载JSZip库
      this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
        .then(() => {
          // 按顺序加载本地JS文件
          return this.loadScript('/tools/album_cropping/js/utils.js')
        })
        .then(() => {
          return this.loadScript('/tools/album_cropping/js/export.js')
        })
        .then(() => {
          return this.loadScript('/tools/album_cropping/js/main.js')
        })
        .then(() => {
          this.scriptsLoaded = true
          console.log('Album Cropping Tool initialized')
        })
        .catch(error => {
          console.error('Error loading scripts:', error)
        })
    },
    loadScript(src) {
      return new Promise((resolve, reject) => {
        // 检查是否已经加载
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
    }
  }
}
</script>

<style scoped>
.album-cropping-wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
}

/* 确保组件样式不会被VuePress覆盖 */
.album-cropping-wrapper * {
  box-sizing: border-box;
}
</style>

