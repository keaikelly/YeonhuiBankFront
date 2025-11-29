import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SchedulePage from "./SchedulePage";
import { fetchMyAccountsAPI } from "../api/accounts";
import {
  createScheduleAPI,
  fetchSchedulesByFromAccountAPI,
  fetchMySchedulesAPI,   // 🔹 추가
} from "../api/scheduledTransactions";

function ScheduleContainer() {
  const { accountId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    from: "",
    to: "",
    amount: "",
    memo: "",
    day: "매달 1일",
  });

  // 1) 내 계좌 목록 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);

        // 🔹 초기 출금 계좌: 계좌 "id" 를 사용 (PK)
        const initialId =
          accountId ||
          (content[0]?.id != null ? String(content[0].id) : "");

        setForm((prev) => ({ ...prev, from: initialId }));
      } catch (err) {
        console.error(err);
        setAccounts([]);
      }
    };
    load();
  }, [accountId]);

  // 2) 예약이체 목록 불러오기
  useEffect(() => {
    const loadSchedules = async () => {
      // 아직 from 선택 안 됐으면 호출 안 함
      if (!form.from) return;

      try {
        let res;

        // 🔹 "전체" 같은 값을 쓸 경우를 대비
        if (form.from === "any") {
          // → GET /api/scheduled-transactions/my
          res = await fetchMySchedulesAPI();
        } else {
          // → GET /api/scheduled-transactions/account/{fromAccountId}
          const fromId = Number(form.from);
          if (Number.isNaN(fromId)) {
            console.warn("fromAccountId가 숫자가 아닙니다:", form.from);
            setSchedules([]);
            return;
          }
          res = await fetchSchedulesByFromAccountAPI(fromId);
        }

        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || data || [];
        setSchedules(content);
      } catch (e) {
        console.error(e);
        setSchedules([]);
      }
    };
    loadSchedules();
  }, [form.from]);

  // 3) 선택된 출금 계좌 (id 기준)
  const selectedAccount = useMemo(() => {
    if (!accounts.length) return null;
    if (form.from === "any") return null;

    return (
      accounts.find((a) => String(a.id) === String(form.from)) || accounts[0]
    );
  }, [accounts, form.from]);

  // 4) 예약이체 생성
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fromId = Number(form.from);
      const toId = Number(form.to);

      if (Number.isNaN(fromId) || Number.isNaN(toId)) {
        window.alert("출금/입금 계좌 선택이 잘못되었습니다.");
        return;
      }

      await createScheduleAPI({
        fromAccountId: form.from,
        toAccountId: form.to,
        amount: Number(form.amount || 0),
        memo: form.memo,
        frequency: form.day,
  
      });

      window.alert("예약이체가 등록되었습니다.");
      setForm((prev) => ({ ...prev, amount: "", memo: "" }));
    } catch (e) {
      console.error(e);
      window.alert("예약이체 등록에 실패했습니다.");
    }
  };

  return (
    <SchedulePage
      schedules={schedules}
      form={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      // 🔹 드롭다운에 쓸 계좌 목록: value는 id, label은 계좌번호
      accounts={accounts.map((a) => ({
        id: a.accountNum || a.id,          // **id 기반으로 통일**
        name: a.accountNum || "계좌",
      }))}
      selectedAccount={selectedAccount}
    />
  );
}

export default ScheduleContainer;
