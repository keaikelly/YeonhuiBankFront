import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SchedulePage from "./SchedulePage";
import { fetchMyAccountsAPI } from "../api/accounts";

function ScheduleContainer() {
  const { accountId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", amount: "", memo: "", day: "매달 1일" });

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
    setSchedules((prev) => [
      ...prev,
      { id: `sch-${prev.length + 1}`, ...form, amount: Number(form.amount || 0) },
    ]);
    setForm((prev) => ({ ...prev, amount: "", memo: "" }));
    window.alert("예약이체 기능은 API 연동 후 동작합니다.");
  };

  return (
    <SchedulePage
      schedules={schedules}
      form={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      accounts={accounts.map((a) => ({
        id: a.accountNum || a.id,
        name: a.accountType || "계좌",
      }))}
      selectedAccount={selectedAccount}
    />
  );
}

export default ScheduleContainer;
