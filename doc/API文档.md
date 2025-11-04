# POSTMAN API 文档：便于登录测试

POST `localhost:8080/api/auth/register`

```JSON
{
    "username": "abc1231",
    "password": "123456",
    "email": "a@b1.com",
    "phone": "12345678901"
}
```

POST `localhost:8080/api/auth/login`
```JSON
{
"username": "alice3",
"password": "alice3",
"email": "alice3@b.com"
}
```

---

## 前端路由与后端 /api 接口说明

### 1. 前端路由
- 例如 `/login`、`/welcome`、`/free-mode/machine` 等，属于前端 Angular 的页面路由。
- 这些路由在 `src/main/angular/src/app/app.routes.ts` 文件中配置，决定了用户在浏览器输入这些路径时，前端显示哪个页面组件。
- 例如：
  - `/login` 显示登录/注册页面
  - `/welcome` 显示欢迎页
  - `/free-mode/machine` 显示图灵机操作页面

### 2. 后端 /api 接口
- `/api` 是后端接口的统一前缀，所有前后端数据交互的 HTTP 请求都以 `/api` 开头。
- 例如：
  - `/api/auth/login` 用户登录
  - `/api/mode/free` 获取自由模式信息
  - `/api/machine` 图灵机相关操作
- 这些接口在 Spring Boot 后端通过 `@RequestMapping("/api/xxx")` 进行统一管理。

### 3. 区别与联系
- **前端路由** 只负责页面跳转和显示，不直接与后端交互。
- **/api接口** 负责数据的获取、保存、业务处理，前端页面通过 HTTP 请求访问这些接口。
- 例如：用户访问 `/free-mode/machine` 页面时，前端会自动向 `/api/machine` 等接口请求数据。

### 4. 规范作用
- 统一用 `/api` 作为后端接口前缀，有助于前后端分离，结构清晰，便于维护和安全管理。

---

## 目前遇到的 HTTP 状态码及排查建议

| 状态码 | 含义             | 常见原因                                   | 排查与解决方法                         |
|--------|------------------|--------------------------------------------|----------------------------------------|
| 200    | OK               | 一切正常                                   | 无需处理                               |
| 400    | Bad Request      | 请求参数有误、缺失、格式不符               | 检查请求体、参数、JSON格式             |
| 401    | Unauthorized     | 未认证，Token缺失/过期/无效                | 检查Token是否传递、是否过期            |
| 403    | Forbidden        | 没有权限，Token错误/无权限                 | 检查Token、用户权限、后端拦截器         |
| 404    | Not Found        | 路径错误、API不存在、拼写错误               | 检查URL拼写、路由、后端接口是否存在     |
| 405    | Method Not Allowed | 请求方法不被允许（如用GET访问POST接口）   | 检查请求方式（GET/POST/PUT/DELETE）     |
| 500    | Internal Server Error | 服务器内部错误、数据库异常              | 查看后端日志、数据库连接、异常栈         |
| 502    | Bad Gateway      | 网关/代理错误，后端服务未启动/崩溃         | 检查后端服务是否正常                    |

---
