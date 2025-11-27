import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TransferPage from "./TransferPage";
import { fetchMyAccountsAPI } from "../api/accounts";
import { createTransferAPI } from "../api/transfers";

function TransferContainer() {
  const { accountId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", amount: "", memo: "" });

  useEffect(() => {
    const load = async () => {
      // GET /api/accounts/me : 내 계좌 목록 조회
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);
        const initial = accountId || content[0]?.accountNum || content[0]?.id || "";
        setForm((prev) => ({ ...prev, from: initial }));
      } catch (err) {
        setAccounts([]);
      }
    };
    load();
  }, [accountId]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.accountNum === form.from || a.id === form.from) || accounts[0];
  }, [accounts, form.from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST /api/transactions/transfer : 이체 요청
      await createTransferAPI({
        fromAccountNum: form.from,
        toAccountNum: form.to,
        amount: Number(form.amount || 0),
        memo: form.memo,
      });
      window.alert("이체가 완료되었습니다.");
      setForm((prev) => ({ ...prev, amount: "", memo: "" }));
    } catch (err) {
      window.alert("이체에 실패했습니다.");
    }
  };

  return (
    <TransferPage
      form={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      accounts={accounts.map((a) => ({
        id: a.accountNum || a.id,
        name: a.accountType || "계좌",
      }))}
      selectedAccount={{
        limit: selectedAccount?.limit || 0,
      }}
    />
  );
}

export default TransferContainer;
