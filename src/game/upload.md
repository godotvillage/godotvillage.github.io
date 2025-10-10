---
title: 游戏上传页面
index: false
icon: laptop-code
sidebar: false
comment: false
lastUpdated: false
editLink: false
contributors: false
breadcrumb: true
category:
  - 游戏
author: false
pageInfo: false
toc: false
---
<style>
    /* body {
        font-family: Arial, sans-serif;
        margin: 50px auto;
        padding: 20px;
    } */
    .upload-area {
        border: 2px dashed #ccc;
        border-radius: 10px;
        padding: 40px;
        text-align: center;
        margin: 20px 0;
        cursor: pointer;
        transition: border-color 0.3s;
    }
    .upload-area:hover {
        border-color: #007bff;
    }
    .upload-area.dragover {
        border-color: #007bff;
        background-color: #f8f9fa;
    }
    .file-input {
        display: none;
    }
    .upload-btn {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }
    .upload-btn:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
    .result {
        margin-top: 20px;
        padding: 15px;
        border-radius: 5px;
        display: none;
    }
    .success {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    .error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    .progress {
        width: 100%;
        height: 20px;
        background-color: #f0f0f0;
        border-radius: 10px;
        margin: 10px 0;
        overflow: hidden;
        display: none;
    }
    .progress-bar {
        height: 100%;
        background-color: #007bff;
        width: 0%;
        transition: width 0.3s;
    }
    .cover-preview {
        max-width: 200px;
        max-height: 200px;
        margin-top: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        display: none;
    }
    .file-upload-section {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
    }
</style>
<h1>游戏ZIP文件上传</h1>
<p>
    请上传一个由 Godot 导出的 Web 版本 ZIP 包，文件内必须包含 <code>index.html</code>。<br>
    上传前请填写作者、游戏名、版本、封面等相关信息。仅支持 ZIP 格式，最大 200MB。
</p>


<!-- 游戏信息表单 -->
<form id="gameInfoForm">
<div style="margin-bottom: 15px;">
    <label for="author" style="display: block; margin-bottom: 5px; font-weight: bold;">作者 *</label>
    <input type="text" id="author" name="author" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
</div>

<div style="margin-bottom: 15px;">
    <label for="game_name" style="display: block; margin-bottom: 5px; font-weight: bold;">游戏名 *</label>
    <input type="text" id="game_name" name="game_name" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
</div>

<div style="margin-bottom: 15px;">
    <label for="description" style="display: block; margin-bottom: 5px; font-weight: bold;">游戏简介</label>
    <textarea id="description" name="description" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
</div>

<div style="margin-bottom: 15px;">
    <label for="version" style="display: block; margin-bottom: 5px; font-weight: bold;">版本 *</label>
    <input type="text" id="version" name="version" required placeholder="例: 1.0.0" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
</div>

<div style="margin-bottom: 15px;">
    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
        <input type="checkbox" id="is_online_playable" name="is_online_playable" value="true" checked disabled style="margin-right: 8px;">
        支持在线游玩
    </label>
</div>

<div style="margin-bottom: 15px;">
    <label for="coverImage" style="display: block; margin-bottom: 5px; font-weight: bold;">游戏封面</label>
    <input type="file" id="coverImage" name="coverImage" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <img id="coverPreview" class="cover-preview" alt="封面预览">
</div>
</form>

<div class="file-upload-section">
    <h3>游戏文件上传</h3>
    <div class="upload-area" id="uploadArea">
        <p>点击选择ZIP文件或拖拽文件到这里</p>
        <p><small>支持ZIP格式，最大200MB</small></p>
        <input type="file" id="fileInput" class="file-input" accept=".zip">
    </div>
</div>

<button id="uploadBtn" class="upload-btn" disabled>上传游戏</button>

<!-- 添加游戏列表按钮 -->
<button id="loadGamesBtn" class="upload-btn" style="margin-left: 10px; background-color: #28a745;">查看游戏列表</button>

<div class="progress" id="progressContainer">
    <div class="progress-bar" id="progressBar"></div>
</div>

<div class="result" id="result"></div>

<!-- 游戏列表显示区域 -->
<div id="gamesList" style="margin-top: 30px; display: none;">
    <h2>游戏列表</h2>
    <div id="gamesContainer"></div>
</div>

<script>
export default {
    mounted () {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const coverImageInput = document.getElementById('coverImage');
        const coverPreview = document.getElementById('coverPreview');
        const uploadBtn = document.getElementById('uploadBtn');
        const loadGamesBtn = document.getElementById('loadGamesBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const result = document.getElementById('result');
        const gamesList = document.getElementById('gamesList');
        const gamesContainer = document.getElementById('gamesContainer');

        let selectedFile = null;
        let selectedCoverImage = null;

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 拖拽功能
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });

        function handleFileSelection(file) {
            // 检查文件类型
            if (!file.name.toLowerCase().endsWith('.zip')) {
                showResult('请选择ZIP格式的文件', 'error');
                return;
            }

            // 检查文件大小 (200MB)
            if (file.size > 200 * 1024 * 1024) {
                showResult('文件大小超过200MB限制', 'error');
                return;
            }

            selectedFile = file;
            uploadBtn.disabled = false;
            uploadArea.innerHTML = `<p>已选择文件: ${file.name}</p><p><small>大小: ${(file.size / 1024 / 1024).toFixed(2)} MB</small></p>`;
        }
        
        // 封面图片选择处理
        coverImageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                
                // 检查文件类型
                if (!file.type.startsWith('image/')) {
                    showResult('请选择图片格式的文件', 'error');
                    e.target.value = '';
                    return;
                }
                
                // 检查文件大小 (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showResult('封面图片大小超过5MB限制', 'error');
                    e.target.value = '';
                    return;
                }
                
                selectedCoverImage = file;
                
                // 显示预览
                const reader = new FileReader();
                reader.onload = function(e) {
                    coverPreview.src = e.target.result;
                    coverPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                selectedCoverImage = null;
                coverPreview.style.display = 'none';
            }
        });

        // 验证表单
        function validateForm() {
            const author = document.getElementById('author').value.trim();
            const gameName = document.getElementById('game_name').value.trim();
            const version = document.getElementById('version').value.trim();
            
            return author && gameName && version;
        }

        // 上传文件
        uploadBtn.addEventListener('click', async () => {
            if (!selectedFile) return;
            
            // 验证表单
            if (!validateForm()) {
                showResult('❌ 请填写所有必填字段（作者、游戏名、版本）', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('zipfile', selectedFile);
            
            // 添加封面图片（如果有）
            if (selectedCoverImage) {
                formData.append('coverImage', selectedCoverImage);
            }
            
            // 添加游戏信息
            formData.append('author', document.getElementById('author').value.trim());
            formData.append('game_name', document.getElementById('game_name').value.trim());
            formData.append('description', document.getElementById('description').value.trim());
            formData.append('version', document.getElementById('version').value.trim());
            formData.append('is_online_playable', document.getElementById('is_online_playable').checked);

            // 显示进度条
            progressContainer.style.display = 'block';
            uploadBtn.disabled = true;

            try {
                const response = await fetch('http://117.72.182.158:31024/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    let message = `✅ ${data.message}<br>`;
                    message += `游戏ID: ${data.game_id}<br>`;
                    message += `文件夹: ${data.folderName}<br>`;
                    if (data.gameInfo) {
                        message += `作者: ${data.gameInfo.author}<br>`;
                        message += `游戏名: ${data.gameInfo.game_name}<br>`;
                        message += `版本: ${data.gameInfo.version}<br>`;
                        message += `在线游玩: ${data.gameInfo.is_online_playable ? '是' : '否'}`;
                    }
                    showResult(message, 'success');
                    
                    // 清空表单
                    document.getElementById('gameInfoForm').reset();
                    selectedFile = null;
                    selectedCoverImage = null;
                    coverPreview.style.display = 'none';
                    uploadArea.innerHTML = '<p>点击选择ZIP文件或拖拽文件到这里</p><p><small>支持ZIP格式，最大200MB</small></p>';
                    uploadBtn.disabled = true;
                } else {
                    showResult(`❌ ${data.error}`, 'error');
                }
            } catch (error) {
                showResult(`❌ 上传失败: ${error.message}`, 'error');
            } finally {
                // 隐藏进度条
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                uploadBtn.disabled = false;
            }
        });

        // 加载游戏列表
        loadGamesBtn.addEventListener('click', async () => {
            try {
                loadGamesBtn.disabled = true;
                loadGamesBtn.textContent = '加载中...';
                
                const response = await fetch('http://117.72.182.158:31024/games');
                const data = await response.json();
                
                if (data.success) {
                    displayGames(data.data);
                    gamesList.style.display = 'block';
                } else {
                    showResult(`❌ 获取游戏列表失败: ${data.error}`, 'error');
                }
            } catch (error) {
                showResult(`❌ 获取游戏列表失败: ${error.message}`, 'error');
            } finally {
                loadGamesBtn.disabled = false;
                loadGamesBtn.textContent = '查看游戏列表';
            }
        });

        // 显示游戏列表
        function displayGames(games) {
            if (games.length === 0) {
                gamesContainer.innerHTML = '<p>暂无游戏</p>';
                return;
            }

            let html = '';
            games.forEach(game => {
                const coverImageHtml = game.cover_image ? 
                    `<img src="http://117.72.182.158:31025/${game.cover_image}" alt="${game.game_name} 封面" style="max-width: 150px; max-height: 150px; margin-bottom: 10px; border-radius: 5px;">` : 
                    '<p style="color: #888; font-style: italic;">暂无封面</p>';
                    
                html += `
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #f9f9f9;">
                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <div style="flex-shrink: 0;">
                                ${coverImageHtml}
                            </div>
                            <div style="flex-grow: 1;">
                                <h3 style="margin: 0 0 10px 0; color: #333;">${game.game_name}</h3>
                                <p><strong>作者:</strong> ${game.author}</p>
                                <p><strong>版本:</strong> ${game.version}</p>
                                <p><strong>游戏ID:</strong> ${game.game_id}</p>
                                <p><strong>简介:</strong> ${game.description || '暂无简介'}</p>
                                <p><strong>在线游玩:</strong> ${game.is_online_playable ? '支持' : '不支持'}</p>
                                <p><strong>上传时间:</strong> ${new Date(game.upload_time).toLocaleString('zh-CN')}</p>
                                <p><strong>文件大小:</strong> ${(game.file_size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            gamesContainer.innerHTML = html;
        }

        function showResult(message, type) {
            result.innerHTML = message;
            result.className = `result ${type}`;
            result.style.display = 'block';
        }

        // 模拟进度条（实际应用中可以使用XMLHttpRequest的progress事件）
        function updateProgress(percent) {
            progressBar.style.width = percent + '%';
        }
    }
}
    
</script>