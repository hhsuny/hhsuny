# 🍅 番茄钟网站

一个简洁、好用的番茄钟，支持自定义时间，适合部署到 GitHub Pages。

## 文件结构

```
pomodoro-site/
├── index.html      # 主页面（计时器）
├── settings.html   # 设置页面
├── style.css       # 共享样式
├── app.js          # 计时器逻辑
└── settings.js     # 设置逻辑
```

## 功能

- ⏱ 三种模式：专注 / 短休息 / 长休息
- ⚙️ 自定义每种时长（分钟）
- 🔔 桌面通知 + 音效提示
- 🔄 可选自动开始下一阶段
- 📊 统计：完成番茄数、专注分钟、连续天数
- 📝 当前任务备注输入
- 🌙 自动适配深色模式

## 部署到 GitHub Pages（免费）

### 第一步：创建 GitHub 仓库

1. 登录 [github.com](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 仓库名填：`pomodoro`（或任意名称）
4. 选择 **Public**，点击 **Create repository**

### 第二步：上传文件

**方法 A — 网页直接上传（最简单）**

1. 进入你的新仓库页面
2. 点击 **uploading an existing file**
3. 把以下 5 个文件拖进去：
   - `index.html`
   - `settings.html`
   - `style.css`
   - `app.js`
   - `settings.js`
4. 点击 **Commit changes**

**方法 B — 使用 Git 命令行**

```bash
git init
git add .
git commit -m "初始化番茄钟"
git remote add origin https://github.com/你的用户名/pomodoro.git
git push -u origin main
```

### 第三步：开启 GitHub Pages

1. 进入仓库 → **Settings** → 左侧 **Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 **main**，目录选 **/ (root)**
4. 点击 **Save**

等待约 1 分钟后，你的网站就会在线：

```
https://你的用户名.github.io/pomodoro/
```

## 本地预览

直接用浏览器打开 `index.html` 即可（部分功能如通知需要 https 环境才能完整使用）。
