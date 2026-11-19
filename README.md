# Zhongxin & Yian wedding site

## 线上网址

| 用途 | 网址 |
| --- | --- |
| 婚礼网站（公开） | https://yyianyu.github.io/wedding/ |
| 留言审核页（私密） | https://yyianyu.github.io/wedding/review |
| GitHub 仓库 | https://github.com/YYianYU/wedding |

审核密钥保存在 Apps Script 的 **Script properties**（属性名 `REVIEW_KEY`），**不要写进 README / GitHub，也不要发到公开地方**。

设置方法：Apps Script → 齿轮 Project Settings → Script properties → 添加 `REVIEW_KEY`。  
打开 https://yyianyu.github.io/wedding/review 后输入该密钥即可审核。

## Google Drive / Apps Script

| 用途 | 链接 |
| --- | --- |
| 留言文件夹 | https://drive.google.com/drive/folders/1Lpv9Yhi3nHY5k8YoH9HBSD3X_5SBoQkH |
| 相册文件夹 | https://drive.google.com/drive/folders/1TPN_bs-xBF_9WHZAvMslbYOh4XwdlKyJ |
| 留言 Apps Script | https://script.google.com/home/projects/1A7ywKiT914YCB2_IoT9XKte1yRv7fMlln0RWZT2uaXujvdXG4W-n-8lD/edit |

留言接口（网站已配置，一般不用改）：

```text
https://script.google.com/macros/s/AKfycbzsM0RJ1QrOrwQW045n1pCvfo6YFwzHEwpGtdlASmTc2cyWWVy-Mg_zaZe7jFqvgk0t1Q/exec
```

更新留言脚本后：在 Apps Script 里 **Deploy → Manage deployments → Edit → New version → Deploy**。

## 本地预览

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

GitHub Pages 会在推送到 `main` 后自动部署。
