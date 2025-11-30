import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AccountDetailPage from "./AccountDetailPage";
import { fetchAccountAPI } from "../api/accounts";

function AccountDetailContainer() {
  const { accountNum } = useParams();   // URL에서 계좌번호 받기
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // GET /api/accounts/{accountNum}
        const res = await fetchAccountAPI(accountNum);
        const data = res?.data?.data ?? res?.data ?? {};

        setAccount({
          id: data.accountId || data.id,      // PK
          accountNum: data.accountNum,       // 계좌번호
          balance: data.balance || 0,
          limit: data.dailyLimitAmt || 0,
        });
      } catch {
        setAccount(null);
      }
    };
    if (accountNum) load();
  }, [accountNum]);

  if (!account) return null;

  return (
    <AccountDetailPage
      account={account}
      transactions={transactions}
      accounts={[{ id: account.id, name: account.accountNum }]}
      onSelect={() => {}}
    />
  );
}

export default AccountDetailContainer;
