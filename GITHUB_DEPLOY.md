# 不用PowerShell：GitHub → Cloudflare部署

## 第一步：解压文件

解压下载的ZIP。打开解压后的项目文件夹，应该直接看到：

```text
package.json
package-lock.json
wrangler.jsonc
src
worker
migrations
public
```

不要把ZIP文件本身上传，也不要多套一层目录。

## 第二步：上传GitHub

1. 在GitHub创建一个新仓库。
2. 进入仓库后选择 **Add file → Upload files**。
3. 将解压后文件夹里面的全部文件拖入页面。
4. 点击 **Commit changes**。

## 第三步：连接Cloudflare Workers

1. 进入Cloudflare控制台。
2. 打开 **Workers & Pages**。
3. 选择从GitHub导入或连接仓库。
4. 选择刚上传的仓库。
5. 构建命令：

```text
npm run build
```

6. 部署命令：

```text
npm run deploy
```

## 第四步：配置资源

项目需要以下绑定：

- D1：`DB`
- Queue：`CONTENT_QUEUE`
- Workers AI：`AI`
- Secret：`ADMIN_TOKEN`

第一次部署时，Cloudflare可能会提示创建或选择这些资源。`ADMIN_TOKEN`请设置为一段较长的随机密码。

## 部署后的产品页面

- 首页
- AI知识库
- 资讯日报
- 精品周报
- 资讯库
- AI问答
- 管理后台

## 自动更新机制

- 每6小时抓取一次资讯；
- 北京时间每天08:30自动生成资讯日报；
- 北京时间每周日09:00自动生成精品资讯周报；
- 三日简报不再生成。

部署成功后，打开Cloudflare提供的`workers.dev`地址即可使用。
