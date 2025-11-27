import { useState, useEffect } from "react";

interface ServiceTabProps {
  broker: any;
  selectedProvider: any;
  setSelectedProvider: (provider: any) => void;
  message: string;
  setMessage: (message: string) => void;
}

export default function ServiceTab({
  broker,
  selectedProvider,
  setSelectedProvider,
  message,
  setMessage,
}: ServiceTabProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  // 获取服务列表
  const fetchProviders = async () => {
    if (!broker) return;

    setLoading(true);
    try {
      const services = await broker.inference.listService();
      const list = services.map((s: any) => ({
        address: s.provider || "",
        name: s.name || s.model || "Unknown",
        model: s.model || "Unknown",
      }));
      setProviders(list);
      if (list.length > 0 && !selectedProvider) {
        setSelectedProvider(list[0]);
      }
      // 获取服务列表后，自动获取余额
      if (list.length > 0) {
        fetchAllBalances(list);
      }
    } catch (err) {
      console.error("获取服务失败:", err);
      setMessage("获取服务列表失败，请稍后重试");
    }
    setLoading(false);
  };

  // 获取单个 provider 的余额
  const fetchProviderBalance = async (providerAddress: string) => {
    if (!broker) return null;

    try {
      const account = await broker.inference.getAccount(providerAddress);

      // 尝试多种方式获取余额
      let balance = BigInt(0);
      if (account?.balance !== undefined) {
        balance = BigInt(account.balance);
      } else if (account?.[2] !== undefined) {
        balance = BigInt(account[2]);
      } else if (account?.[3] !== undefined) {
        balance = BigInt(account[3]);
      }

      return balance;
    } catch (error) {
      // 账户不存在，返回 0
      return BigInt(0);
    }
  };

  // 获取所有 provider 的余额
  const fetchAllBalances = async (providerList?: any[]) => {
    const listToUse = providerList || providers;
    if (!broker || listToUse.length === 0) return;

    setLoadingBalances(true);
    const newBalances: Record<string, string> = {};

    try {
      // 并行查询所有 provider 的余额
      const balancePromises = listToUse.map(async (provider) => {
        const balance = await fetchProviderBalance(provider.address);
        if (balance !== null) {
          const balanceInA0GI = Number(balance) / 1e18;
          newBalances[provider.address] = balanceInA0GI.toFixed(4);
        } else {
          newBalances[provider.address] = "0.0000";
        }
      });

      await Promise.all(balancePromises);
      setBalances(newBalances);
    } catch (err) {
      console.error("获取余额失败:", err);
    }
    setLoadingBalances(false);
  };

  // 自动获取服务列表
  useEffect(() => {
    fetchProviders();
  }, [broker]);

  // 为选中的 provider 充值
  const handleDepositToProvider = async () => {
    if (!broker || !selectedProvider || !depositAmount) return;

    setDepositing(true);
    try {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        setMessage("请输入有效的充值金额");
        setDepositing(false);
        return;
      }

      // 从主账本转账到 inference 子账户
      const amountInWei = BigInt(amount * 1e18);
      await broker.ledger.transferFund(
        selectedProvider.address,
        "inference",
        amountInWei
      );

      setMessage(`已为 ${selectedProvider.name} 充值 ${amount} A0GI 成功`);
      setDepositAmount("");

      // 等待交易确认
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 刷新余额
      await fetchAllBalances();
    } catch (err) {
      console.error("充值失败:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage(`充值失败: ${errorMsg}`);
    }
    setDepositing(false);
  };

  // 验证服务
  const verifyService = async () => {
    if (!broker || !selectedProvider) return;

    setLoading(true);
    try {
      await broker.inference.acknowledgeProviderSigner(
        selectedProvider.address
      );
      setMessage("服务验证成功");
    } catch (err) {
      console.error("服务验证失败:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage(`服务验证失败: ${errorMsg}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>服务列表</h2>
      {providers.length > 0 ? (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span>Provider 余额:</span>
            <button
              onClick={() => fetchAllBalances()}
              disabled={loadingBalances}
              style={{
                padding: "5px 10px",
                fontSize: "12px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loadingBalances ? "not-allowed" : "pointer",
              }}
            >
              {loadingBalances ? "刷新中..." : "刷新余额"}
            </button>
          </div>

          <select
            value={selectedProvider?.address || ""}
            onChange={(e) => {
              const p = providers.find((p) => p.address === e.target.value);
              setSelectedProvider(p);
            }}
            style={{
              padding: "5px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            {providers.map((p) => {
              const balance = balances[p.address] || "查询中...";
              return (
                <option key={p.address} value={p.address}>
                  {p.name} - {p.model} (余额: {balance} A0GI)
                </option>
              );
            })}
          </select>

          {selectedProvider && (
            <div>
              <p>地址: {selectedProvider.address}</p>
              <p style={{ marginTop: "5px", color: "#666", fontSize: "14px" }}>
                Inference 子账户余额:{" "}
                <strong style={{ color: "#007bff" }}>
                  {balances[selectedProvider.address] || "查询中..."} A0GI
                </strong>
              </p>

              {/* 充值功能 */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <p
                  style={{
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  为 {selectedProvider.name} 充值:
                </p>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="充值金额 (A0GI)"
                    min="0"
                    step="0.1"
                    style={{
                      flex: 1,
                      padding: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                  <button
                    onClick={handleDepositToProvider}
                    disabled={depositing || !depositAmount || loading}
                    style={{
                      padding: "5px 15px",
                      background:
                        depositing || !depositAmount ? "#ccc" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor:
                        depositing || !depositAmount
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {depositing ? "充值中..." : "充值"}
                  </button>
                </div>
                <p
                  style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}
                >
                  将从主账本转账到该 provider 的 inference 子账户
                </p>
              </div>

              <button
                onClick={verifyService}
                disabled={loading}
                style={{ padding: "5px 15px", marginTop: "10px" }}
              >
                {loading ? "验证中..." : "验证服务"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  );
}
