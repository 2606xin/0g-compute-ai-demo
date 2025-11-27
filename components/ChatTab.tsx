import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatTabProps {
  broker: any;
  selectedProvider: any;
  message: string;
  setMessage: (message: string) => void;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
  verified?: boolean;
  verifyError?: boolean;
}

export default function ChatTab({
  broker,
  selectedProvider,
  message,
  setMessage,
}: ChatTabProps) {
  const [messages, setMessages] =
    typeof useState === "function" && useState !== null
      ? useState<Message[]>([])
      : [[], () => {}];
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingMessageId, setVerifyingMessageId] = useState<string | null>(
    null
  );
  // 价格信息确认相关状态
  const [pendingMessage, setPendingMessage] = useState<string>("");
  const [detectedPairs, setDetectedPairs] = useState<string[]>([]);
  const [priceData, setPriceData] = useState<Record<string, string>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string>("");

  // 重置消息历史
  useEffect(() => {
    if (selectedProvider) {
      setMessages([]);
    }
  }, [selectedProvider]);

  // Markdown 消息内容组件
  const MessageContent = ({
    content,
    role,
  }: {
    content: string;
    role: string;
  }) => {
    if (role === "assistant") {
      return (
        <div
          style={{
            marginTop: "8px",
            padding: "16px",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 表格样式
              table: ({ children }) => (
                <div style={{ overflowX: "auto", margin: "12px 0" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #dee2e6",
                      fontSize: "14px",
                    }}
                  >
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead style={{ background: "#e9ecef" }}>{children}</thead>
              ),
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children, ...props }: any) => {
                // 添加斑马纹效果（需要从父组件获取索引，这里简化处理）
                return (
                  <tr
                    style={{
                      borderBottom: "1px solid #dee2e6",
                    }}
                    {...props}
                  >
                    {children}
                  </tr>
                );
              },
              th: ({ children }) => (
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    border: "1px solid #dee2e6",
                    fontWeight: "bold",
                    background: "#e9ecef",
                  }}
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #dee2e6",
                    lineHeight: "1.5",
                  }}
                >
                  {children}
                </td>
              ),
              // 代码块样式
              code: ({ className, children, ...props }: any) => {
                const isInline = !className;
                return isInline ? (
                  <code
                    style={{
                      background: "#f1f3f5",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "0.9em",
                      fontFamily: "monospace",
                      color: "#e83e8c",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    style={{
                      display: "block",
                      background: "#282c34",
                      color: "#abb2bf",
                      padding: "12px",
                      borderRadius: "4px",
                      overflowX: "auto",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      margin: "12px 0",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // 引用块样式
              blockquote: ({ children }) => (
                <blockquote
                  style={{
                    borderLeft: "4px solid #007bff",
                    paddingLeft: "16px",
                    margin: "12px 0",
                    color: "#6c757d",
                    fontStyle: "italic",
                    background: "#f8f9fa",
                    padding: "12px 16px",
                    borderRadius: "4px",
                  }}
                >
                  {children}
                </blockquote>
              ),
              // 标题样式
              h1: ({ children }) => (
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "16px 0 8px 0",
                  }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "14px 0 8px 0",
                  }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    margin: "12px 0 6px 0",
                  }}
                >
                  {children}
                </h3>
              ),
              // 列表样式
              ul: ({ children }) => (
                <ul style={{ margin: "8px 0", paddingLeft: "24px" }}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: "8px 0", paddingLeft: "24px" }}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li style={{ margin: "4px 0", lineHeight: "1.6" }}>
                  {children}
                </li>
              ),
              // 段落样式
              p: ({ children }) => (
                <p style={{ margin: "8px 0", lineHeight: "1.6" }}>{children}</p>
              ),
              // 分隔线
              hr: () => (
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #dee2e6",
                    margin: "16px 0",
                  }}
                />
              ),
              // 强调文本
              strong: ({ children }) => (
                <strong style={{ fontWeight: "bold", color: "#212529" }}>
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em style={{ fontStyle: "italic" }}>{children}</em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    } else {
      // 用户消息保持简单文本显示
      return <span>{content}</span>;
    }
  };

  // 从用户消息中提取交易对
  const extractTradingPairs = (text: string): string[] => {
    console.log("extractTradingPairs 输入文本:", text);
    const pairs: string[] = [];

    // 常见币种名称映射（小写 -> 标准交易对）
    const coinMappings: Record<string, string> = {
      // 主流币种
      btc: "BTCUSDT",
      bitcoin: "BTCUSDT",
      eth: "ETHUSDT",
      ethereum: "ETHUSDT",
      bnb: "BNBUSDT",
      binance: "BNBUSDT",
      sol: "SOLUSDT",
      solana: "SOLUSDT",
      ada: "ADAUSDT",
      cardano: "ADAUSDT",
      doge: "DOGEUSDT",
      dogecoin: "DOGEUSDT",
      xrp: "XRPUSDT",
      ripple: "XRPUSDT",
      dot: "DOTUSDT",
      polkadot: "DOTUSDT",
      matic: "MATICUSDT",
      polygon: "MATICUSDT",
      avax: "AVAXUSDT",
      avalanche: "AVAXUSDT",
      link: "LINKUSDT",
      chainlink: "LINKUSDT",
      uni: "UNIUSDT",
      uniswap: "UNIUSDT",
      ltc: "LTCUSDT",
      litecoin: "LTCUSDT",
      atom: "ATOMUSDT",
      cosmos: "ATOMUSDT",
      // 0G 相关
      "0g": "0GUSDT",
      zg: "0GUSDT",
      "0glabs": "0GUSDT",
    };

    // 匹配各种格式：BTCUSDT, BTC/USDT, BTC-USDT, BTC USDT, btcusdt 等
    const patterns = [
      /([A-Z]{2,10})\s*[/-]?\s*(USDT|BTC|ETH|BNB|BUSD|0G)/gi, // BTC/USDT, BTC-USDT, BTC USDT
      /([A-Z]{2,10})(USDT|BTC|ETH|BNB|BUSD|0G)/gi, // BTCUSDT
    ];

    // 1. 使用正则表达式匹配完整交易对格式
    patterns.forEach((pattern, patternIndex) => {
      // 重置正则表达式的 lastIndex，避免全局匹配的问题
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let pair = "";
        if (match[1] && match[2]) {
          // 格式：BTC/USDT 或 BTCUSDT
          pair = (match[1] + match[2]).toUpperCase();
        } else if (match[0]) {
          // 直接匹配到的完整交易对
          pair = match[0].toUpperCase().replace(/[/-\s]/g, "");
        }
        if (pair && !pairs.includes(pair)) {
          pairs.push(pair);
          console.log(`模式 ${patternIndex} 匹配到交易对:`, pair);
        }
      }
    });

    // 2. 匹配单个币种名称（如 "btc", "BTC", "bitcoin"）
    const textLower = text.toLowerCase();
    // 按单词边界分割，保留币种名称
    const words = textLower.split(/\b/);

    words.forEach((word) => {
      // 移除标点符号和空白
      const cleanWord = word.trim().replace(/[.,!?;:()\[\]{}'"]/g, "");
      if (!cleanWord) return;

      // 检查是否是已知的币种名称
      if (coinMappings[cleanWord]) {
        const pair = coinMappings[cleanWord];
        if (!pairs.includes(pair)) {
          pairs.push(pair);
          console.log(`币种名称 "${cleanWord}" 映射到交易对:`, pair);
        }
      }
    });

    // 3. 匹配独立的币种代码（如 "BTC", "ETH" 等，后面没有跟 USDT）
    // 使用单词边界匹配，避免匹配到已存在的交易对中的部分
    const coinCodePattern = /\b([A-Z]{2,6})\b/g;
    coinCodePattern.lastIndex = 0;
    let coinMatch;
    const matchedPositions: number[] = []; // 记录已匹配的位置，避免重复

    while ((coinMatch = coinCodePattern.exec(text)) !== null) {
      const coinCode = coinMatch[1].toUpperCase();
      const matchIndex = coinMatch.index;

      // 跳过已经在交易对中的币种代码
      const isInPair = pairs.some((pair) => {
        const pairIndex = text.toUpperCase().indexOf(pair, matchIndex);
        return pairIndex >= 0 && pairIndex <= matchIndex + coinCode.length;
      });

      if (isInPair) continue;

      // 检查这个代码是否在映射表中
      const lowerCode = coinCode.toLowerCase();
      if (coinMappings[lowerCode] && !matchedPositions.includes(matchIndex)) {
        const pair = coinMappings[lowerCode];
        if (!pairs.includes(pair)) {
          pairs.push(pair);
          matchedPositions.push(matchIndex);
          console.log(`币种代码 "${coinCode}" 映射到交易对:`, pair);
        }
      }
    }

    console.log("extractTradingPairs 返回结果:", pairs);
    return pairs;
  };

  // 获取币安期货价格
  const fetchBinancePrices = async (
    symbols: string[]
  ): Promise<Record<string, string>> => {
    console.log("fetchBinancePrices 接收到的 symbols:", symbols);
    console.log("symbols 类型:", typeof symbols, "长度:", symbols?.length);

    if (!symbols || symbols.length === 0) {
      console.log("symbols 为空，返回空对象");
      return {};
    }

    const prices: Record<string, string> = {};
    const timeout = 5000; // 5秒超时

    // 如果只有一个交易对，直接使用单个查询
    if (symbols.length === 1) {
      const symbol = symbols[0];
      console.log("单个交易对查询:", symbol);
      try {
        const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
        console.log("请求 URL:", url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log("单个查询返回数据:", data);
          if (data.price) {
            prices[data.symbol] = parseFloat(data.price).toFixed(2);
          }
        } else {
          const errorText = await response.text();
          console.error(`单个查询失败: ${response.status}`, errorText);
        }
      } catch (err) {
        console.error(`获取 ${symbol} 价格失败:`, err);
      }
    } else {
      // 多个交易对，使用批量查询
      try {
        // 币安 API 批量查询格式：symbols=["BTCUSDT","ETHUSDT"]
        const symbolsJson = JSON.stringify(symbols);
        const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbols=${encodeURIComponent(
          symbolsJson
        )}`;
        console.log("批量查询 URL:", url);
        console.log("批量查询 symbols:", symbolsJson);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`批量查询失败: ${response.status}`, errorText);
          throw new Error(
            `币安 API 请求失败: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("批量查询返回数据:", data);

        // 处理返回的数据（应该是数组）
        const priceList = Array.isArray(data) ? data : [data];

        priceList.forEach((item: any) => {
          if (item.symbol && item.price) {
            prices[item.symbol] = parseFloat(item.price).toFixed(2);
          }
        });
      } catch (err) {
        console.error("批量查询失败，尝试单个查询:", err);
        // 如果批量查询失败，尝试单个查询
        for (const symbol of symbols) {
          try {
            const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
            console.log(`单个查询 ${symbol}:`, url);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              console.log(`${symbol} 查询成功:`, data);
              if (data.price) {
                prices[data.symbol] = parseFloat(data.price).toFixed(2);
              }
            } else {
              const errorText = await response.text();
              console.error(
                `获取 ${symbol} 价格失败: ${response.status}`,
                errorText
              );
            }
          } catch (singleErr) {
            console.error(`获取 ${symbol} 价格异常:`, singleErr);
          }
        }
      }
    }

    console.log("最终返回的价格数据:", prices);
    return prices;
  };

  // 处理用户输入，检测交易对并获取价格
  const handleInputProcess = async () => {
    if (!inputMessage.trim()) return;

    const currentInput = inputMessage.trim();
    const tradingPairs = extractTradingPairs(currentInput);
    console.log("检测到的交易对:", tradingPairs);

    // 如果没有检测到交易对，直接发送
    if (tradingPairs.length === 0) {
      await sendMessageToAI(currentInput, {});
      return;
    }

    // 检测到交易对，先获取价格信息
    setPendingMessage(currentInput);
    setDetectedPairs(tradingPairs);
    setPriceLoading(true);
    setPriceError("");
    setPriceData({});

    try {
      console.log("要检测的交易对:", tradingPairs);
      const prices = await fetchBinancePrices(tradingPairs);
      console.log("获取到的价格数据:", prices);

      if (Object.keys(prices).length > 0) {
        setPriceData(prices);
        setPriceLoading(false);
      } else {
        setPriceError("未获取到价格数据，请检查交易对名称是否正确");
        setPriceLoading(false);
      }
    } catch (priceErr) {
      console.error("获取价格数据失败:", priceErr);
      setPriceError(
        `获取价格失败: ${
          priceErr instanceof Error ? priceErr.message : String(priceErr)
        }`
      );
      setPriceLoading(false);
    }
  };

  // 确认并发送消息给AI
  const confirmAndSend = async () => {
    if (!pendingMessage) return;
    await sendMessageToAI(pendingMessage, priceData);
    // 清除确认状态
    setPendingMessage("");
    setDetectedPairs([]);
    setPriceData({});
    setPriceError("");
  };

  // 取消确认，直接发送原始消息
  const cancelAndSend = async () => {
    if (!pendingMessage) return;
    await sendMessageToAI(pendingMessage, {});
    // 清除确认状态
    setPendingMessage("");
    setDetectedPairs([]);
    setPriceData({});
    setPriceError("");
  };

  // 实际发送消息给AI的函数
  const sendMessageToAI = async (
    messageContent: string,
    prices: Record<string, string>
  ) => {
    if (!broker || !selectedProvider) return;

    setInputMessage("");
    setLoading(true);

    try {
      // 构建价格上下文
      let priceContext = "";
      if (Object.keys(prices).length > 0) {
        const priceLines = Object.entries(prices)
          .map(([symbol, price]) => `${symbol}: $${price}`)
          .join("\n");
        priceContext = `[系统] 当前币安期货市场价格：\n${priceLines}\n\n`;
      }

      // 构建用户消息和消息历史
      const userMsg: Message = { role: "user", content: messageContent };
      setMessages((prev) => [...prev, userMsg]);

      // 构建消息历史，包含价格上下文
      const messagesToSend = [];
      if (priceContext) {
        messagesToSend.push({ role: "system", content: priceContext });
      }
      messagesToSend.push(userMsg);

      // 获取服务元数据和请求头
      const metadata = await broker.inference.getServiceMetadata(
        selectedProvider.address
      );
      const headers = await broker.inference.getRequestHeaders(
        selectedProvider.address,
        JSON.stringify(messagesToSend)
      );

      let account;
      try {
        account = await broker.inference.getAccount(selectedProvider.address);
      } catch (error) {
        console.log("账户不存在，正在创建并充值...");
        await broker.ledger.transferFund(
          selectedProvider.address,
          "inference",
          BigInt(2e18)
        );
        // 充值后重新获取账户信息
        account = await broker.inference.getAccount(selectedProvider.address);
      }

      console.log("账户信息:", account);
      if (account && account.balance) {
        console.log("账户余额:", account.balance);
        if (account.balance <= BigInt(5e17)) {
          console.log("子账户余额不足，正在充值...");
          await broker.ledger.transferFund(
            selectedProvider.address,
            "inference",
            BigInt(2e18)
          );
        }
      }

      const response = await fetch(`${metadata.endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          messages: messagesToSend,
          model: metadata.model,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error("API 响应格式错误: 缺少 choices 或 message");
      }

      const aiMsg: Message = {
        role: "assistant",
        content: result.choices[0].message.content,
        id: result.id,
        verified: false,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // 处理验证和计费
      if (result.id) {
        setVerifyingMessageId(result.id);
        setMessage("正在验证响应...");

        try {
          await broker.inference.processResponse(
            selectedProvider.address,
            aiMsg.content,
            result.id
          );

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === result.id ? { ...msg, verified: true } : msg
            )
          );
          setMessage("响应验证成功");
        } catch (verifyErr) {
          console.error("验证失败:", verifyErr);
          setMessage("响应验证失败");
          // 标记验证失败
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === result.id
                ? { ...msg, verified: false, verifyError: true }
                : msg
            )
          );
        } finally {
          setVerifyingMessageId(null);
          setTimeout(() => setMessage(""), 3000);
        }
      }
    } catch (err) {
      const errorMsg: Message = {
        role: "assistant",
        content: "错误: " + (err instanceof Error ? err.message : String(err)),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  if (!selectedProvider) {
    return (
      <div>
        <h2>AI 聊天</h2>
        <p>请先选择并验证服务</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ margin: "0 0 10px 0" }}>
          AI 聊天(接入币安api 可以检测代币给出交易建议)
        </h2>
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            padding: "8px 12px",
            background: "#e9ecef",
            borderRadius: "4px",
          }}
        >
          当前服务: <strong>{selectedProvider.name}</strong> -{" "}
          {selectedProvider.model}
        </div>
      </div>

      <div
        style={{
          height: "calc(100vh - 450px)",
          minHeight: "500px",
          maxHeight: "700px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "15px",
          background: "#fafafa",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            开始与 AI 对话...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: "20px",
                padding: msg.role === "assistant" ? "0" : "8px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: msg.role === "user" ? "#007bff" : "#28a745",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "user" ? "你" : "AI"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MessageContent content={msg.content} role={msg.role} />
                  {msg.role === "assistant" && msg.id && (
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: msg.verifyError
                            ? "#dc3545"
                            : msg.verified
                            ? "#28a745"
                            : verifyingMessageId === msg.id
                            ? "#ffc107"
                            : "#6c757d",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {msg.verifyError
                          ? "❌ 验证失败"
                          : msg.verified
                          ? "✓ 已验证"
                          : verifyingMessageId === msg.id
                          ? "⏳ 验证中..."
                          : "⚠️ 未验证"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 价格确认界面 */}
      {pendingMessage && (
        <div
          style={{
            marginBottom: "10px",
            padding: "15px",
            background: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <strong>待发送消息：</strong>
            <div style={{ marginTop: "5px", color: "#666" }}>
              {pendingMessage}
            </div>
          </div>

          {detectedPairs.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <strong>检测到的交易对：</strong>
              <div style={{ marginTop: "5px" }}>
                {detectedPairs.map((pair, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-block",
                      margin: "2px 5px",
                      padding: "2px 8px",
                      background: "#007bff",
                      color: "white",
                      borderRadius: "3px",
                      fontSize: "12px",
                    }}
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>
          )}

          {priceLoading && (
            <div style={{ marginBottom: "10px", color: "#007bff" }}>
              正在获取价格数据...
            </div>
          )}

          {priceError && (
            <div
              style={{
                marginBottom: "10px",
                padding: "8px",
                background: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {priceError}
            </div>
          )}

          {Object.keys(priceData).length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <strong>获取到的价格信息：</strong>
              <div
                style={{
                  marginTop: "5px",
                  padding: "10px",
                  background: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {Object.entries(priceData).map(([symbol, price]) => (
                  <div key={symbol} style={{ marginBottom: "5px" }}>
                    <strong>{symbol}:</strong> ${price}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            {Object.keys(priceData).length > 0 && (
              <button
                onClick={confirmAndSend}
                disabled={loading}
                style={{
                  padding: "8px 20px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "发送中..." : "确认并发送（包含价格）"}
              </button>
            )}
            <button
              onClick={cancelAndSend}
              disabled={loading}
              style={{
                padding: "8px 20px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "发送中..." : "直接发送（不包含价格）"}
            </button>
            <button
              onClick={() => {
                setPendingMessage("");
                setDetectedPairs([]);
                setPriceData({});
                setPriceError("");
                setInputMessage(pendingMessage);
              }}
              disabled={loading}
              style={{
                padding: "8px 20px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !loading &&
            !priceLoading &&
            !pendingMessage &&
            handleInputProcess()
          }
          placeholder="输入消息..."
          disabled={!!pendingMessage}
          style={{
            flex: 1,
            padding: "12px 15px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            outline: "none",
          }}
        />
        <button
          onClick={handleInputProcess}
          disabled={
            loading || !inputMessage.trim() || !!pendingMessage || priceLoading
          }
          style={{
            padding: "12px 24px",
            fontSize: "14px",
            background:
              loading ||
              !inputMessage.trim() ||
              !!pendingMessage ||
              priceLoading
                ? "#ccc"
                : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor:
              loading ||
              !inputMessage.trim() ||
              !!pendingMessage ||
              priceLoading
                ? "not-allowed"
                : "pointer",
            fontWeight: "500",
          }}
        >
          {priceLoading ? "获取价格中..." : loading ? "发送中..." : "发送"}
        </button>
      </div>
    </div>
  );
}
