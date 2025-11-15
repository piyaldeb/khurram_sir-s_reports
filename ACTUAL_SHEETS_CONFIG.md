# Actual Google Sheets Configuration

## Service Account Email
```
data-pasting@data-pasting-470703.iam.gserviceaccount.com
```

**IMPORTANT**: Share all Google Sheets below with this email address with Editor permissions!

## Google Sheets Links and IDs

### 1. Monthly Budget vs Achievement
- **URL**: https://docs.google.com/spreadsheets/d/1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw/edit?gid=54672304#gid=54672304
- **Sheet ID**: `1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw`
- **GID**: `54672304`
- **Suggested Range**: `Sheet1!A1:Z1000` (adjust based on actual sheet name and data)

### 2. 180 Days Stock
- **URL**: https://docs.google.com/spreadsheets/d/1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc/edit?gid=1125819248#gid=1125819248
- **Sheet ID**: `1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc`
- **GID**: `1125819248`
- **Suggested Range**: `Sheet1!A1:Z1000` (adjust based on actual sheet name and data)

### 3. OT Cost
- **URL**: https://docs.google.com/spreadsheets/d/1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho/edit?gid=1629557200#gid=1629557200
- **Sheet ID**: `1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho`
- **GID**: `1629557200`
- **Suggested Range**: `Sheet1!A1:Z1000` (adjust based on actual sheet name and data)

### 4. Standard Item Stock
- **URL**: https://docs.google.com/spreadsheets/d/1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk/edit?gid=993695460#gid=993695460
- **Sheet ID**: `1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk`
- **GID**: `993695460`
- **Suggested Range**: `Sheet1!A1:Z1000` (adjust based on actual sheet name and data)

## GOOGLE_SHEETS_CONFIG for .env

Use this JSON configuration in your backend `.env` file. Make sure to:
1. Replace `Sheet1` with the actual sheet/tab name in each Google Sheet
2. Adjust ranges (e.g., `A1:Z1000`) based on your actual data size
3. Format as a single line (no line breaks)

```json
{
  "budget_vs_achievement": {
    "sheetId": "1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw",
    "range": "Sheet1!A1:Z1000"
  },
  "stock_180": {
    "sheetId": "1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc",
    "range": "Sheet1!A1:Z1000"
  },
  "ot_report": {
    "sheetId": "1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho",
    "range": "Sheet1!A1:Z1000"
  },
  "production_zippers": {
    "sheetId": "1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk",
    "range": "Sheet1!A1:Z500"
  },
  "production_metal": {
    "sheetId": "1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk",
    "range": "Sheet2!A1:Z500"
  },
  "quality": {
    "sheetId": "1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk",
    "range": "Sheet3!A1:Z500"
  }
}
```

### For .env file (single line):

```
GOOGLE_SHEETS_CONFIG={"budget_vs_achievement":{"sheetId":"1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw","range":"Sheet1!A1:Z1000"},"stock_180":{"sheetId":"1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc","range":"Sheet1!A1:Z1000"},"ot_report":{"sheetId":"1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho","range":"Sheet1!A1:Z1000"},"production_zippers":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet1!A1:Z500"},"production_metal":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet2!A1:Z500"},"quality":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet3!A1:Z500"}}
```

## Setup Steps

### 1. Share All Sheets with Service Account

For each Google Sheet above:
1. Open the Google Sheet
2. Click **Share** button (top right)
3. Enter: `data-pasting@data-pasting-470703.iam.gserviceaccount.com`
4. Select **Editor** permission
5. Uncheck "Notify people"
6. Click **Share**

### 2. Verify Sheet Names and Ranges

1. Open each Google Sheet
2. Check the actual tab/sheet name at the bottom (it might not be "Sheet1")
3. Update the range in the config above if needed
4. The range format is: `SheetName!StartCell:EndCell`
   - Example: `Budget!A1:Z100` means tab "Budget", from cell A1 to Z100

### 3. Update Your .env File

Add the GOOGLE_SHEETS_CONFIG line to your `backend/.env` file (make sure it's one continuous line).

### 4. Test the Configuration

After setting up:
```bash
cd backend
npm run dev
```

Then test by logging into the app and viewing the reports. If data doesn't load, check:
- Service account has Editor access to all sheets
- Sheet names in ranges match actual tab names
- Ranges cover all your data
