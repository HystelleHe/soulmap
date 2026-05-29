#!/usr/bin/env bash
# 心屿 SoulMap —— 一键部署到 GitHub Pages
# 用法：在项目根目录执行  ./deploy.sh
# 原理：本地构建出 dist/，把它作为 gh-pages 分支的根目录强制推送到 GitHub，
#       GitHub Pages 已配置为从 gh-pages 分支根目录发布站点。
# 线上地址：https://hystellehe.github.io/soulmap/
set -e

REPO_URL="https://github.com/HystelleHe/soulmap.git"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> 1/3 构建生产产物"
cd "$ROOT"
npm run build

echo "==> 2/3 打包 dist 到临时目录并初始化 gh-pages 分支"
TMP="$(mktemp -d)"
cp -r "$ROOT/dist/." "$TMP/"
touch "$TMP/.nojekyll"          # 关闭 Jekyll，保留下划线/特殊文件名
cd "$TMP"
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "deploy soulmap $(date +%Y-%m-%d_%H:%M)"
git remote add origin "$REPO_URL"

echo "==> 3/3 推送（强制覆盖 gh-pages）"
git push -f origin gh-pages

cd "$ROOT"
rm -rf "$TMP"
echo "==> 完成。约 1 分钟后访问 https://hystellehe.github.io/soulmap/"
