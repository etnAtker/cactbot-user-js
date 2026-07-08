# cactbot-user-js

自用 cactbot JS 触发器仓库。

本仓库使用 TypeScript 编写 cactbot 用户触发器，并通过 `cactbot` submodule 复用原项目源码类型，让 IDE 可以补全和跳转 `ZoneId`、`NetRegexes`、`Responses` 等对象。

编译产物为 cactbot 可直接加载的普通 JS 文件，输出到 `dist/raidboss/`。

## 开发

安装依赖：

```bash
npm install
```

复制模板：

```bash
cp src/templates/raidboss-trigger.ts src/raidboss/some-raid-content.ts
```

编写触发器后检查并编译：

```bash
npm run typecheck
npm run build
```

将 `dist/raidboss/` 下的 JS 文件复制到 cactbot 用户目录的 `raidboss/` 子目录中。
