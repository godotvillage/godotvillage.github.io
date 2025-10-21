/**
 * 游戏图集裁剪工具 - 工具函数库
 * 提供通用的辅助功能和算法
 */

/**
 * 数学工具函数
 */
const MathUtils = {
    /**
     * 限制数值在指定范围内
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * 线性插值
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * 计算两点距离
     */
    distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * 计算点到矩形的距离
     */
    pointToRectDistance(point, rect) {
        const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
        const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * 检查点是否在矩形内
     */
    pointInRect(point, rect) {
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width &&
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    },
    
    /**
     * 检查两个矩形是否相交
     */
    rectIntersect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * 计算矩形的并集
     */
    rectUnion(rect1, rect2) {
        const x = Math.min(rect1.x, rect2.x);
        const y = Math.min(rect1.y, rect2.y);
        const right = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
        const bottom = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);
        
        return {
            x,
            y,
            width: right - x,
            height: bottom - y
        };
    }
};

/**
 * 图像处理工具函数
 */
const ImageUtils = {
    /**
     * 创建图像的缩略图
     */
    createThumbnail(image, maxWidth = 100, maxHeight = 100) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
        
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        return canvas;
    },
    
    /**
     * 获取图像的主要颜色
     */
    getDominantColor(imageData, sampleSize = 10) {
        const data = imageData.data;
        const length = data.length;
        const colorMap = {};
        
        for (let i = 0; i < length; i += 4 * sampleSize) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a > 128) { // 只考虑不透明的像素
                const color = `${r},${g},${b}`;
                colorMap[color] = (colorMap[color] || 0) + 1;
            }
        }
        
        let maxCount = 0;
        let dominantColor = '0,0,0';
        
        for (const color in colorMap) {
            if (colorMap[color] > maxCount) {
                maxCount = colorMap[color];
                dominantColor = color;
            }
        }
        
        const [r, g, b] = dominantColor.split(',').map(Number);
        return { r, g, b };
    },
    
    /**
     * 检测图像边缘
     */
    detectEdges(imageData, threshold = 50) {
        const { data, width, height } = imageData;
        const edges = new Uint8ClampedArray(width * height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Sobel算子
                const gx = 
                    -data[((y-1) * width + (x-1)) * 4] + data[((y-1) * width + (x+1)) * 4] +
                    -2 * data[(y * width + (x-1)) * 4] + 2 * data[(y * width + (x+1)) * 4] +
                    -data[((y+1) * width + (x-1)) * 4] + data[((y+1) * width + (x+1)) * 4];
                
                const gy = 
                    -data[((y-1) * width + (x-1)) * 4] - 2 * data[((y-1) * width + x) * 4] - data[((y-1) * width + (x+1)) * 4] +
                    data[((y+1) * width + (x-1)) * 4] + 2 * data[((y+1) * width + x) * 4] + data[((y+1) * width + (x+1)) * 4];
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edges[y * width + x] = magnitude > threshold ? 255 : 0;
            }
        }
        
        return edges;
    },
    
    /**
     * 形态学操作 - 膨胀
     */
    dilate(binaryData, width, height, kernelSize = 3) {
        const result = new Uint8ClampedArray(width * height);
        const half = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let maxVal = 0;
                
                for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            maxVal = Math.max(maxVal, binaryData[ny * width + nx]);
                        }
                    }
                }
                
                result[y * width + x] = maxVal;
            }
        }
        
        return result;
    },
    
    /**
     * 形态学操作 - 腐蚀
     */
    erode(binaryData, width, height, kernelSize = 3) {
        const result = new Uint8ClampedArray(width * height);
        const half = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let minVal = 255;
                
                for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            minVal = Math.min(minVal, binaryData[ny * width + nx]);
                        }
                    }
                }
                
                result[y * width + x] = minVal;
            }
        }
        
        return result;
    }
};

/**
 * 文件处理工具函数
 */
const FileUtils = {
    /**
     * 检查文件类型
     */
    isImageFile(file) {
        return file.type.startsWith('image/');
    },
    
    /**
     * 获取文件扩展名
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },
    
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * 读取文件为DataURL
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * 下载文件
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * 创建ZIP文件
     */
    async createZip(files) {
        // 这里需要引入JSZip库
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip库未加载');
        }
        
        const zip = new JSZip();
        
        for (const file of files) {
            zip.file(file.name, file.blob);
        }
        
        return await zip.generateAsync({ type: 'blob' });
    }
};

/**
 * DOM工具函数
 */
const DOMUtils = {
    /**
     * 创建元素
     */
    createElement(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    /**
     * 添加事件监听器
     */
    addEventListeners(element, events) {
        for (const [event, handler] of Object.entries(events)) {
            element.addEventListener(event, handler);
        }
    },
    
    /**
     * 移除所有子元素
     */
    clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    
    /**
     * 获取元素的绝对位置
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    },
    
    /**
     * 检查元素是否在视口内
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }
};

/**
 * 动画工具函数
 */
const AnimationUtils = {
    /**
     * 缓动函数
     */
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },
    
    /**
     * 动画函数
     */
    animate(duration, callback, easing = 'easeOutQuad') {
        const start = performance.now();
        const easingFunc = this.easing[easing] || this.easing.linear;
        
        const frame = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunc(progress);
            
            callback(easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        };
        
        requestAnimationFrame(frame);
    },
    
    /**
     * 平滑滚动到元素
     */
    scrollToElement(element, duration = 500) {
        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        
        this.animate(duration, (progress) => {
            window.scrollTo(0, startPosition + distance * progress);
        });
    }
};

/**
 * 性能监控工具
 */
const PerformanceUtils = {
    /**
     * 测量函数执行时间
     */
    measureTime(func, label = 'Function') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        
        console.log(`${label} 执行时间: ${(end - start).toFixed(2)}ms`);
        return result;
    },
    
    /**
     * 防抖函数
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    /**
     * 节流函数
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },
    
    /**
     * 内存使用监控
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }
};

/**
 * 颜色工具函数
 */
const ColorUtils = {
    /**
     * RGB转HSL
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return [h * 360, s * 100, l * 100];
    },
    
    /**
     * HSL转RGB
     */
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    
    /**
     * 获取颜色的对比色
     */
    getContrastColor(r, g, b) {
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
};

// 导出所有工具函数
window.Utils = {
    Math: MathUtils,
    Image: ImageUtils,
    File: FileUtils,
    DOM: DOMUtils,
    Animation: AnimationUtils,
    Performance: PerformanceUtils,
    Color: ColorUtils
};