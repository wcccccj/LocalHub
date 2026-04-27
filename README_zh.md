# LocalHub

[English](./README.md)

LocalHub 是一个使用 Electron、React 和 Tailwind CSS 构建的轻量级、跨平台的本地服务管理器和别名工具。它可以自动扫描本地监听的端口，允许您为每个服务分配自定义别名和备注，并提供通过浏览器快速访问的功能。

![LocalHub 应用截图](./image/screenshot.png)

## 功能特性

- **自动端口扫描：** 自动检测机器上监听的端口（HTTP、HTTPS、TCP、Proxy、DB 等）。
- **自定义别名和备注：** 为服务分配有意义的名称和描述（例如 `openclaw.search`、`frontend.dev`），告别记忆端口号的烦恼。
- **一键快速打开：** 一键点击即可在默认浏览器中直接打开 HTTP/HTTPS 服务。
- **自定义路径：** 支持在打开服务时附加自定义路径（例如 `/management.html`）。
- **置顶与拖拽排序：** 将最常用的服务置顶，并支持拖放排序。
- **进程过滤与搜索：** 可以轻松按别名、端口进行搜索，或按进程名称（例如 `node`、`postgres`）进行过滤。
- **手动添加：** 若自动扫描未能发现，也支持手动添加固定端口的服务。

## 技术栈

- **框架：** Electron + React (Vite)
- **样式：** Tailwind CSS + Lucide Icons
- **状态管理：** Zustand
- **拖拽排序：** @dnd-kit
- **持久化：** electron-store

## 开始使用

### 前置要求

- [Node.js](https://nodejs.org/) (v16 或更高版本)
- npm, yarn, 或 pnpm

### 安装与运行

1. 克隆仓库：
   ```bash
   git clone https://github.com/wcccccj/LocalHub.git
   cd LocalHub
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

### 生产环境构建

要将应用程序构建为独立的执行文件（例如 macOS 的 `.dmg`、Windows 的 `.exe`）：

```bash
npm run build
```

编译后的二进制文件将保存在 `dist`（或 `dist-app`） 文件夹中。

## 贡献指南

欢迎任何形式的贡献！请随时提交 Pull Request。

## 许可协议

本项目采用 MIT 许可证 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。
