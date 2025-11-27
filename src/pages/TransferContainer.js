import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TransferPage from "./TransferPage";
import { fetchMyAccountsAPI } from "../api/accounts";

function TransferContainer() {
  const { accountId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", amount: "", memo: "" });

  useEffect(() => {
    const load = async () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    window.alert("송금 기능은 API 연동 후 동작합니다.");
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
