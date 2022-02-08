/**
 * Class used to display content via Google Apps Script's built-in UI features. 
 */ 
class UIClass {
  constructor(){
    this.Ui = SpreadsheetApp.getUi();
    
  };   
  /** 
   * Creates a menu in the spreadsheet with three buttons: one to check the user's
    library for media items in more than one album, one to check the user's library
    for media items that are not in an album, and one containing text about the
    program.
   */ 
  intializeMenu(){
    this.Ui
        .createMenu('Photo Filer')        
        .addItem('Write Isolated Media to Sheet', 'writeIsolatedMediaToSheet')
        .addItem('Check Library for Duplicates', 'checkLibraryForDuplicates')
        .addSeparator()
        .addItem('About','displayAboutText')
        .addToUi();
  }; 

  /** 
   * Displays an alert in the Google Sheets window.
   * @param {string} message Text to display in alert window. 
   */ 
  displayAlert(message){
    this.Ui.alert(message);
  };  
};

/** 
 * Displays the program's 'About' text in the Google Sheets window.
 */ 
function displayAboutText(){
  let _UIFunctions = new UIClass;
  let aboutText = "Code written by Luis DaSilva in 2022. See my website at www.luisdasilva.net for more content!" +
    "More also available on my Github at https://github.com/luisdasilva-contact."
  _UIFunctions.displayAlert(aboutText);
};
