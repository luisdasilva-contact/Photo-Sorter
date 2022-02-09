/**
 * Upon opening the spreadsheet, a menu tab for the program is created. It contains three buttons: one 
   to check the user's library for media items in more than one album, one to check the user's library
   for media items that are not in an album, and one containing text about the program.
 * @param {event} e Event object containing context on the program's opening.
 */
function onOpen(e){  
  let UIFunctions = new UIClass;
  UIFunctions.intializeMenu();
};

/**
 * Writes an array of strings on a row-per-row basis in Google Sheets.  
 * @param {Array<string>} itemArray 2D Array of strings to write to the active sheet. First level represents
    rows, second level represents columns.
 * @param {boolean=} boldFirstLine Optional boolean for whether or not the first line should be bolded. Default
     is true. 
 * @param {integer=} startingColumnNo Optional integer representing the column to begin with
    (i.e. column E would be 5). Default value is 1.
 * @param {Sheet=} sheetToWriteTo Optional Sheet object from Google Sheet's API. Represents the
    sheet that will be written to. If blank, writes to the active sheet.
 */
function write2DArrayToSheet(itemArray, boldFirstLine = true, startingColumnNo = 1, 
  sheetToWriteTo = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()){ 
    for (let item in itemArray){
      let rowToWrite = sheetToWriteTo.getLastRow() + 1;
      let columnIterable = startingColumnNo;
      let arrayLvl1 = itemArray[item];
      
      for (let arrayLvl2 of arrayLvl1){
        sheetToWriteTo.getRange(rowToWrite, columnIterable).setValue(arrayLvl2);
      
        if ((item == 0) && (boldFirstLine)){
          sheetToWriteTo.getRange(rowToWrite, columnIterable).setFontWeight("bold");
        };
        
        columnIterable += 1;
      };

      rowToWrite += 1;
    };
};

/**
 * For a user's Google Photos library, compares a list of all media items (retrieved with the 
    API's mediaItems.list function) to all media items with at least one album. Returns a list
    of all media items that are isolated, meaning they are without any associated album.    
 * @return {Array<mediaItem>} Array of mediaItems that are isolated.
 */
function checkForNotInAlbum(){
  let mediaNotInAlbum = [];
  const allMediaItems = Array.from(PhotoApp.getMediaItemList());
  const mediaItemsInAlbums = getAllMediaInAlbums();

  if (mediaItemsInAlbums.length === 0){
    return [];
  };

  // Pulling mediaItems not in any albums by finding unique values between both lists 
  const allMediaItemsIds = allMediaItems.map(mediaItem => mediaItem.id);
  const mediaItemsInAlbumsIds = mediaItemsInAlbums.map(mediaItemInAlbum => mediaItemInAlbum.id);
  const uniqueToAllMediaItemsIDs = allMediaItemsIds.filter((id) => mediaItemsInAlbumsIds.indexOf(id) === -1);

  //  Running in batches according to BATCH_CALL_CAP const. Default value of 50 almost always results in errors
  // due to overly-long URLs in API call.
  const batchRunCap = 15;
  const timesToRun = Math.ceil(uniqueToAllMediaItemsIDs.length/batchRunCap);
  const lastRoundNumber = uniqueToAllMediaItemsIDs.length % batchRunCap; 

  let innerIteration = 0;
  let innerIterCap = batchRunCap;  

  for (let i = 0; i < timesToRun; i++){
    let arrayForBatchCall = [];  
    if ((timesToRun - 1) === i){
      innerIterCap = innerIteration + lastRoundNumber;
      
      for (let j = innerIteration; j < innerIterCap; j++ ){
        arrayForBatchCall.push(uniqueToAllMediaItemsIDs[j]);
      }

      mediaNotInAlbum.push(PhotoApp.getMediaItems({mediaItemIds: arrayForBatchCall}));
    } else {   
      for (let j = innerIteration; j < innerIterCap; j++){
        arrayForBatchCall.push(uniqueToAllMediaItemsIDs[j]);
      }

      mediaNotInAlbum.push(PhotoApp.getMediaItems({mediaItemIds: arrayForBatchCall}));

      innerIteration += batchRunCap;
      innerIterCap += batchRunCap;    
    };
  };

  // unpacking batchGets into a standard array of mediaItems
  let isolatedMediaItems = [];

  for (let i in mediaNotInAlbum){
    for (let j in mediaNotInAlbum[i].mediaItemResults){
      isolatedMediaItems.push(mediaNotInAlbum[i].mediaItemResults[j].mediaItem);
    };
  };

  return isolatedMediaItems;
};

