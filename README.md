# ai-more
基于硅基流动平台制作的多ai回复
可一键部署在vercel，增加 环境变量SILICONFLOW_API_KEY 为你硅基流动的api
默认模型为免费模型，效果一般，可替换（仅支持文本类型）
效果如图
<img width="2512" height="1881" alt="image" src="https://github.com/user-attachments/assets/e1c2edfb-736b-471f-ae31-6f8d2b6cca4d" />

# 如何添加新的 AI 模型

本文档说明如何在应用中添加新的 AI 模型。

## 步骤 1: 在后端添加模型配置

编辑 `app/api/chat/route.ts` 文件，在 `models` 对象中添加新模型：

```typescript
const models = {
  deepseek: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  qwen: 'Qwen/Qwen2.5-7B-Instruct',
  glm: 'THUDM/glm-4-9b-chat',
  hunyuan: 'tencent/Hunyuan-Large',
  internlm: 'internlm/internlm2_5-7b-chat',
  // 添加新模型（例如添加 KIMI 模型）
  KIMI: 'Pro/moonshotai/Kimi-K2.5',  // 新增这一行
};
```

**注意**: 模型名称必须是硅基流动平台支持的完整模型标识符。

## 步骤 2: 在前端添加模型显示

编辑 `app/page.tsx` 文件，在 `responses` 状态数组中添加新模型：

```typescript
const [responses, setResponses] = useState<ModelResponse[]>([
  { name: 'deepseek', displayName: 'DeepSeek R1', content: '', loading: false, error: null, icon: '🔷' },
  { name: 'qwen', displayName: 'Qwen 2.5', content: '', loading: false, error: null, icon: '🟦' },
  { name: 'glm', displayName: 'GLM-4', content: '', loading: false, error: null, icon: '🟪' },
  { name: 'hunyuan', displayName: 'Hunyuan', content: '', loading: false, error: null, icon: '🔵' },
  { name: 'internlm', displayName: 'InternLM 2.5', content: '', loading: false, error: null, icon: '🟩' },
  // 添加新模型
  { name: 'KIMI', displayName: 'kimi 2.5', content: '', loading: false, error: null, icon: '🟨' },
]);
```

### 字段说明：

- `name`: 模型的唯一标识符，必须与 `route.ts` 中的 key 一致
- `displayName`: 在界面上显示的友好名称
- `content`: 模型回复内容（初始为空字符串）
- `loading`: 加载状态（初始为 false）
- `error`: 错误信息（初始为 null）
- `icon`: 用于显示的图标（可以使用任何 emoji）


## 查找可用模型

访问硅基流动文档查看所有可用模型：
https://docs.siliconflow.cn/quickstart/models

## 常见模型示例

【免费大语言模型列表】
Qwen/Qwen2-7B-Instruct (32K)
Qwen/Qwen1.5-7B-Chat (32K)
THUDM/glm-4-9b-chat (32K)
internlm/internlm2_5-7b-chat (32K)
mistralai/Mistral-7B-Instruct-v0.2 (32K)
【国内领先模型】
Qwen/Qwen2-72B-Instruct (32K)
Qwen/Qwen2-57B-A14B-Instruct (32K)
Qwen/Qwen2-7B-Instruct (32K, 免费)
Qwen/Qwen1.5-110B-Chat (32K)
Qwen/Qwen1.5-32B-Chat (32K)
Qwen/Qwen1.5-14B-Chat (32K)
Qwen/Qwen1.5-7B-Chat (32K, 免费)
THUDM/glm-4-9b-chat (32K, 免费)
deepseek-ai/DeepSeek-Coder-V2-Instruct (32K)
deepseek-ai/DeepSeek-V2-Chat (32K)
deepseek-ai/deepseek-llm-67b-chat (32K)
internlm/internlm2_5-7b-chat (32K, 免费)


## 注意事项

1. 确保 `name` 字段在后端和前端保持一致
2. 选择合适的 emoji 图标来区分不同模型
3. 使用清晰的 `displayName` 让用户易于识别
4. 测试新添加的模型是否能正常返回结果
5. 响应式布局会自动适配新增的模型卡片

