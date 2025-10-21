/**
 * 游戏图集裁剪工具 - 导出模块
 * 处理区域导出和文件生成
 */

class ExportManager {
    constructor() {
        this.exportQueue = [];
        this.isExporting = false;
        this.exportProgress = 0;
        this.supportedFormats = ['png', 'jpg', 'webp', 'bmp'];
        this.compressionSettings = {
            png: { quality: 1.0 },
            jpg: { quality: 0.9 },
            webp: { quality: 0.8 },
            bmp: { quality: 1.0 }
        };
    }

    /**
     * 导出单个区域
     */
    async exportRegion(region, image, options = {}) {
        const {
            format = 'png',
            quality = this.compressionSettings[format]?.quality || 0.9,
            padding = 0,
            backgroundColor = 'transparent',
            scale = 1,
            filename = null
        } = options;

        try {
            // 创建临时画布
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 计算尺寸
            const width = Math.round((region.bounds.width + padding * 2) * scale);
            const height = Math.round((region.bounds.height + padding * 2) * scale);

            canvas.width = width;
            canvas.height = height;

            // 设置背景
            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }

            // 绘制区域
            ctx.imageSmoothingEnabled = scale !== 1;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(
                image,
                region.bounds.x, region.bounds.y,
                region.bounds.width, region.bounds.height,
                padding * scale, padding * scale,
                region.bounds.width * scale, region.bounds.height * scale
            );

            // 转换为Blob
            const blob = await this.canvasToBlob(canvas, format, quality);
            
            // 生成文件名
            const finalFilename = filename || this.generateFilename(region, format);

            return {
                blob,
                filename: finalFilename,
                region,
                size: blob.size,
                dimensions: { width, height }
            };

        } catch (error) {
            console.error('导出区域失败:', error);
            throw new Error(`导出区域失败: ${error.message}`);
        }
    }

    /**
     * 批量导出区域
     */
    async exportRegions(regions, image, options = {}) {
        const {
            format = 'png',
            quality = this.compressionSettings[format]?.quality || 0.9,
            padding = 0,
            backgroundColor = 'transparent',
            scale = 1,
            namingPattern = 'region_{index}',
            zipOutput = false,
            onProgress = null
        } = options;

        this.isExporting = true;
        this.exportProgress = 0;
        const results = [];

        try {
            for (let i = 0; i < regions.length; i++) {
                const region = regions[i];
                
                // 生成文件名
                const filename = this.applyNamingPattern(namingPattern, region, i);
                
                // 导出区域
                const result = await this.exportRegion(region, image, {
                    format,
                    quality,
                    padding,
                    backgroundColor,
                    scale,
                    filename
                });

                results.push(result);

                // 更新进度
                this.exportProgress = ((i + 1) / regions.length) * 100;
                if (onProgress) {
                    onProgress(this.exportProgress, i + 1, regions.length);
                }

                // 让出控制权，避免阻塞UI
                await this.delay(10);
            }

            // 如果需要打包成ZIP
            if (zipOutput) {
                const zipBlob = await this.createZip(results);
                return {
                    type: 'zip',
                    blob: zipBlob,
                    filename: `export_${Date.now()}.zip`,
                    count: results.length
                };
            }

            return {
                type: 'individual',
                results,
                count: results.length
            };

        } catch (error) {
            console.error('批量导出失败:', error);
            throw error;
        } finally {
            this.isExporting = false;
            this.exportProgress = 0;
        }
    }

    /**
     * 导出区域数据（JSON/XML/CSV）
     */
    exportRegionData(regions, format = 'json', options = {}) {
        const {
            includePixels = false,
            relativePaths = true,
            imageWidth = 1,
            imageHeight = 1
        } = options;

        const data = regions.map((region, index) => {
            const bounds = relativePaths ? {
                x: region.bounds.x / imageWidth,
                y: region.bounds.y / imageHeight,
                width: region.bounds.width / imageWidth,
                height: region.bounds.height / imageHeight
            } : region.bounds;

            const regionData = {
                id: region.id,
                index,
                name: region.name || `region_${index}`,
                bounds,
                area: region.area,
                type: region.type,
                created: region.created || Date.now()
            };

            if (includePixels && region.pixels) {
                regionData.pixels = region.pixels;
            }

            return regionData;
        });

        let content, mimeType, extension;

        switch (format.toLowerCase()) {
            case 'json':
                content = JSON.stringify({
                    metadata: {
                        version: '1.0',
                        created: new Date().toISOString(),
                        imageWidth,
                        imageHeight,
                        regionCount: regions.length
                    },
                    regions: data
                }, null, 2);
                mimeType = 'application/json';
                extension = 'json';
                break;

            case 'xml':
                content = this.generateXML(data, { imageWidth, imageHeight });
                mimeType = 'application/xml';
                extension = 'xml';
                break;

            case 'csv':
                content = this.generateCSV(data);
                mimeType = 'text/csv';
                extension = 'csv';
                break;

            default:
                throw new Error(`不支持的数据格式: ${format}`);
        }

        const blob = new Blob([content], { type: mimeType });
        
        return {
            blob,
            filename: `regions_${Date.now()}.${extension}`,
            format,
            count: regions.length
        };
    }

    /**
     * 生成XML格式数据
     */
    generateXML(data, metadata) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<atlas>\n';
        xml += `  <metadata>\n`;
        xml += `    <version>1.0</version>\n`;
        xml += `    <created>${new Date().toISOString()}</created>\n`;
        xml += `    <imageWidth>${metadata.imageWidth}</imageWidth>\n`;
        xml += `    <imageHeight>${metadata.imageHeight}</imageHeight>\n`;
        xml += `    <regionCount>${data.length}</regionCount>\n`;
        xml += `  </metadata>\n`;
        xml += '  <regions>\n';

        data.forEach(region => {
            xml += '    <region>\n';
            xml += `      <id>${region.id}</id>\n`;
            xml += `      <index>${region.index}</index>\n`;
            xml += `      <name>${this.escapeXML(region.name)}</name>\n`;
            xml += `      <bounds>\n`;
            xml += `        <x>${region.bounds.x}</x>\n`;
            xml += `        <y>${region.bounds.y}</y>\n`;
            xml += `        <width>${region.bounds.width}</width>\n`;
            xml += `        <height>${region.bounds.height}</height>\n`;
            xml += `      </bounds>\n`;
            xml += `      <area>${region.area}</area>\n`;
            xml += `      <type>${region.type}</type>\n`;
            xml += `      <created>${region.created}</created>\n`;
            xml += '    </region>\n';
        });

        xml += '  </regions>\n';
        xml += '</atlas>';

        return xml;
    }

    /**
     * 生成CSV格式数据
     */
    generateCSV(data) {
        const headers = ['id', 'index', 'name', 'x', 'y', 'width', 'height', 'area', 'type', 'created'];
        let csv = headers.join(',') + '\n';

        data.forEach(region => {
            const row = [
                region.id,
                region.index,
                `"${region.name}"`,
                region.bounds.x,
                region.bounds.y,
                region.bounds.width,
                region.bounds.height,
                region.area,
                region.type,
                region.created
            ];
            csv += row.join(',') + '\n';
        });

        return csv;
    }

    /**
     * 绘制区域标注
     */
    drawRegionAnnotations(ctx, regions, options) {
        const {
            showBounds,
            showLabels,
            boundColor,
            labelColor,
            labelBackground,
            fontSize,
            scale
        } = options;

        ctx.save();

        regions.forEach((region, index) => {
            const bounds = {
                x: region.bounds.x * scale,
                y: region.bounds.y * scale,
                width: region.bounds.width * scale,
                height: region.bounds.height * scale
            };

            // 绘制边界
            if (showBounds) {
                ctx.strokeStyle = boundColor;
                ctx.lineWidth = 2 * scale;
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }

            // 绘制标签
            if (showLabels) {
                const label = region.name || `${index + 1}`;
                ctx.font = `${fontSize}px Arial`;
                
                const textMetrics = ctx.measureText(label);
                const textWidth = textMetrics.width;
                const textHeight = fontSize;
                
                const labelX = bounds.x + 4 * scale;
                const labelY = bounds.y + 4 * scale;

                // 绘制标签背景
                ctx.fillStyle = labelBackground;
                ctx.fillRect(
                    labelX - 2 * scale,
                    labelY - textHeight,
                    textWidth + 4 * scale,
                    textHeight + 4 * scale
                );

                // 绘制标签文字
                ctx.fillStyle = labelColor;
                ctx.fillText(label, labelX, labelY);
            }
        });

        ctx.restore();
    }

    /**
     * 应用命名模式
     */
    applyNamingPattern(pattern, region, index) {
        return pattern
            .replace('{index}', String(index + 1).padStart(3, '0'))
            .replace('{id}', region.id)
            .replace('{x}', region.bounds.x)
            .replace('{y}', region.bounds.y)
            .replace('{width}', region.bounds.width)
            .replace('{height}', region.bounds.height)
            .replace('{area}', region.area)
            .replace('{type}', region.type)
            .replace('{timestamp}', Date.now());
    }

    /**
     * 生成文件名
     */
    generateFilename(region, format) {
        const timestamp = Date.now();
        const bounds = region.bounds;
        return `region_${bounds.x}_${bounds.y}_${bounds.width}x${bounds.height}_${timestamp}.${format}`;
    }

    /**
     * Canvas转Blob
     */
    canvasToBlob(canvas, format, quality) {
        return new Promise((resolve, reject) => {
            const mimeType = this.getMimeType(format);
            
            if (canvas.toBlob) {
                canvas.toBlob(resolve, mimeType, quality);
            } else {
                // 兼容性处理
                try {
                    const dataURL = canvas.toDataURL(mimeType, quality);
                    const blob = this.dataURLToBlob(dataURL);
                    resolve(blob);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    /**
     * 获取MIME类型
     */
    getMimeType(format) {
        const mimeTypes = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            webp: 'image/webp',
            bmp: 'image/bmp'
        };
        return mimeTypes[format.toLowerCase()] || 'image/png';
    }

    /**
     * DataURL转Blob
     */
    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    /**
     * 创建ZIP文件
     */
    async createZip(results) {
        // 这里需要引入JSZip库
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip库未加载，无法创建ZIP文件');
        }

        const zip = new JSZip();
        
        results.forEach(result => {
            zip.file(result.filename, result.blob);
        });

        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * 下载文件
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 批量下载文件
     */
    async downloadFiles(results) {
        for (const result of results) {
            this.downloadFile(result.blob, result.filename);
            // 添加延迟避免浏览器阻止多个下载
            await this.delay(100);
        }
    }

    /**
     * XML转义
     */
    escapeXML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取导出进度
     */
    getProgress() {
        return {
            isExporting: this.isExporting,
            progress: this.exportProgress
        };
    }

    /**
     * 取消导出
     */
    cancelExport() {
        this.isExporting = false;
        this.exportProgress = 0;
        this.exportQueue = [];
    }
}

// 导出管理器实例
window.exportManager = new ExportManager();