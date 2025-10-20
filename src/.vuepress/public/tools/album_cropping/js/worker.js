/**
 * 游戏图集裁剪工具 - Web Worker
 * 用于图像处理和区域检测的后台计算
 */

self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'detectRegions':
            const regions = detectRegions(data.imageData, data.threshold, data.minSize);
            self.postMessage({ type: 'regionsDetected', regions });
            break;
            
        case 'processImage':
            const processedData = processImage(data.imageData, data.options);
            self.postMessage({ type: 'imageProcessed', data: processedData });
            break;
            
        case 'optimizeRegions':
            const optimizedRegions = optimizeRegions(data.regions, data.options);
            self.postMessage({ type: 'regionsOptimized', regions: optimizedRegions });
            break;
    }
};

/**
 * 检测图像中的区域
 */
function detectRegions(imageData, threshold, minSize) {
    const { data, width, height } = imageData;
    const visited = new Array(width * height).fill(false);
    const regions = [];
    
    // 进度报告
    let processedPixels = 0;
    const totalPixels = width * height;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            processedPixels++;
            
            // 报告进度
            if (processedPixels % 10000 === 0) {
                self.postMessage({
                    type: 'progress',
                    progress: (processedPixels / totalPixels) * 100
                });
            }
            
            if (!visited[index] && isOpaque(data, index, threshold)) {
                const region = floodFill(data, width, height, x, y, visited, threshold);
                
                if (region.pixels.length >= minSize) {
                    const bounds = calculateBounds(region.pixels);
                    const optimizedBounds = optimizeBounds(bounds, data, width, height);
                    
                    regions.push({
                        id: Date.now() + Math.random(),
                        bounds: optimizedBounds,
                        pixels: region.pixels,
                        area: region.pixels.length,
                        type: 'auto'
                    });
                }
            }
        }
    }
    
    // 后处理：合并相邻区域
    const mergedRegions = mergeAdjacentRegions(regions);
    
    return mergedRegions;
}

/**
 * 检查像素是否不透明
 */
function isOpaque(data, index, threshold) {
    return data[index * 4 + 3] > threshold;
}

/**
 * 洪水填充算法
 */
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
        
        // 8方向连通
        stack.push(
            { x: x + 1, y },
            { x: x - 1, y },
            { x, y: y + 1 },
            { x, y: y - 1 },
            { x: x + 1, y: y + 1 },
            { x: x - 1, y: y - 1 },
            { x: x + 1, y: y - 1 },
            { x: x - 1, y: y + 1 }
        );
    }
    
    return { pixels };
}

/**
 * 计算边界框
 */
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

/**
 * 优化边界框
 */
function optimizeBounds(bounds, data, width, height) {
    // 紧缩边界以去除透明边缘
    let { x, y, width: w, height: h } = bounds;
    
    // 从左边紧缩
    let leftTrim = 0;
    for (let i = 0; i < w; i++) {
        let hasOpaque = false;
        for (let j = 0; j < h; j++) {
            const index = (y + j) * width + (x + i);
            if (isOpaque(data, index, 50)) {
                hasOpaque = true;
                break;
            }
        }
        if (hasOpaque) break;
        leftTrim++;
    }
    
    // 从右边紧缩
    let rightTrim = 0;
    for (let i = w - 1; i >= leftTrim; i--) {
        let hasOpaque = false;
        for (let j = 0; j < h; j++) {
            const index = (y + j) * width + (x + i);
            if (isOpaque(data, index, 50)) {
                hasOpaque = true;
                break;
            }
        }
        if (hasOpaque) break;
        rightTrim++;
    }
    
    // 从上边紧缩
    let topTrim = 0;
    for (let j = 0; j < h; j++) {
        let hasOpaque = false;
        for (let i = leftTrim; i < w - rightTrim; i++) {
            const index = (y + j) * width + (x + i);
            if (isOpaque(data, index, 50)) {
                hasOpaque = true;
                break;
            }
        }
        if (hasOpaque) break;
        topTrim++;
    }
    
    // 从下边紧缩
    let bottomTrim = 0;
    for (let j = h - 1; j >= topTrim; j--) {
        let hasOpaque = false;
        for (let i = leftTrim; i < w - rightTrim; i++) {
            const index = (y + j) * width + (x + i);
            if (isOpaque(data, index, 50)) {
                hasOpaque = true;
                break;
            }
        }
        if (hasOpaque) break;
        bottomTrim++;
    }
    
    return {
        x: x + leftTrim,
        y: y + topTrim,
        width: w - leftTrim - rightTrim,
        height: h - topTrim - bottomTrim
    };
}

/**
 * 合并相邻区域
 */
function mergeAdjacentRegions(regions) {
    const merged = [];
    const used = new Set();
    
    for (let i = 0; i < regions.length; i++) {
        if (used.has(i)) continue;
        
        const currentRegion = regions[i];
        const toMerge = [i];
        
        // 查找相邻区域
        for (let j = i + 1; j < regions.length; j++) {
            if (used.has(j)) continue;
            
            const otherRegion = regions[j];
            if (areAdjacent(currentRegion.bounds, otherRegion.bounds)) {
                toMerge.push(j);
            }
        }
        
        if (toMerge.length > 1) {
            // 合并区域
            const mergedRegion = mergeRegions(toMerge.map(idx => regions[idx]));
            merged.push(mergedRegion);
            toMerge.forEach(idx => used.add(idx));
        } else {
            merged.push(currentRegion);
            used.add(i);
        }
    }
    
    return merged;
}

