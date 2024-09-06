import axiosInstance from "./index.js";

export async function baseInfo(companyName) {
  const res = await axiosInstance.post(
    `/overview/ent`,
    { companyName },
    {
      timeout: -1,
    }
  );
  return res.data;
}
