/**
 * 游戏图集裁剪工具 - 主JavaScript文件
 * 实现图像处理、区域检测、编辑功能和导出功能
 */

class GameAtlasCropper {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImage = null;
        this.currentImage = null;
        this.regions = [];
        this.selectedRegions = [];
        this.currentTool = 'select';
        this.isDrawing = false;
        this.startPoint = null;
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // 性能优化
        this.worker = null;
        this.imageCache = new Map();
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化应用
     */
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupWorker();
        this.updateUI();
        
        console.log('游戏图集裁剪工具已初始化');
    }
    
    /**
     * 设置画布
     */
    setupCanvas() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布大小
        this.resizeCanvas();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * 调整画布大小
     */
    resizeCanvas() {
        const container = document.getElementById('canvasContainer');
        const dpr = window.devicePixelRatio || 1;
        
        // 获取CSS尺寸
        const cssWidth = container.clientWidth;
        const cssHeight = container.clientHeight;
        
        // 设置画布的实际像素尺寸（考虑设备像素比）
        this.canvas.width = cssWidth * dpr;
        this.canvas.height = cssHeight * dpr;
        
        // 设置画布的CSS尺寸
        this.canvas.style.width = cssWidth + 'px';
        this.canvas.style.height = cssHeight + 'px';
        
        // 缩放绘图上下文以匹配设备像素比
        this.ctx.scale(dpr, dpr);
        
        // 禁用图像平滑以保持像素图的锐利度
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        this.redraw();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 文件拖拽
        this.setupDragAndDrop();
        
        // 画布交互
        this.setupCanvasEvents();
        
        // 工具栏按钮
        this.setupToolbarEvents();
        
        // 键盘快捷键
        this.setupKeyboardEvents();
        
        // 窗口调整
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * 设置拖拽功能
     */
    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                
                console.log('拖拽文件事件触发:', e.dataTransfer.files);
                const files = Array.from(e.dataTransfer.files);
                console.log('拖拽的文件列表:', files.map(f => ({name: f.name, type: f.type, size: f.size})));
                const imageFile = files.find(file => file.type.startsWith('image/'));
                
                if (imageFile) {
                    console.log('找到图像文件:', imageFile.name, imageFile.type);
                    this.loadImage(imageFile);
                } else {
                    console.log('没有找到图像文件');
                }
            });
        }
        
        // 文件输入
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('文件输入变化事件触发:', e.target.files);
                const file = e.target.files[0];
                if (file) {
                    console.log('选择的文件:', file.name, file.type, file.size);
                    this.loadImage(file);
                } else {
                    console.log('没有选择文件');
                }
            });
        }
    }
    
    /**
     * 设置画布事件
     */
    setupCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    }
    
    /**
     * 设置工具栏事件
     */
    setupToolbarEvents() {
        // 工具选择
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTool(e.target.dataset.tool);
            });
        });
        
        // 功能按钮 - 添加null检查
        const openFileBtn = document.getElementById('openFileBtn');
        const fileInput = document.getElementById('fileInput');
        if (openFileBtn && fileInput) {
            openFileBtn.addEventListener('click', () => {
                console.log('打开文件按钮被点击');
                fileInput.click();
            });
        }

        const backToListBtn = document.getElementById('backToListBtn');
        if (backToListBtn) {
            backToListBtn.addEventListener("click", () => {
                window.location.href = "/tools/index"
            })
        }
        
        const autoDetectBtn = document.getElementById('autoDetectBtn');
        if (autoDetectBtn) {
            console.log('自动检测按钮找到，绑定事件监听器');
            autoDetectBtn.addEventListener('click', () => {
                console.log('自动检测按钮点击事件触发');
                this.autoDetectRegions();
            });
        } else {
            console.error('找不到自动检测按钮元素');
        }
        
        const clearRegionsBtn = document.getElementById('clearRegionsBtn');
        if (clearRegionsBtn) {
            clearRegionsBtn.addEventListener('click', () => {
                this.clearRegions();
            });
        }
        
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undo();
            });
        }
        
        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.redo();
            });
        }
        
        const zoomInBtn = document.getElementById('zoomInBtn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoom(1.2);
            });
        }
        
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoom(0.8);
            });
        }
        
        const fitToScreenBtn = document.getElementById('fitToScreenBtn');
        if (fitToScreenBtn) {
            fitToScreenBtn.addEventListener('click', () => {
                this.fitToCanvas();
            });
        }
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSelected();
            });
        }
        
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.exportAll();
            });
        }
        
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // 阈值滑块
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        if (sensitivitySlider) {
            sensitivitySlider.addEventListener('input', (e) => {
                this.updateThreshold(parseInt(e.target.value));
            });
        }
        
        // 最小尺寸滑块
        const minSizeSlider = document.getElementById('minSizeSlider');
        if (minSizeSlider) {
            minSizeSlider.addEventListener('input', (e) => {
                this.updateMinSize(parseInt(e.target.value));
            });
        }
    }
    
    /**
     * 设置键盘事件
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'o':
                        e.preventDefault();
                        document.getElementById('fileInput').click();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'a':
                        e.preventDefault();
                        this.selectAll();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.autoDetectRegions();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportSelected();
                        break;
                }
            } else {
                switch (e.key) {
                    case 'Delete':
                        this.deleteSelected();
                        break;
                    case 'Escape':
                        this.clearSelection();
                        break;
                    case 'v':
                        this.setTool('select');
                        break;
                    case 'r':
                        this.setTool('rectangle');
                        break;
                    case 'c':
                        this.setTool('circle');
                        break;
                    case 'p':
                        this.setTool('polygon');
                        break;
                }
            }
        });
    }
    
    /**
     * 设置Web Worker
     */
    setupWorker() {
        // 创建内联Worker用于图像处理
        const workerCode = `
            self.onmessage = function(e) {
                console.log('Worker收到消息:', e.data.type);
                const { type, data } = e.data;
                
                switch (type) {
                    case 'detectRegions':
                        console.log('Worker开始检测区域...');
                        try {
                            const regions = detectRegions(data.imageData, data.threshold, data.minSize);
                            console.log('Worker检测完成，找到区域:', regions.length);
                            self.postMessage({ type: 'regionsDetected', regions });
                        } catch (error) {
                            console.error('Worker检测过程中出错:', error);
                            self.postMessage({ type: 'error', error: error.message });
                        }
                        break;
                }
            };
            
            function detectRegions(imageData, threshold, minSize) {
                const { data, width, height } = imageData;
                const visited = new Array(width * height).fill(false);
                const regions = [];
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = y * width + x;
                        
                        if (!visited[index] && isOpaque(data, index, threshold)) {
                            const region = floodFill(data, width, height, x, y, visited, threshold);
                            
                            if (region.pixels.length >= minSize) {
                                const bounds = calculateBounds(region.pixels);
                                regions.push({
                                    id: Date.now() + Math.random(),
                                    bounds,
                                    pixels: region.pixels,
                                    area: region.pixels.length
                                });
                            }
                        }
                    }
                }
                
                return regions;
            }
            
            function isOpaque(data, index, threshold) {
                return data[index * 4 + 3] > threshold;
            }
            
            function floodFill(data, width, height, startX, startY, visited, threshold) {
                const stack = [{ x: startX, y: startY }];
                const pixels = [];
                
                while (stack.length > 0) {
                    const { x, y } = stack.pop();
                    const index = y * width + x;
                    
                    if (x < 0 || x >= width || y < 0 || y >= height || visited[index]) {
                        continue;
                    }
                    
                    if (!isOpaque(data, index, threshold)) {
                        continue;
                    }
                    
                    visited[index] = true;
                    pixels.push({ x, y });
                    
                    stack.push(
                        { x: x + 1, y },
                        { x: x - 1, y },
                        { x, y: y + 1 },
                        { x, y: y - 1 }
                    );
                }
                
                return { pixels };
            }
            
            function calculateBounds(pixels) {
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;
                
                pixels.forEach(({ x, y }) => {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                });
                
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1
                };
            }
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        
        this.worker.onmessage = (e) => {
            const { type, regions, error } = e.data;
            console.log('收到Worker消息:', { type, regionsCount: regions ? regions.length : 0 });
            
            if (type === 'regionsDetected') {
                console.log('检测到区域:', regions.length, '个');
                this.regions = regions;
                this.saveState();
                this.updateRegionsList();
                this.redraw();
                this.hideLoading();
                this.showSuccess(`检测完成，找到 ${regions.length} 个区域`);
            } else if (type === 'error') {
                console.error('Worker返回错误:', error);
                this.hideLoading();
                this.showError('图像检测失败: ' + error);
            }
        };
        
        this.worker.onerror = (error) => {
            console.error('Worker错误:', error);
            this.hideLoading();
            this.showError('图像处理过程中发生错误');
        };
    }
    
    /**
     * 加载图像
     */
    async loadImage(file) {
        try {
            console.log('开始加载图像:', file.name, file.type, file.size);
            this.showLoading('正在加载图像...');
            
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                this.hideLoading();
                this.showError('请选择有效的图像文件');
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                console.log('图像加载成功:', img.width, 'x', img.height);
                this.originalImage = img;
                this.currentImage = img;
                this.regions = [];
                this.selectedRegions = [];
                this.scale = 1;
                this.offset = { x: 0, y: 0 };
                
                // 显示画布，隐藏拖拽区域
                const canvas = document.getElementById('mainCanvas');
                const dropZone = document.getElementById('dropZone');
                if (canvas) {
                    canvas.classList.remove('hidden');
                }
                if (dropZone) {
                    dropZone.classList.add('hidden');
                }
                
                this.fitToCanvas();
                this.saveState();
                this.updateUI();
                this.hideLoading();
                
                console.log(`图像已加载: ${img.width}x${img.height}`);
            };
            
            img.onerror = (error) => {
                console.error('图像加载失败:', error);
                this.hideLoading();
                this.showError('图像加载失败');
            };
            
            const url = URL.createObjectURL(file);
            console.log('创建对象URL:', url);
            img.src = url;
            
        } catch (error) {
            console.error('loadImage异常:', error);
            this.hideLoading();
            this.showError('图像加载失败: ' + error.message);
        }
    }
    
    /**
     * 自动检测区域
     */
    autoDetectRegions() {
        console.log('自动检测按钮被点击');
        
        if (!this.currentImage) {
            console.error('没有加载图像');
            this.showError('请先加载图像');
            return;
        }
        
        console.log('开始自动检测区域...');
        this.showLoading('正在检测区域...');
        
        // 创建临时画布获取图像数据
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.currentImage.width;
        tempCanvas.height = this.currentImage.height;
        
        tempCtx.drawImage(this.currentImage, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 获取检测参数
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const minSizeSlider = document.getElementById('minSizeSlider');
        
        if (!sensitivitySlider || !minSizeSlider) {
            console.error('找不到滑块元素');
            this.hideLoading();
            this.showError('界面元素缺失，请刷新页面');
            return;
        }
        
        const threshold = parseInt(sensitivitySlider.value);
        const minSize = parseInt(minSizeSlider.value);
        
        console.log('检测参数:', { threshold, minSize, imageSize: `${tempCanvas.width}x${tempCanvas.height}` });
        
        // 检查Worker是否存在
        if (!this.worker) {
            console.error('Worker未初始化');
            this.hideLoading();
            this.showError('图像处理器未初始化');
            return;
        }
        
        // 发送到Worker处理
        console.log('发送数据到Worker进行处理...');
        this.worker.postMessage({
            type: 'detectRegions',
            data: { imageData, threshold, minSize }
        });
    }
    
    /**
     * 设置工具
     */
    setTool(tool) {
        this.currentTool = tool;
        
        // 更新UI
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const toolButton = document.querySelector(`[data-tool="${tool}"]`);
        if (toolButton) {
            toolButton.classList.add('active');
        } else {
            console.warn(`Tool button not found for tool: ${tool}`);
        }
        
        // 更新光标
        this.updateCursor();
    }
    
    /**
     * 更新光标
     */
    updateCursor() {
        const cursors = {
            select: 'default',
            rectangle: 'crosshair',
            circle: 'crosshair',
            polygon: 'crosshair',
            pan: 'grab'
        };
        
        this.canvas.style.cursor = cursors[this.currentTool] || 'default';
    }
    
    /**
     * 处理鼠标按下
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.isDrawing = true;
        this.startPoint = { x, y };
        
        const worldPos = this.screenToWorld(x, y);
        
        switch (this.currentTool) {
            case 'select':
                this.handleSelectStart(worldPos, e.shiftKey);
                break;
            case 'rectangle':
                this.handleRectangleStart(worldPos);
                break;
            case 'circle':
                this.handleCircleStart(worldPos);
                break;
            case 'pan':
                this.canvas.style.cursor = 'grabbing';
                break;
        }
    }
    
    /**
     * 处理鼠标移动
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        
        if (this.isDrawing) {
            switch (this.currentTool) {
                case 'rectangle':
                    this.handleRectangleDrag(worldPos);
                    break;
                case 'circle':
                    this.handleCircleDrag(worldPos);
                    break;
                case 'pan':
                    this.handlePan(x - this.startPoint.x, y - this.startPoint.y);
                    this.startPoint = { x, y };
                    break;
            }
        } else {
            // 悬停效果
            this.handleHover(worldPos);
        }
        
        // 更新状态栏
        this.updateStatusBar(worldPos);
    }
    
    /**
     * 处理鼠标抬起
     */
    handleMouseUp(e) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        
        switch (this.currentTool) {
            case 'rectangle':
                this.handleRectangleEnd(worldPos);
                break;
            case 'circle':
                this.handleCircleEnd(worldPos);
                break;
            case 'pan':
                this.canvas.style.cursor = 'grab';
                break;
        }
    }
    
    /**
     * 处理滚轮缩放
     */
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoomAt(x, y, delta);
    }
    
    /**
     * 处理右键菜单
     */
    handleContextMenu(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        const region = this.getRegionAt(worldPos);
        
        if (region) {
            this.showContextMenu(e.clientX, e.clientY, region);
        }
    }
    
    /**
     * 屏幕坐标转世界坐标
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.offset.x) / this.scale,
            y: (screenY - this.offset.y) / this.scale
        };
    }
    
    /**
     * 世界坐标转屏幕坐标
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.offset.x,
            y: worldY * this.scale + this.offset.y
        };
    }
    
    /**
     * 缩放
     */
    zoom(factor) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.zoomAt(centerX, centerY, factor);
    }
    
    /**
     * 在指定点缩放
     */
    zoomAt(screenX, screenY, factor) {
        const worldPos = this.screenToWorld(screenX, screenY);
        
        this.scale *= factor;
        this.scale = Math.max(0.1, Math.min(10, this.scale));
        
        const newScreenPos = this.worldToScreen(worldPos.x, worldPos.y);
        
        this.offset.x += screenX - newScreenPos.x;
        this.offset.y += screenY - newScreenPos.y;
        
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 适应画布
     */
    fitToCanvas() {
        if (!this.currentImage) return;
        
        const container = document.getElementById('canvasContainer');
        const padding = 50;
        const availableWidth = container.clientWidth - padding * 2;
        const availableHeight = container.clientHeight - padding * 2;
        
        const scaleX = availableWidth / this.currentImage.width;
        const scaleY = availableHeight / this.currentImage.height;
        
        this.scale = Math.min(scaleX, scaleY);
        
        this.offset.x = (container.clientWidth - this.currentImage.width * this.scale) / 2;
        this.offset.y = (container.clientHeight - this.currentImage.height * this.scale) / 2;
        
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 重绘画布
     */
    redraw() {
        const dpr = window.devicePixelRatio || 1;
        
        // 保存当前变换状态
        this.ctx.save();
        
        // 重置变换并清除画布
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 恢复DPR缩放
        this.ctx.scale(dpr, dpr);
        
        // 设置图像渲染质量
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        if (this.currentImage) {
            // 绘制图像
            this.ctx.drawImage(
                this.currentImage,
                this.offset.x,
                this.offset.y,
                this.currentImage.width * this.scale,
                this.currentImage.height * this.scale
            );
            
            // 绘制区域
            this.drawRegions();
        }
        
        // 恢复变换状态
        this.ctx.restore();
    }
    
    /**
     * 绘制区域
     */
    drawRegions() {
        this.regions.forEach(region => {
            const isSelected = this.selectedRegions.includes(region.id);
            
            this.ctx.strokeStyle = isSelected ? '#f093fb' : '#667eea';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.fillStyle = isSelected ? 'rgba(240, 147, 251, 0.15)' : 'rgba(102, 126, 234, 0.1)';
            
            const screenPos = this.worldToScreen(region.bounds.x, region.bounds.y);
            const width = region.bounds.width * this.scale;
            const height = region.bounds.height * this.scale;
            
            this.ctx.fillRect(screenPos.x, screenPos.y, width, height);
            this.ctx.strokeRect(screenPos.x, screenPos.y, width, height);
            
            // 绘制控制点
            if (isSelected) {
                this.drawControlPoints(region);
            }
        });
    }
    
    /**
     * 绘制控制点
     */
    drawControlPoints(region) {
        const screenPos = this.worldToScreen(region.bounds.x, region.bounds.y);
        const width = region.bounds.width * this.scale;
        const height = region.bounds.height * this.scale;
        
        const points = [
            { x: screenPos.x, y: screenPos.y },
            { x: screenPos.x + width / 2, y: screenPos.y },
            { x: screenPos.x + width, y: screenPos.y },
            { x: screenPos.x + width, y: screenPos.y + height / 2 },
            { x: screenPos.x + width, y: screenPos.y + height },
            { x: screenPos.x + width / 2, y: screenPos.y + height },
            { x: screenPos.x, y: screenPos.y + height },
            { x: screenPos.x, y: screenPos.y + height / 2 }
        ];
        
        this.ctx.fillStyle = '#667eea';
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        
        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        // 更新缩放显示
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
        }
        
        // 更新按钮状态
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
        }
        
        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
        }
        
        // 自动检测按钮状态 - 只有加载图像后才启用
        const autoDetectBtn = document.getElementById('autoDetectBtn');
        if (autoDetectBtn) {
            autoDetectBtn.disabled = !this.currentImage;
        }
        
        // 清除区域按钮状态 - 只有存在区域时才启用
        const clearRegionsBtn = document.getElementById('clearRegionsBtn');
        if (clearRegionsBtn) {
            clearRegionsBtn.disabled = this.regions.length === 0;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.disabled = this.selectedRegions.length === 0;
        }
        
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn) {
            exportAllBtn.disabled = this.regions.length === 0;
        }
        
        // 更新区域计数
        const regionCount = document.getElementById('regionCount');
        if (regionCount) {
            regionCount.textContent = this.regions.length;
        }
        
        const selectedCount = document.getElementById('selectedCount');
        if (selectedCount) {
            selectedCount.textContent = this.selectedRegions.length;
        }
    }
    
    /**
     * 重置UI到初始状态
     */
    resetUI() {
        const canvas = document.getElementById('mainCanvas');
        const dropZone = document.getElementById('dropZone');
        
        if (canvas) {
            canvas.classList.add('hidden');
        }
        if (dropZone) {
            dropZone.classList.remove('hidden');
        }
        
        this.originalImage = null;
        this.currentImage = null;
        this.regions = [];
        this.selectedRegions = [];
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        
        this.updateUI();
    }
    
    /**
     * 更新区域列表
     */
    updateRegionsList() {
        const container = document.getElementById('regionsList');
        container.innerHTML = '';
        
        this.regions.forEach((region, index) => {
            const item = this.createRegionListItem(region, index);
            container.appendChild(item);
        });
    }
    
    /**
     * 创建区域列表项
     */
    createRegionListItem(region, index) {
        const item = document.createElement('div');
        item.className = 'region-item';
        item.dataset.regionId = region.id;
        
        if (this.selectedRegions.includes(region.id)) {
            item.classList.add('selected');
        }
        
        item.innerHTML = `
            <div class="region-preview"></div>
            <div class="region-info">
                <div class="region-name">区域 ${index + 1}</div>
                <div class="region-size">${region.bounds.width} × ${region.bounds.height}</div>
            </div>
            <div class="region-actions">
                <button class="btn-ghost-sm" data-action="edit" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-ghost-sm" data-action="delete" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 事件监听
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.region-actions')) {
                this.toggleRegionSelection(region.id, e.shiftKey);
            }
        });
        
        const editBtn = item.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editRegion(region.id);
            });
        }
        
        const deleteBtn = item.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteRegion(region.id);
            });
        }
        
        return item;
    }
    
    /**
     * 保存状态
     */
    saveState() {
        const state = {
            regions: JSON.parse(JSON.stringify(this.regions)),
            selectedRegions: [...this.selectedRegions]
        };
        
        // 移除超出限制的历史记录
        if (this.history.length >= this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        // 移除当前位置之后的历史记录
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        this.history.push(state);
        this.historyIndex++;
        
        this.updateUI();
    }
    
    /**
     * 撤销
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }
    
    /**
     * 重做
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }
    
    /**
     * 恢复状态
     */
    restoreState(state) {
        this.regions = JSON.parse(JSON.stringify(state.regions));
        this.selectedRegions = [...state.selectedRegions];
        
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 导出选中区域
     */
    async exportSelected() {
        if (this.selectedRegions.length === 0) {
            this.showError('请先选择要导出的区域');
            return;
        }
        
        this.showLoading('正在导出...');
        
        try {
            const selectedRegions = this.regions.filter(region => 
                this.selectedRegions.includes(region.id)
            );
            
            await this.exportRegions(selectedRegions);
            this.hideLoading();
            this.showSuccess(`成功导出 ${selectedRegions.length} 个区域`);
        } catch (error) {
            this.hideLoading();
            this.showError('导出失败: ' + error.message);
        }
    }
    
    /**
     * 导出所有区域
     */
    async exportAll() {
        if (this.regions.length === 0) {
            this.showError('没有可导出的区域');
            return;
        }
        
        this.showLoading('正在导出...');
        
        try {
            await this.exportRegions(this.regions);
            this.hideLoading();
            this.showSuccess(`成功导出 ${this.regions.length} 个区域`);
        } catch (error) {
            this.hideLoading();
            this.showError('导出失败: ' + error.message);
        }
    }
    
    /**
     * 导出区域
     */
    async exportRegions(regions) {
        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = region.bounds.width;
            canvas.height = region.bounds.height;
            
            // 绘制区域
            ctx.drawImage(
                this.currentImage,
                region.bounds.x, region.bounds.y,
                region.bounds.width, region.bounds.height,
                0, 0,
                region.bounds.width, region.bounds.height
            );
            
            // 转换为Blob并下载
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `region_${i + 1}.png`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            // 更新进度
            this.updateProgress((i + 1) / regions.length * 100);
        }
    }
    
    /**
     * 导出数据
     */
    async exportData() {
        if (this.regions.length === 0) {
            this.showError('没有可导出的区域数据');
            return;
        }
        
        this.showLoading('正在导出数据...');
        
        try {
            const result = window.exportManager.exportRegionData(
                this.regions,
                'json',
                {
                    imageWidth: this.currentImage ? this.currentImage.width : 1,
                    imageHeight: this.currentImage ? this.currentImage.height : 1,
                    relativePaths: true
                }
            );
            
            window.exportManager.downloadFile(result.blob, result.filename);
            this.hideLoading();
            this.showSuccess(`成功导出 ${result.count} 个区域的数据`);
        } catch (error) {
            this.hideLoading();
            this.showError('导出数据失败: ' + error.message);
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading(message = '加载中...') {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            const loadingText = loading.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            loading.classList.remove('hidden');
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
    
    /**
     * 更新进度
     */
    updateProgress(percent) {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }
    
    /**
     * 显示错误消息
     */
    showError(message) {
        console.error(message);
        // 这里可以添加更好的错误显示UI
        alert('错误: ' + message);
    }
    
    /**
     * 显示成功消息
     */
    showSuccess(message) {
        console.log(message);
        // 这里可以添加更好的成功显示UI
        alert('成功: ' + message);
    }
    
    /**
     * 更新状态栏
     */
    updateStatusBar(worldPos) {
        if (this.currentImage) {
            const x = Math.round(worldPos.x);
            const y = Math.round(worldPos.y);
            
            const mousePos = document.getElementById('mousePos');
            if (mousePos) {
                mousePos.textContent = `${x}, ${y}`;
            }
            
            const imageSize = document.getElementById('imageSize');
            if (imageSize) {
                imageSize.textContent = `${this.currentImage.width} × ${this.currentImage.height}`;
            }
        }
    }

    /**
     * 处理选择工具的开始操作
     */
    handleSelectStart(worldPos, shiftKey) {
        const region = this.getRegionAt(worldPos);
        
        if (region) {
            if (shiftKey) {
                this.toggleRegionSelection(region.id);
            } else {
                if (!this.selectedRegions.includes(region.id)) {
                    this.selectedRegions = [region.id];
                }
            }
        } else {
            if (!shiftKey) {
                this.selectedRegions = [];
            }
        }
        
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 处理矩形绘制开始
     */
    handleRectangleStart(worldPos) {
        this.currentDrawing = {
            type: 'rectangle',
            startX: worldPos.x,
            startY: worldPos.y,
            endX: worldPos.x,
            endY: worldPos.y
        };
    }
    
    /**
     * 处理矩形绘制拖拽
     */
    handleRectangleDrag(worldPos) {
        if (this.currentDrawing && this.currentDrawing.type === 'rectangle') {
            this.currentDrawing.endX = worldPos.x;
            this.currentDrawing.endY = worldPos.y;
            this.redraw();
            this.drawCurrentDrawing();
        }
    }
    
    /**
     * 处理矩形绘制结束
     */
    handleRectangleEnd(worldPos) {
        if (this.currentDrawing && this.currentDrawing.type === 'rectangle') {
            const { startX, startY, endX, endY } = this.currentDrawing;
            
            const x = Math.min(startX, endX);
            const y = Math.min(startY, endY);
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            if (width > 5 && height > 5) {
                const region = {
                    id: Date.now() + Math.random(),
                    bounds: { x, y, width, height },
                    type: 'manual'
                };
                
                this.regions.push(region);
                this.saveState();
                this.updateRegionsList();
            }
            
            this.currentDrawing = null;
            this.redraw();
        }
    }
    
    /**
     * 处理圆形绘制开始
     */
    handleCircleStart(worldPos) {
        this.currentDrawing = {
            type: 'circle',
            centerX: worldPos.x,
            centerY: worldPos.y,
            radius: 0
        };
    }
    
    /**
     * 处理圆形绘制拖拽
     */
    handleCircleDrag(worldPos) {
        if (this.currentDrawing && this.currentDrawing.type === 'circle') {
            const dx = worldPos.x - this.currentDrawing.centerX;
            const dy = worldPos.y - this.currentDrawing.centerY;
            this.currentDrawing.radius = Math.sqrt(dx * dx + dy * dy);
            this.redraw();
            this.drawCurrentDrawing();
        }
    }
    
    /**
     * 处理圆形绘制结束
     */
    handleCircleEnd(worldPos) {
        if (this.currentDrawing && this.currentDrawing.type === 'circle') {
            const { centerX, centerY, radius } = this.currentDrawing;
            
            if (radius > 5) {
                const region = {
                    id: Date.now() + Math.random(),
                    bounds: {
                        x: centerX - radius,
                        y: centerY - radius,
                        width: radius * 2,
                        height: radius * 2
                    },
                    type: 'manual',
                    shape: 'circle',
                    centerX,
                    centerY,
                    radius
                };
                
                this.regions.push(region);
                this.saveState();
                this.updateRegionsList();
            }
            
            this.currentDrawing = null;
            this.redraw();
        }
    }
    
    /**
     * 处理平移
     */
    handlePan(deltaX, deltaY) {
        this.offset.x += deltaX;
        this.offset.y += deltaY;
        this.redraw();
    }
    
    /**
     * 处理悬停
     */
    handleHover(worldPos) {
        const region = this.getRegionAt(worldPos);
        
        if (region !== this.hoveredRegion) {
            this.hoveredRegion = region;
            this.redraw();
        }
    }
    
    /**
     * 绘制当前绘制状态
     */
    drawCurrentDrawing() {
        if (!this.currentDrawing) return;
        
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        if (this.currentDrawing.type === 'rectangle') {
            const { startX, startY, endX, endY } = this.currentDrawing;
            const startScreen = this.worldToScreen(startX, startY);
            const endScreen = this.worldToScreen(endX, endY);
            
            const x = Math.min(startScreen.x, endScreen.x);
            const y = Math.min(startScreen.y, endScreen.y);
            const width = Math.abs(endScreen.x - startScreen.x);
            const height = Math.abs(endScreen.y - startScreen.y);
            
            this.ctx.strokeRect(x, y, width, height);
        } else if (this.currentDrawing.type === 'circle') {
            const { centerX, centerY, radius } = this.currentDrawing;
            const centerScreen = this.worldToScreen(centerX, centerY);
            const radiusScreen = radius * this.scale;
            
            this.ctx.beginPath();
            this.ctx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    /**
     * 获取指定位置的区域
     */
    getRegionAt(worldPos) {
        for (let i = this.regions.length - 1; i >= 0; i--) {
            const region = this.regions[i];
            
            if (region.shape === 'circle') {
                const dx = worldPos.x - region.centerX;
                const dy = worldPos.y - region.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= region.radius) {
                    return region;
                }
            } else {
                if (Utils.Math.pointInRect(worldPos, region.bounds)) {
                    return region;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 切换区域选择状态
     */
    toggleRegionSelection(regionId, shiftKey = false) {
        const index = this.selectedRegions.indexOf(regionId);
        
        if (index === -1) {
            if (shiftKey) {
                this.selectedRegions.push(regionId);
            } else {
                this.selectedRegions = [regionId];
            }
        } else {
            if (shiftKey) {
                this.selectedRegions.splice(index, 1);
            } else {
                this.selectedRegions = this.selectedRegions.length === 1 ? [] : [regionId];
            }
        }
        
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 选择所有区域
     */
    selectAll() {
        this.selectedRegions = this.regions.map(region => region.id);
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 清除选择
     */
    clearSelection() {
        this.selectedRegions = [];
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 删除选中区域
     */
    deleteSelected() {
        if (this.selectedRegions.length === 0) return;
        
        this.regions = this.regions.filter(region => 
            !this.selectedRegions.includes(region.id)
        );
        
        this.selectedRegions = [];
        this.saveState();
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 清除所有区域
     */
    clearRegions() {
        if (this.regions.length === 0) return;
        
        if (confirm('确定要清除所有区域吗？此操作无法撤销。')) {
            this.regions = [];
            this.selectedRegions = [];
            this.saveState();
            this.updateRegionsList();
            this.redraw();
            this.updateUI();
        }
    }
    
    /**
     * 编辑区域
     */
    editRegion(regionId) {
        const region = this.regions.find(r => r.id === regionId);
        if (!region) return;
        
        // 选中该区域
        this.selectedRegions = [regionId];
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
        
        // 切换到选择工具
        this.setTool('select');
    }
    
    /**
     * 删除区域
     */
    deleteRegion(regionId) {
        const index = this.regions.findIndex(r => r.id === regionId);
        if (index === -1) return;
        
        this.regions.splice(index, 1);
        
        const selectedIndex = this.selectedRegions.indexOf(regionId);
        if (selectedIndex !== -1) {
            this.selectedRegions.splice(selectedIndex, 1);
        }
        
        this.saveState();
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 更新阈值
     */
    updateThreshold(value) {
        const sensitivityValue = document.getElementById('sensitivityValue');
        if (sensitivityValue) {
            sensitivityValue.textContent = value;
        }
        
        // 如果有图像，可以实时预览检测结果
        if (this.currentImage && this.regions.length > 0) {
            // 这里可以添加实时预览逻辑
        }
    }
    
    /**
     * 更新最小尺寸
     */
    updateMinSize(value) {
        const minSizeValue = document.getElementById('minSizeValue');
        if (minSizeValue) {
            minSizeValue.textContent = value;
        }
        
        // 如果有图像，可以实时预览检测结果
        if (this.currentImage && this.regions.length > 0) {
            // 这里可以添加实时预览逻辑
        }
    }
    
    /**
     * 显示上下文菜单
     */
    showContextMenu(x, y, region) {
        // 移除现有菜单
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // 创建菜单
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: var(--gray-800);
            border: 1px solid var(--gray-600);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            min-width: 150px;
        `;
        
        const menuItems = [
            { text: '编辑区域', action: () => this.editRegion(region.id) },
            { text: '复制区域', action: () => this.duplicateRegion(region.id) },
            { text: '删除区域', action: () => this.deleteRegion(region.id) },
            { text: '导出区域', action: () => this.exportRegion(region.id) }
        ];
        
        menuItems.forEach(item => {
            const button = document.createElement('button');
            button.className = 'context-menu-item';
            button.textContent = item.text;
            button.addEventListener('click', () => {
                item.action();
                menu.remove();
            });
            menu.appendChild(button);
        });
        
        document.body.appendChild(menu);
        
        // 点击其他地方关闭菜单
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }
    
    /**
     * 复制区域
     */
    duplicateRegion(regionId) {
        const region = this.regions.find(r => r.id === regionId);
        if (!region) return;
        
        const newRegion = {
            ...JSON.parse(JSON.stringify(region)),
            id: Date.now() + Math.random(),
            bounds: {
                ...region.bounds,
                x: region.bounds.x + 10,
                y: region.bounds.y + 10
            }
        };
        
        this.regions.push(newRegion);
        this.saveState();
        this.updateRegionsList();
        this.redraw();
        this.updateUI();
    }
    
    /**
     * 导出单个区域
     */
    async exportRegion(regionId) {
        const region = this.regions.find(r => r.id === regionId);
        if (!region) return;
        
        try {
            await this.exportRegions([region]);
            this.showSuccess('区域导出成功');
        } catch (error) {
            this.showError('区域导出失败: ' + error.message);
        }
    }
}

window.cropper = new GameAtlasCropper();