/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - TỰ ĐỘNG LƯU LEAD TỪ LANDING PAGE VÀO GOOGLE SHEET
 * ============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (Trong 1 phút):
 * 1. Mở Google Sheet bạn muốn lưu dữ liệu (hoặc tạo Sheet mới).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết code mặc định trong file Code.gs, dán toàn bộ nội dung file này vào.
 * 4. Bấm "Lưu" (biểu tượng đĩa mềm 💾 hoặc Ctrl + S).
 * 5. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Triển khai mới" (New deployment).
 * 6. Bấm vào icon bánh răng ⚙️ bên cạnh "Chọn loại" -> Chọn "Ứng dụng web" (Web app).
 * 7. Thiết lập cấu hình:
 *    - Mô tả: "API nhận lead Digital Lab"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me - your_email@gmail.com)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <-- CỰC KỲ QUAN TRỌNG
 * 8. Bấm "Triển khai" (Deploy) -> Cấp quyền truy cập nếu Google hỏi -> Copy link "Ứng dụng web" (Web App URL).
 * 9. Dán URL nhận được vào file .env (biến GOOGLE_SHEET_SCRIPT_URL) hoặc biến window.GOOGLE_SCRIPT_URL.
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Khóa tránh xung đột khi nhiều người submit cùng lúc

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tự động tạo hàng tiêu đề nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian (Timestamp)", "Họ và Tên", "Email", "Nguồn / Ghi chú"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#E8F0FE");
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    var timestamp = new Date();
    var name = data.name || data.fullname || data.hoTen || "";
    var email = data.email || "";
    var source = data.source || "Landing Page Digital Lab";

    // Ghi vào Google Sheet
    sheet.appendRow([
      Utilities.formatDate(timestamp, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss"),
      name,
      email,
      source
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu thông tin thành công!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Apps Script Web App đang hoạt động tốt!"
  })).setMimeType(ContentService.MimeType.JSON);
}
