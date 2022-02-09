# Photo-Filer
Repository for Photo Filer, a program written in Google Apps Script to check a user's Google Photos library for items that either have no associated album or are in more than one album. Some of us like having a place for everything and everything in its place!

### Credit Where Credit is Due
This project relies heavily upon tanaikech's GPhotoApp library, available for viewing here: https://github.com/tanaikech/GPhotoApp
Many thanks to them for their awesome work!

##### Instructions:
1. Create a new Google Sheets file. Go to Extensions --> Apps Script.
2. Click Project Settings (gear on lefthand side), and check "Show "appscript.json" manifest in file editor".
3. Return to Editor (<> shape on lefthand side). Append the following to your manifest in appsscript.json:

```
"oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
```

When complete, your manifest should be the following (timeZone may be different for your location):

```
{
  "timeZone": "America/New_York",
  "dependencies": {
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

4.  Set up Tanaikech's GPhotoApp library. Instructions and code available here: https://github.com/tanaikech/GPhotoApp

NOTE: Recent changes to Google Workplace prevent "Internal" use of Google Cloud projects. This means that you will get a security warning upon running this script. Note that this program only reads the content of your library, and does not edit it in any way.

5. Copy and paste the .gs files in this repository into the script editor. Name the files whatever you would like. Click Save or hit CMD + S/CTRL + S upon completion. When ready, refresh the spreadsheet window. Your Apps Script window will automatically close. When the spreadsheet window has refreshed, you will now have a new menu tab for this program. 
6. Enjoy! Please note that the active sheet is used for the program's writing functions.
