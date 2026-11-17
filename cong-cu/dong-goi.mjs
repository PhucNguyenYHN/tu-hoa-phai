// Mã hóa 1 báo cáo HTML thành tệp .json (AES-256-GCM, khóa từ mật khẩu qua PBKDF2-SHA256)
// để đẩy lên GitHub công khai mà chỉ người có mật khẩu mới đọc được.
//
// Dùng:  node cong-cu/dong-goi.mjs <bao-cao.html> [--mat-khau "..."] [--id abc123...]
//  - không có --mat-khau: tự sinh mật khẩu ngẫu nhiên (khuyên dùng, vì ai cũng tải được tệp mã hóa
//    và thử đoán offline; mật khẩu tự đặt kiểu ngày sinh sẽ bị dò ra)
//  - không có --id: tự sinh mã ngẫu nhiên 16 ký tự; tên tệp KHÔNG chứa thông tin người dùng
// Kết quả: ket-qua/<id>.json (đẩy lên GitHub). Bản HTML gốc không bao giờ vào repo.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ITER = 600000;
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
const opt = (n) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : null; };
if (!file) { console.error("Thiếu tệp HTML. Dùng: node cong-cu/dong-goi.mjs bao-cao.html"); process.exit(1); }

const A = "abcdefghjkmnpqrstuvwxyz23456789"; // bỏ ký tự dễ nhầm (i l o 0 1)
const rnd = (n) => Array.from(crypto.randomBytes(n), (b) => A[b % A.length]).join("");
let pw = opt("mat-khau");
const generated = !pw;
if (!pw) pw = [rnd(4), rnd(4), rnd(4)].join("-");
const id = opt("id") || crypto.randomBytes(8).toString("hex");

const html = fs.readFileSync(file, "utf8");
const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pw.normalize("NFC"), salt, ITER, 32, "sha256");
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([c.update(html, "utf8"), c.final(), c.getAuthTag()]); // WebCrypto: ct||tag
const out = { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: salt.toString("base64"), iv: iv.toString("base64"), ct: ct.toString("base64") };

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
fs.mkdirSync(path.join(root, "ket-qua"), { recursive: true });
const dst = path.join(root, "ket-qua", id + ".json");
fs.writeFileSync(dst, JSON.stringify(out));
console.log("Tệp:      " + dst);
console.log("Mã (id):  " + id);
console.log("Liên kết: https://phucnguyenyhn.github.io/tu-hoa-phai/xem/#" + id);
console.log("Mật khẩu: " + pw + (generated ? "   (tự sinh, hãy gửi riêng cho người dùng)" : ""));
