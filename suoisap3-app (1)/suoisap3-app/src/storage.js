import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Tất cả dữ liệu của app được lưu chung trong 1 collection Firestore,
// mỗi "khu vực" (nhân viên, thiết bị, thông số...) là 1 document riêng.
const COLLECTION = "suoisap3_data";

export async function storageGet(key) {
  const ref = doc(db, COLLECTION, key);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data(); // { value: "...json string..." }
}

export async function storageSet(key, value) {
  const ref = doc(db, COLLECTION, key);
  await setDoc(ref, { value, capNhatLuc: new Date().toISOString() });
  return { key, value };
}