/**
 * Retrieves all mediaItems that are in at least 1 album.
 * @return {Array<mediaItem>} mediaItems in at least 1 album.
 */
function getAllMediaInAlbums(){
  const albumList = Array.from(PhotoApp.getAlbumList({excludeNonAppCreatedData: false}));
  const albumListCallRaw = Array.from(albumList.map(album => PhotoApp.searchMediaItems({"albumId": album.id}).next().value))
  const mediaItemsInAlbum = albumListCallRaw.filter(album => album !==undefined)
  return mediaItemsInAlbum;
};

/**
 * Retrieves all mediaItems that are in at least 1 album, including its related album.
 * @return {Array<Object>} Object with 2 properties: a mediaItem, and the album it was found in.
 */
function getAllMediaInAlbumsIncAlbumInfo(){
  const albumList = Array.from(PhotoApp.getAlbumList({excludeNonAppCreatedData: false}));
  let mediaItemsInAlbumsRaw = [];

  for (let i in albumList){    
    let albumId = albumList[i].id;
    let mediaItem = Array.from(PhotoApp.searchMediaItems({"albumId": albumId}));
    
    for (let j in mediaItem){
      let mediaItemAlbumPair = {};
      mediaItemAlbumPair.album = albumList[i];
      mediaItemAlbumPair.mediaItem = mediaItem[j];
      mediaItemsInAlbumsRaw.push(mediaItemAlbumPair);
    };
  };
  
  const allMediaInAlbumsIncAlbumInfo = mediaItemsInAlbumsRaw.filter(mediaItem => mediaItem.album.id !==undefined)
  return allMediaInAlbumsIncAlbumInfo;
};

/**
 * Executes a series of functions to find all media (photos, videos) in a user's Google Photos library
 * that is not in an album. Then writes the file name and product URL to a new sheet titled
 * "All Isolated Media".
 */
function writeIsolatedMediaToSheet(){
  const isolatedMedia = checkForNotInAlbum();
  const SHEET_HEADER = ["File Name", "Product URL"];

  if (isolatedMedia.length === 0){
    let UIFunctions = new UIClass;
    UIFunctions.displayAlert("None of your library items are in a folder.");
    return;
  };

  let arrayToWrite = [];
  for (let media of isolatedMedia){
    let innerVar = [];
    innerVar.push(media.productUrl);    
    innerVar.push(media.filename);
    arrayToWrite.push(innerVar);
  };

  arrayToWrite.splice(0, 0, SHEET_HEADER);  
  write2DArrayToSheet(arrayToWrite);  
};

/**
 * Executes a series of functions to find all media (photos, videos) in a user's Google Photos library
 * that is in more than 1 album. Then writes the product Url, album title, and filename to the active sheet.
 */
function checkLibraryForDuplicates(){  
  const SHEET_HEADER = ["Product URL", "Album Title", "File Name"];
  const libraryItems = getAllMediaInAlbumsIncAlbumInfo();
  let dupeIDCheck = [];
  let dupeIDCheckCorrespondingItem = [];
  let confirmedDupes = [];
  
  for (let i in libraryItems){
    let mediaItemId = libraryItems[i].mediaItem.id;
    dupeIDCheck.push(mediaItemId);
    dupeIDCheckCorrespondingItem.push(libraryItems[i]);
    
    // checking if i > 0 to prevent dupe check from catching the first item entered
    if ((i > 0) && (dupeIDCheck.includes(mediaItemId))){
      confirmedDupes.push(dupeIDCheckCorrespondingItem[i]) 
      
      let ToPush = libraryItems.find(obj => {
        return obj.mediaItem.id === mediaItemId;
      });

      // checking productUrl to ensure the same item isn't written twice
      if (!confirmedDupes.some(e => e.mediaItem.productUrl === ToPush.mediaItem.productUrl)){
        confirmedDupes.push(ToPush);  
      };      
    };
  };

  let arrayToWrite = [];

  for (let dupe of confirmedDupes){
    let tempArray = [];
    tempArray.push(dupe.mediaItem.productUrl);
    tempArray.push(dupe.album.title);
    tempArray.push(dupe.mediaItem.filename);
    arrayToWrite.push(tempArray);
  };

  if (arrayToWrite){
    arrayToWrite.splice(0, 0, SHEET_HEADER);
  };
  
  write2DArrayToSheet(arrayToWrite);
};
