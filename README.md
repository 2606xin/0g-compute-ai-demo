# 0g-compute-ai-demo

这是一个使用 0G Serving Broker 的简单示例项目，专为初学者设计，展示如何构建去中心化 AI 应用。

> **新增功能**: 本项目在基础 0G Broker Starter Kit 之上新增了多项功能特性，包括币安期货 API 集成、Markdown 渲染、Provider 余额管理等。详细功能说明请查看 [FEATURES.md](./FEATURES.md)。

## 功能概览

本项目实现了 0G Serving Broker 的核心功能：

1. **Broker 实例构建** - 创建和初始化 broker 连接
2. **账户充值** - 管理账本和充值 A0GI 代币
3. **服务验证** - 验证 AI 服务提供者
4. **Chat 对话** - 与 AI 模型进行交互
5. **内容验证** - 验证 AI 回复的真实性

## 核心概念

### 1. Broker 实例
```typescript
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

// 使用钱包签名者创建 broker
const broker = await createZGComputeNetworkBroker(signer);
```

### 2. 账本管理
```typescript
// 创建账本并充值
await broker.ledger.addLedger(amount);

// 为已有账本充值
await broker.ledger.depositFund(amount);

// 查询账本信息
const { ledgerInfo } = await broker.ledger.ledger.getLedgerWithDetail();
```

### 3. 服务验证
```typescript
// 获取服务元数据
const metadata = await broker.inference.getServiceMetadata(providerAddress);

// 验证服务（acknowledge）
await broker.inference.acknowledge(providerAddress);

// 检查是否已验证
const isAcknowledged = await broker.inference.userAcknowledged(providerAddress);
```

### 4. Chat 对话
```typescript
// 获取请求头（包含认证信息）
const headers = await broker.inference.getRequestHeaders(
  providerAddress,
  JSON.stringify(messages)
);

// 发送请求到 AI 服务
const response = await fetch(`${endpoint}/chat/completions`, {
  method: 'POST',
  headers: { ...headers },
  body: JSON.stringify({ messages, model, stream: true })
});
```

### 5. 内容验证
```typescript
// 处理响应并验证内容
const isValid = await broker.inference.processResponse(
  providerAddress,
  responseContent,
  chatId
);
```

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 配置项目

1. 在 `pages/_app.tsx` 中设置 WalletConnect Project ID：
```typescript
const config = getDefaultConfig({
  appName: '0G Broker Starter Kit',
  projectId: 'YOUR_PROJECT_ID', // 从 https://cloud.walletconnect.com 获取
  chains: [zgTestnet], // 0G 测试网
  ssr: true,
});
```

### 运行项目
```bash
pnpm run dev
```

访问 http://localhost:3000

## 使用流程

1. **连接钱包** - 使用 MetaMask 或其他钱包连接到 0G 测试网
2. **创建账本** - 在"账户管理"标签页创建账本并充值 A0GI
3. **验证服务** - 在"服务验证"标签页选择并验证 AI 服务提供者
4. **开始对话** - 在"Chat 对话"标签页与 AI 进行交互
5. **验证内容** - 点击"验证内容"按钮验证 AI 回复的真实性

## 项目结构

```
0g-web-startkit/
├── components/           # React 组件
│   ├── LedgerManager.tsx    # 账户管理组件
│   ├── ServiceVerifier.tsx  # 服务验证组件
│   └── ChatInterface.tsx    # Chat 对话组件
├── hooks/               # 自定义 React Hooks
│   └── use0GBroker.ts       # Broker 管理 Hook
├── pages/               # Next.js 页面
│   ├── _app.tsx            # 应用配置
│   └── index.tsx           # 主页
└── styles/              # 样式文件
    └── globals.css         # 全局样式
```

## 相关资源

- [0G Labs 文档](https://docs.0g.ai)
- [0G Serving Broker NPM](https://www.npmjs.com/package/@0glabs/0g-serving-broker)
- [WalletConnect](https://cloud.walletconnect.com)

## 新增功能

本项目在基础功能之上新增了以下特性：

- **币安期货 API 集成** - AI 聊天功能现已集成币安期货 API，可以实时获取加密货币价格数据，并基于这些数据提供交易建议
- **Markdown 消息渲染** - AI 回复支持完整的 Markdown 格式渲染，包括表格、代码块、列表等
- **Provider 余额管理** - 支持查询各个 Provider 的推理子账户余额，并支持从主账本充值到 Provider
- **优化的用户界面** - 更大的对话窗口和更好的视觉体验

详细功能说明和使用方法请查看 [FEATURES.md](./FEATURES.md)。
