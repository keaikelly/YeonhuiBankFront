import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SchedulePage from "./SchedulePage";
import { fetchMyAccountsAPI } from "../api/accounts";
import {
  createScheduleAPI,
  fetchSchedulesByFromAccountAPI,
} from "../api/scheduledTransactions";

function ScheduleContainer() {
  const { accountId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", amount: "", memo: "", day: "매달 1일" });

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

  useEffect(() => {
    const loadSchedules = async () => {
      if (!form.from) return;
      try {
        // GET /api/scheduled-transactions/account/{fromAccountId} : 출금계좌 기준 예약 목록
        const res = await fetchSchedulesByFromAccountAPI(form.from);
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || data || [];
        setSchedules(content);
      } catch {
        setSchedules([]);
      }
    };
    loadSchedules();
  }, [form.from]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.accountNum === form.from || a.id === form.from) || accounts[0];
  }, [accounts, form.from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST /api/scheduled-transactions : 예약 등록
      await createScheduleAPI({
        fromAccountId: form.from,
        toAccountId: form.to,
        amount: Number(form.amount || 0),
        memo: form.memo,
        frequency: form.day,
      });
      window.alert("예약이체가 등록되었습니다.");
      setForm((prev) => ({ ...prev, amount: "", memo: "" }));
    } catch {
      window.alert("예약이체 등록에 실패했습니다.");
    }
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
