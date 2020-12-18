var prop  = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet() //get active SpreadsheetApp ID and add it to our Property
  prop .setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  var lock = LockService.getScriptLock() //prevent concurrent update
  lock.tryLock(10000)
  try {
    var doc = SpreadsheetApp.openById(prop .getProperty('key')) //open sheet from ID extracted from url
    var sheet = doc.getSheetByName('Sheet1')
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var row_next = sheet.getLastRow() + 1
    
    //extract form data
    var row_new = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
      })
    
    sheet.getRange(row_next, 1, 1, row_new.length).setValues([row_new]) //add new row
    return ContentService
    .createTextOutput(JSON.stringify({ 'result': 'success', 'row': row_next }))
    .setMimeType(ContentService.MimeType.JSON)
    }
  catch (e) {
    return ContentService
    .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
    .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock() //release lock to allow other users to update the sheet
  }
}