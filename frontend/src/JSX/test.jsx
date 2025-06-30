import { QRCode } from "qrcode.react";

const bank = "bidv"; // mã ngân hàng: VCB = Vietcombank
const accountNumber = "12610001249264";
const accountName = "BUI HOANG ANH";
const amount = 120000;
const addInfo = "THANHTOAN123"; // Nội dung chuyển khoản

const qrUrl = `https://img.vietqr.io/image/${bank}-${accountNumber}-qr_only.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(accountName)}`;

return (
  <div>
    <h3>Quét mã để thanh toán</h3>
    <img src={qrUrl} alt="QR Code" />
    <p><strong>{amount.toLocaleString()}đ</strong></p>
    <p><strong>ND:</strong> {addInfo}</p>
  </div>
);
