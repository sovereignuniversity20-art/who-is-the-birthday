// Message storage settings (Google Form + Google Sheet).
// See README.md for how to fill these in. Leave them blank and the card still works:
// visitors see their own message plus anything hard-coded in messages.json.
window.CARD_CONFIG = {
  // The form's "formResponse" URL, e.g. https://docs.google.com/forms/d/e/XXXX/formResponse
  formResponseUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfzRbCWQQIWiuSmur-rnEZwwv39N7icMnwfyH0wYxUhWURhgA/formResponse",
  // Field IDs from the form's pre-filled link, e.g. "entry.123456789"
  messageEntry: "entry.107149164",
  nameEntry: "entry.1191617713",
  // The response sheet published to the web as CSV, e.g. https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJBNyy807xWJykJDB98lQv3xW_7szlrj3gnh8mAsgt4R0foAGgkRxhevMFGgsw8zPeBr5uBz0rrOCy/pub?gid=2122647416&single=true&output=csv"
};
