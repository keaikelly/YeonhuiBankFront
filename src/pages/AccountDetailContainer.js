import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AccountDetailPage from "./AccountDetailPage";
import { fetchAccountAPI } from "../api/accounts";

function AccountDetailContainer() {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const load = async () => {
      // GET /api/accounts/{accountNum} : 계좌 상세 조회
      try {
        const res = await fetchAccountAPI(accountId);
        const data = res?.data?.data ?? res?.data ?? {};
        setAccount({
          id: data.accountNum || data.id || accountId,
          balance: data.balance || 0,
          limit: data.dailyLimitAmt || 0,
        });
      } catch {
        setAccount(null);
      }
    };
    if (accountId) load();
  }, [accountId]);

  if (!account) {
    return null;
  }

  return (
    <AccountDetailPage
      account={account}
      transactions={transactions}
      accounts={[{ id: account.id, name: account.id }]}
      onSelect={() => {}}
    />
  );
}

export default AccountDetailContainer;
