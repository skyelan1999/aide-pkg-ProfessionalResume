# 验证记录 · 0.1.0

所有测试仅使用虚构数据。实现及安装包验证通过，发布状态以 GitHub Release 和市场目录为准。

- `npm test`：**14/14 PASS**。加密文件往返、非导出密钥、随机 IV、错误密码、密文/头部篡改、未知版本/KDF拒绝、1200份简历、资料选择与联系方式排除、证据/来源约束、快照与历史、工作区隔离、任务回填/不可覆盖/过期/删除、独立入口安装校验。
- `npm run build`：自包含工作台约73 KB；`node --check` 检查入口、业务、加密、导出和界面脚本通过。
- `npm run package`：白名单 ZIP，无运行时 npm 依赖；不包含个人 `.pr`、临时任务、测试输出、`node_modules` 或 Git 历史。SHA256见发行包的 `SHA256SUMS`。
- **真实 Aide 安装与工具通道 PASS**：独立 Docker，Aide v0.1.18.0 RC3，镜像 `aide:source-0653b625c3392f1386bd`；ZIP实际安装201，三个工具可调用。当前 Aide 主程序源码和用户生产实例没有修改。
- **真实 Chrome 功能验收 PASS**：工作台创建/解锁虚构资料库、编辑个人资料、选择已核实履历、确认分享、建立任务；通过宿主真实执行器 get/validate/complete 回填确定性虚构结果，工作台取回并归档。任务没有包含测试邮箱。
- **版本与导出 PASS**：正文修改后切换页面仍保留，历史保留上一版，复制简历及新建空白简历，共3份；投递记录1条。Word/Markdown/HTML/`.pr` 由宿主真实保存按钮交给浏览器下载。`.pr` 在 Node 中解密读回核对数量与历史。
- **关联文件保存 PASS**：从宿主 `.pr` 文件预览打开、解锁、修改库名称、暂存加密字节、用户点击“保存到原文件”，收到 `document.saved`；再读磁盘文件并解密确认名称已更新。
- **浏览器拒绝路径 PASS**：错误密码拒绝，正确密码仍能解锁内存草稿。明暗主题、1440×1000桌面、390×844窄屏实际操作并截图检查，窄屏无页面横向溢出。未发现主要控件遮挡或文字重叠；长编辑器和报告按页面滚动。
- **WebKit 27.2 PASS**：同一实际 Aide 文件桥读取并解密 `.pr`、显示已保存简历，通过宿主保存按钮下载 Word。Chrome和WebKit下载的DOCX均通过ZIP完整性及全部XML解析。WebKit引擎验收不等同于系统Safari应用的全流程验收。

可复现浏览器命令（仅用于独立测试主机，将替换测试主机的同名插件）：

```sh
AIDE_TEST_URL=https://127.0.0.1:8098 \
AIDE_TEST_DATA=/absolute/path/to/isolated/data \
AIDE_TEST_WORKSPACE=/absolute/path/to/isolated/workspace \
AIDE_EVIDENCE_DIR=/absolute/path/to/evidence \
node test/browser-host.cjs
```

本地原始结果和截图在被 Git 忽略的 `.test-output/final/`；经筛选的纯虚构界面截图在 `docs/screenshots/`。公开包与测试使用同一产品代码。发布时可通过对应Git提交复核源文件与自包含工作台。

未验证边界：真实付费模型写作质量、真实企业调查准确性、系统Safari全流程、用户生产资料、原生Windows、15分钟空闲自动锁定的真实计时、完整Word/LibreOffice跨版本排版矩阵、实际招聘投递。Word仅验证浏览器下载与ZIP/XML结构；打印版HTML可供系统浏览器另存PDF，本版不内置PDF生成器。确定性测试结果不冒充真实模型或企业尽调。

市场发布已完成：用户明确授权本次管理员合并后，PR #36 合并为 `f4d540f8b07409f6ed6b409655af284c02331bb9`；[Pages部署](https://github.com/skyelan1999/aide-pkg-shop/actions/runs/43040977240)成功。线上目录版本0.1.0 / distribution=public，`.pr`路由存在。2026-11-11T14:42:53Z读取公开安装包44,663 bytes，SHA-256与已测试Release一致；真实Chrome市场搜索、详情和下载按钮报告校验通过，下载文件摘要再次一致。[官方市场](https://skyelan1999.github.io/aide-pkg-shop/)
