// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import TransferPage from "./TransferPage";
// import { fetchMyAccountsAPI } from "../api/accounts";
// import { createTransferAPI } from "../api/transfers";
// import { fetchAbnormalByAccountAPI } from "../api/abnormalTransfers";

// function TransferContainer() {
//   const { accountId } = useParams();
//   const [accounts, setAccounts] = useState([]);
//   const [form, setForm] = useState({ from: "", to: "", amount: "", memo: "" });

//   useEffect(() => {
//     const load = async () => {
//       // GET /api/accounts/me : 내 계좌 목록 조회
//       try {
//         const res = await fetchMyAccountsAPI();
//         const data = res?.data?.data ?? res?.data ?? {};
//         const content = data?.content || [];
//         setAccounts(content);
//         const initial = accountId || content[0]?.accountNum || content[0]?.id || "";
//         setForm((prev) => ({ ...prev, from: initial }));
//       } catch (err) {
//         setAccounts([]);
//       }
//     };
//     load();
//   }, [accountId]);

//   const selectedAccount = useMemo(() => {
//     return accounts.find((a) => a.accountNum === form.from || a.id === form.from) || accounts[0];
//   }, [accounts, form.from]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // POST /api/transactions/transfer : 이체 요청
//       await createTransferAPI({
//         fromAccountNum: form.from,
//         toAccountNum: form.to,
//         amount: Number(form.amount || 0),
//         memo: form.memo,
//       });
//       window.alert("이체가 완료되었습니다.");
//       try {
//         // GET /api/abn-transfers/account/{accountNum} : 이체 후 이상거래 알림 조회
//         const res = await fetchAbnormalByAccountAPI(form.from);
//         const data = res?.data?.data ?? res?.data ?? [];
//         if (Array.isArray(data) && data.length > 0) {
//           window.alert(`이상거래 알림 ${data.length}건이 감지되었습니다.`);
//         }
//       } catch (err) {
//         // 알림 조회 실패는 무시
//       }
//       setForm((prev) => ({ ...prev, amount: "", memo: "" }));
//     } catch (err) {
//       window.alert("이체에 실패했습니다.");
//     }
//   };

//   return (
//     <TransferPage
//       form={form}
//       onChange={setForm}
//       onSubmit={handleSubmit}
//       accounts={accounts.map((a) => ({
//         id: a.accountNum || a.id,
//         name: a.accountType || "계좌",
//       }))}
//       selectedAccount={{
//         limit: selectedAccount?.limit || 0,
//       }}
//     />
//   );
// }

// export default TransferContainer;
// src/pages/TransferContainer.js
import { useEffect, useMemo, useState } from "react";
// useParams 안 써도 됨
// import { useParams } from "react-router-dom";
import TransferPage from "./TransferPage";
import { fetchMyAccountsAPI } from "../api/accounts";
import { createTransferAPI } from "../api/transfers";
import { fetchAbnormalByAccountAPI } from "../api/abnormalTransfers";

function TransferContainer() {
  // const { accountId } = useParams();  // 🔴 일단 안 씀
  const [accounts, setAccounts] = useState([]);

  // ✅ 필드 이름을 확실하게!
  const [form, setForm] = useState({
    fromAccountNum: "",
    toAccountNum: "",
    amount: "",
    memo: "",
  });

  // -------------------------------
  // 1) 내 계좌 목록 로드 + fromAccountNum 초기값 세팅
  // -------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);

        if (!content.length) return;

        // ✅ 무조건 첫 번째 계좌의 accountNum을 기본값으로 설정
        const firstAccountNum = content[0].accountNum;
        setForm((prev) => ({
          ...prev,
          fromAccountNum: firstAccountNum,
        }));
      } catch (err) {
        setAccounts([]);
      }
    };
    load();
  }, []); // accountId 의존성 제거

  // -------------------------------
  // 2) 선택된 계좌 한도 정보 등
  // -------------------------------
  const selectedAccount = useMemo(() => {
    if (!accounts.length) return undefined;
    return (
      accounts.find((a) => a.accountNum === form.fromAccountNum) || accounts[0]
    );
  }, [accounts, form.fromAccountNum]);

  // -------------------------------
  // 3) 이체 요청
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fromAccountNum: form.fromAccountNum,
        toAccountNum: form.toAccountNum,
        amount: Number(form.amount || 0),
        memo: form.memo,
      };

      console.log("🔎 transfer payload", payload);

      await createTransferAPI(payload);
      window.alert("이체가 완료되었습니다.");

      // 이체 후 이상거래 조회
      try {
        const res = await fetchAbnormalByAccountAPI(form.fromAccountNum);
        const data = res?.data?.data ?? res?.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          window.alert(`이상거래 알림 ${data.length}건이 감지되었습니다.`);
        }
      } catch (err) {
        // 알림 조회 실패는 무시
      }

      // 금액/메모만 리셋
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
        // ✅ 드롭다운 value = 항상 accountNum
        id: a.accountNum,
        name: a.accountType || "계좌",
      }))}
      selectedAccount={{
        limit:
          selectedAccount?.dailyLimitAmt ??
          selectedAccount?.limit ??
          0,
      }}
    />
  );
}

export default TransferContainer;
