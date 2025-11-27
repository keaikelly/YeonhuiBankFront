// 공통 요청 처리기 (수정 x)
export const request = async (instance, method, url, data = {}) => {
  try {
    const response = await instance[method](url, data);
    console.log(`✅ 성공 :`, response);
    return response;
  } catch (error) {
    console.error(`❌ 실패 :`, error.response);
    throw error;
  }
};
