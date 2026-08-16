# Adsterra 广告 Key 构建时注入 — 设计文档

- **日期**: 2026-08-16
- **状态**: 已确认（用户选定：构建时注入方案，全部 6 广告位）
- **对应 SOP**: 建站 SOP 第 6 步（接广告）

## 背景：模板缺口

AnvilWiki 模板的广告链路有一处断点：

- 4 个广告组件（StickyBanner / SidebarAd / InContentAd / AdBanner）读取 `PUBLIC_AD_*` 环境变量，**key 为空 = 不渲染** → 这半边是通的。
- 但广告实际内容是 `public/ads/*.html`（Adsterra 脚本，内含 `YOUR_AD_KEY` 占位符 ×2 处），Astro **不处理 `public/` 目录** → 环境变量永远进不了这些静态文件。
- 结果：只配环境变量时，iframe 会加载到含占位符的 HTML → 广告空白、展示量不计。

`docs/ads.md:60` 承认构建时注入"进阶…未实现"。本设计补上这一环。

## 方案（已选定：构建时注入）

```
Adsterra 后台（拿 key，手动）
  → wrangler.toml [vars]（本仓库 env 唯一事实来源，dashboard 被忽略）
  → Cloudflare Pages 构建环境（process.env）
  → astro build（组件按同一变量门控渲染 iframe —— 既有机制，不改）
  → postbuild: 注入脚本替换 dist/ads/*.html 的 YOUR_AD_KEY
  → pagefind → 部署
```

## 改动清单

| 文件 | 动作 | 说明 |
|---|---|---|
| `scripts/inject-ad-keys.ts` | 新增 | 注入脚本（见下） |
| `package.json` | 修改 | `postbuild`: `tsx scripts/inject-ad-keys.ts && pagefind --site dist` |
| `wrangler.toml` | 修改 | `[vars]` 增加 6 个 `PUBLIC_AD_* = ""` 空占位（留空 = 无广告，填 key 即上线） |
| `.env.example` | 修改 | 删除 `PUBLIC_AD_NATIVE_BANNER`（无组件消费，上游文档噪音） |
| 广告组件 ×4、`public/ads/*.html` ×6 | **不动** | iframe 隔离设计保持原样（ads.md 明令禁止改动） |

## 注入脚本设计

- 映射表（6 组）：`PUBLIC_AD_MOBILE_320X50 → banner-320x50.html`、`PUBLIC_AD_SIDEBAR_160X300 → sidebar-160x300.html`、`PUBLIC_AD_SIDEBAR_160X600 → sidebar-160x600.html`、`PUBLIC_AD_BANNER_728X90 → banner-728x90.html`、`PUBLIC_AD_BANNER_300X250 → banner-300x250.html`、`PUBLIC_AD_BANNER_468X60 → banner-468x60.html`
- 纯函数 `injectKey(html, key)`：key 为空原样返回；否则替换**所有** `YOUR_AD_KEY` 出现处（`atOptions.key` + `invoke.js` URL）。用 `split/join` 纯字符串替换，无正则，key 含特殊字符安全。
- `main()`：`try { process.loadEnvFile() } catch {}` 兜底本地 `.env`（Node 22 原生；CI/Pages 环境变量优先级更高，不冲突）；遍历 `dist/ads/`，逐位注入并打日志。
- 直接执行守卫：`pathToFileURL(realpathSync(process.argv[1])) === import.meta.url`（Windows 安全）。

## 错误处理

| 情形 | 行为 |
|---|---|
| key 为空 | 文件原样保留，日志 `skipped`（组件本来就不渲染该位） |
| 全部 key 为空 | 构建照常成功（延续模板"零配置可部署"哲学） |
| 映射文件缺失 | `console.warn`，不中断构建 |
| `dist/ads/` 有无映射 HTML | `console.warn`（防未来加位漏同步脚本的漂移守卫） |

## 测试（vitest）

1. `injectKey` 替换两处占位符（atOptions + invoke.js URL）
2. key 为空 → 原样返回
3. **映射完整性守卫**：`public/ads/` 每个 html 文件在映射表中有且仅有一条对应项（代替共享模块，用测试锁住 DRY 漂移风险）

## 用户手动步骤（代码完成后执行）

1. Adsterra → Add Website `sephiria.cfd`，分类 Games（审核 1-3 分钟）
2. Ad Units 创建 6 个 Banner 单元：320×50 / 160×300 / 160×600 / 728×90 / 300×250 / 468×60，复制各自 key
3. key 填入 `wrangler.toml` → commit + push → Pages 自动重建
4. 按 `docs/ads.md` 自检清单验证（移动+桌面、无弹窗、后台 impression 上涨）
5. 可选：收款（OKX + USDT-TRC20）

## 不做（YAGNI）

Native Banner（模板无组件）· Popunder / Social Bar / Smartlink（SOP 明确不挂）· Google AdSense（另行排队）· 收款自动化

## 风险

`wrangler.toml [vars]` 构建时可用性：已被线上站点 `SITE_URL` 同机制验证，无需额外处理。若填 key 后广告仍不出现，按 `docs/deployment.md:75` 的诊断方法（build 日志打印 `PUBLIC_*` 变量）排查。
