// Xóa dữ liệu cũ của sheet

function refresh_Push_Reverse() {
  refreshSheet("1-YHC2Nvv9s97CfB2ShgKwO9J2xMFrZ-PHR_t5IiV8-A","Follow_Reverse","A3:G");
}

//  Lấy dữ liệu pickup về sheet.

function craw_pending_assign() {
  // Sheet chứa data
  var fms_Spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1-YHC2Nvv9s97CfB2ShgKwO9J2xMFrZ-PHR_t5IiV8-A/edit");
  var fms_Sheet = fms_Spreadsheet.getSheetByName("Follow_Reverse");
  var destination_Spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1cl8dsvV923vkJelkGHP9y2P860O1ZC3jvaYsqBxKHpk/edit");
  var destination_Sheet = destination_Spreadsheet.getSheetByName("Mapped_PUPG");

  var url = "https://spx.shopee.vn/api/admin/pickup/pickup_point/pending_assign?pageno=1&count=2000&pickup_status=12&service_type_id_list=6&order_by_oldest=1";

  var infor_Sheet = fms_Spreadsheet.getSheetByName("README");
  fms_user_id = infor_Sheet.getRange("C3").getValue();
  fms_user_skey = infor_Sheet.getRange("C2").getValue();
  fms_display_name = infor_Sheet.getRange("C1").getValue();

  var options = {
    "method": "get",
    "headers": {
    "Cookie": "fms_user_id=" + fms_user_id + "; fms_user_skey=" + fms_user_skey + "; fms_display_name=" + fms_display_name + "; spx_st = 1; spx_cid = VN"
    },
    "muteHttpExceptions": true
  };

  // Tạo kiểu dữ liệu cần lấy
  function parserProduct(json) {
    var d = {};
    d['pickup_point_id'] = json.pickup_point_id;
    d['address'] = json.address;
    d['mapped_pickup_point_group'] = json.mapped_pickup_point_group;
    return d;
  }

  var result = [];

  // Send request
  try {
    var response = UrlFetchApp.fetch(url, options);

    // check status
    if (response.getResponseCode() == 200) {
      var data = JSON.parse(response.getContentText());
      var lengthData = data.data.total;    

      // continue data processing
      for (var i = 0; i < lengthData; i++) {
        var iJSON = data.data.list[i];
        result.push(parserProduct(iJSON));
      } 

    } else {
      fms_Sheet.getRange("H1").setValue("fms_user_skey đã thay đổi");
    }
  } catch (error) {
    fms_Sheet.getRange("H1").setValue("Lỗi Code");
  }

  var data = [];

  for (var i = 0; i < result.length; i++) {
    var row = [
      result[i].pickup_point_id,
      result[i].address,
      result[i].mapped_pickup_point_group
    ];
    data.push(row);
  }

  const timenow = new Date();

  if (data.length > 0) {
    refreshSheet("1cl8dsvV923vkJelkGHP9y2P860O1ZC3jvaYsqBxKHpk","Mapped_PUPG","A2:C");
    destination_Sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    fms_Sheet.getRange("H1").setValue("Last update: " + timenow.toLocaleDateString('vi-VN')+ ' ' + timenow.toLocaleTimeString('vi-VN'));
  } else {
    fms_Sheet.getRange("H1").setValue("Không truy vấn được dữ liệu");
  }
}