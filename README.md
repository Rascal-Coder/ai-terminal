# @rascaljs/ai-cli

一个结合ollama本地ai模型的前端开发工具。该工具集成了组件和 hooks 生成、提交信息自动化以及代码审查等功能，帮助开发者在保持高代码质量的同时，简化和加速开发流程。

## Usage

### install

```bash
pnpm i @rascaljs/ai-cli -g
ai init
ollama pull <model>
ai setModel -> Choose the model you need
```

### Use command

```bash
pnpm ai -h
```

## 命令介绍

| 命令                  | 作用                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| init                  | 初始化 AI cli                                                                                           |
| set <key> <value>     | 设置全局配置键和值。<br>参数：<br>  key: 配置键<br>  value: 要设置的值<br>示例：<br>  `ai set OLLAMA_MODEL llama2:latest` |
| hooks <name>          | 添加新的 Hooks。<br>参数：<br>  name: Hooks 的名称<br>示例：<br>  `ai hooks useCustomHook`               |
| get <key>             | 获取全局配置值。<br>参数：<br>  key: 要检索的配置键<br>示例：<br>  `ai get username`                     |
| component <name> [path] | 添加新组件。<br>参数：<br>  name: 组件名称<br>  path: （可选）添加组件的路径<br>示例：<br>  `ai component Button src/components` |
| commit                | 生成提交信息。AI 将自动为你生成提交信息。<br>示例：<br>  `ai commit`                                      |
| review [path]         | 生成代码审查信息。AI 将自动为你生成代码审查信息。（默认审查所有暂存文件）path: （可选）单一审查文件路径<br>示例：<br>  `ai review`                             |
| setHost               | 设置 Ollama 服务主机。<br>示例：<br>  `ai setHost`                                                       |
| setModel              | 设置 Ollama 服务模型。<br>示例：<br>  `ai setModel`                                                      |
| list [available]      | 显示 Ollama 模型列表。<br>参数：<br>  available: （可选）显示可用模型<br>示例：<br>  `ai list`           |

### list

list指令使用ollama list api获取本地模型。
list available 显示可用模型，通过axios请求https://ollama.com/library使用cherrio解析html获取模型列表数据。

### setHost
通过查询 ollama serve 的 PID拿到该 PID 对应的IP地址和端口设置到配置文件中。