/**
 * 检查两个区域是否相邻
 */
function areAdjacent(bounds1, bounds2) {
    const threshold = 5; // 相邻阈值
    
    // 检查水平相邻
    const horizontalAdjacent = 
        Math.abs(bounds1.x + bounds1.width - bounds2.x) <= threshold ||
        Math.abs(bounds2.x + bounds2.width - bounds1.x) <= threshold;
    
    // 检查垂直相邻
    const verticalAdjacent = 
        Math.abs(bounds1.y + bounds1.height - bounds2.y) <= threshold ||
        Math.abs(bounds2.y + bounds2.height - bounds1.y) <= threshold;
    
    // 检查重叠
    const horizontalOverlap = 
        bounds1.x < bounds2.x + bounds2.width && 
        bounds2.x < bounds1.x + bounds1.width;
    
    const verticalOverlap = 
        bounds1.y < bounds2.y + bounds2.height && 
        bounds2.y < bounds1.y + bounds1.height;
    
    return (horizontalAdjacent && verticalOverlap) || 
           (verticalAdjacent && horizontalOverlap);
}

/**
 * 合并多个区域
 */
function mergeRegions(regions) {
    const allPixels = [];
    regions.forEach(region => {
        allPixels.push(...region.pixels);
    });
    
    const bounds = calculateBounds(allPixels);
    
    return {
        id: Date.now() + Math.random(),
        bounds,
        pixels: allPixels,
        area: allPixels.length,
        type: 'merged'
    };
}

/**
 * 处理图像
 */
function processImage(imageData, options) {
    const { data, width, height } = imageData;
    const processedData = new Uint8ClampedArray(data);
    
    switch (options.type) {
        case 'contrast':
            adjustContrast(processedData, options.value);
            break;
        case 'brightness':
            adjustBrightness(processedData, options.value);
            break;
        case 'threshold':
            applyThreshold(processedData, options.value);
            break;
    }
    
    return new ImageData(processedData, width, height);
}

/**
 * 调整对比度
 */
function adjustContrast(data, contrast) {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
    }
}

/**
 * 调整亮度
 */
function adjustBrightness(data, brightness) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, data[i] + brightness));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
    }
}

/**
 * 应用阈值
 */
function applyThreshold(data, threshold) {
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const value = gray > threshold ? 255 : 0;
        
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
    }
}

/**
 * 优化区域
 */
function optimizeRegions(regions, options) {
    let optimized = [...regions];
    
    if (options.removeSmall) {
        optimized = optimized.filter(region => 
            region.bounds.width >= options.minWidth && 
            region.bounds.height >= options.minHeight
        );
    }
    
    if (options.mergeNear) {
        optimized = mergeNearbyRegions(optimized, options.mergeDistance);
    }
    
    if (options.sortBy) {
        optimized = sortRegions(optimized, options.sortBy);
    }
    
    return optimized;
}

/**
 * 合并附近的区域
 */
function mergeNearbyRegions(regions, distance) {
    const merged = [];
    const used = new Set();
    
    for (let i = 0; i < regions.length; i++) {
        if (used.has(i)) continue;
        
        const currentRegion = regions[i];
        const nearby = [i];
        
        for (let j = i + 1; j < regions.length; j++) {
            if (used.has(j)) continue;
            
            const otherRegion = regions[j];
            if (getDistance(currentRegion.bounds, otherRegion.bounds) <= distance) {
                nearby.push(j);
            }
        }
        
        if (nearby.length > 1) {
            const mergedRegion = mergeRegions(nearby.map(idx => regions[idx]));
            merged.push(mergedRegion);
            nearby.forEach(idx => used.add(idx));
        } else {
            merged.push(currentRegion);
            used.add(i);
        }
    }
    
    return merged;
}

/**
 * 计算两个区域的距离
 */
function getDistance(bounds1, bounds2) {
    const centerX1 = bounds1.x + bounds1.width / 2;
    const centerY1 = bounds1.y + bounds1.height / 2;
    const centerX2 = bounds2.x + bounds2.width / 2;
    const centerY2 = bounds2.y + bounds2.height / 2;
    
    return Math.sqrt(
        Math.pow(centerX2 - centerX1, 2) + 
        Math.pow(centerY2 - centerY1, 2)
    );
}

/**
 * 排序区域
 */
function sortRegions(regions, sortBy) {
    switch (sortBy) {
        case 'size':
            return regions.sort((a, b) => b.area - a.area);
        case 'position':
            return regions.sort((a, b) => {
                if (a.bounds.y !== b.bounds.y) {
                    return a.bounds.y - b.bounds.y;
                }
                return a.bounds.x - b.bounds.x;
            });
        case 'width':
            return regions.sort((a, b) => b.bounds.width - a.bounds.width);
        case 'height':
            return regions.sort((a, b) => b.bounds.height - a.bounds.height);
        default:
            return regions;
    }
}