# sweetOranges.github.io

# 基于git的私人笔记本

### 通过git open api 将私人git仓库化身为私人笔记本

### 步骤
1. 生成access_token 设置到 localstorage 中的 github-token

```
localStorage.setItem('github-token', 'xxxxxxxxxxxxxxxxxxxx')

```

2. 打开https://sweetOranges.github.io?repo=${仓库}&user=${用户名}