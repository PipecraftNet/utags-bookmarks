# UTags 项目规则文档

## 技术架构规范

### 前端技术栈

| 技术         | 版本 | 用途                |
| ------------ | ---- | ------------------- |
| Svelte       | 5.x  | 核心框架(Runes语法) |
| TypeScript   | 4.9+ | 类型检查            |
| Tailwind CSS | 3.x  | UI样式系统          |
| Vite         | 4.x  | 构建工具            |
| Lucide       | 最新 | 图标系统            |
| Workbox      | 6.x  | PWA支持             |

### PWA实现规范

1. **核心要求**：

   - 必须提供完整的Web App Manifest
   - 必须注册Service Worker
   - 必须支持HTTPS协议
   - 必须实现离线缓存策略

2. **缓存策略**：
   - 静态资源：CacheFirst + 版本控制
   - API数据：NetworkFirst + 回退缓存
   - 用户生成内容：StaleWhileRevalidate

## 代码开发规范

### 通用规则

1. **命名约定**：

   - 组件：PascalCase
   - 变量/函数：camelCase
   - 常量：UPPER_SNAKE_CASE

2. **样式规范**：

   - 优先使用Tailwind类
   - 自定义CSS仅当Tailwind无法满足需求时使用
   - 暗黑模式样式需显式声明`dark:`前缀

3. **状态管理**：
   - 组件级状态：`$state`
   - 应用级状态：`$derived` + 自定义stores
   - URL持久化：筛选条件自动同步到URL hash

### 组件开发模板

```svelte
<script lang="ts">
  // Props类型声明
  interface Props {
    prop1: string
    prop2?: number
  }

  // 状态类型声明
  interface State {
    count: number
    double: number
  }

  // Props声明
  let { prop1, prop2 = 0 }: Props = $props()

  // 状态管理
  let count = $state<number>(0)
  $derived<number>((double = count * 2))
</script>

<!-- 模板 -->
<div class="container mx-auto p-4">
  <!-- 内容 -->
</div>

<style>
  /* 仅当Tailwind无法满足时才添加 */
  .custom-style {
    /* ... */
  }
</style>
```

## 项目结构规范

```
/src
│── /components         # 公共组件
│   ├── filters/        # 筛选相关组件
│   ├── ui/             # 基础UI组件
│   └── ...
│── /lib                # 工具库
│   ├── bookmarks.ts    # 书签操作
│   ├── filters.ts      # 筛选逻辑
│   └── ...
│── /stores             # 状态管理
│   ├── settings.js     # 用户设置
│   └── ...
└── /styles             # 全局样式
    ├── base.css        # 基础样式
    └── transitions.css # 动画样式
```

## 开发工作流

### 代码提交

- 遵循Conventional Commits规范
- 提交信息格式：
  ```
  <type>(<scope>): <subject>
  [optional body]
  [optional footer]
  ```
  有效类型：feat|fix|docs|style|refactor|test|chore

### 质量控制

- ESLint + Prettier代码检查
- 新功能需保持80%以上测试覆盖率
- 提交前执行`npm test`

## 文档维护

1. **更新时机**：

   - 技术栈升级时
   - 架构重大调整时
   - 新增核心功能时

2. **多语言维护**：
   - 保持中英文文档同步
   - 重大变更需同时更新两个版本
