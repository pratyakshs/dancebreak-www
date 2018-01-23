<!-- Hide script from old browsers (until "TO HERE").



/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////  NOTE to Dancebreak webmasters:  if you are just      /////
/////  trying to add new location entries, edit             /////
/////  timetableTables.js instead, and NOT THIS FILE!       /////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////
// NOTE:  this file is meant to be *included* in HTML files.
// There are 2 uses:  for pages displaying future events, and for
// ones displaying past events:
//
// 1.  Future events.  Use something like this in the HTML file:
//
//      [... in the <head> portion ...]
//      <script src="timetableTables.js"></script>
//      <script src="timetableCode.js"></script>
//      <script>TimetableCode.preprocessEventsData();</script>
//
//      [... in the <body> portion ...]
//      <script>TimetableCode.appendNextEventSite('home_textContent');</script>
//      <script>TimetableCode.appendFutureEventsTable(
//         'home_textContent',
//         '<p>Separator <a href="https://url.url.url/">line</a> <em>text</em></p>');</script>
//
// 2.  Past events.  Use something like this in the HTML file:
//
//      [... in the <head> portion ...]
//      <script src="timetableTables.js"></script>
//      <script src="timetableCode.js"></script>
//      <script>TimetableCode.preprocessEventsData();</script>
//
//      [... in the <body> portion ...]
//      <script>TimetableCode.appendPastEventsTable(
//         'oldLocations_textContent');</script>
//
// It requires a public variable, TimetableTables, which contains
// a public 2-dimensional array, allLocations.  This is provided
// by timetableTables.js, which is why in the above examples it
// is shown included before this file.
/////////////////////////////////////////////////////////////////

//---------------------------------------------------------------
//---------------------------------------------------------------
//---------------------------------------------------------------

/////////////////////////////////////////////////////////////////
// NOTE:  the enclosing "(function () { ... }());" bit is an
// anonymous function construct, and creates a "closure," which
// provides privacy and state (i.e. a traditional class).  This
// ensures that the variable and function names won't clash with
// any outside this file (admittedly, a very unlikely scenario).
var TimetableCode = (function () {
   // Make "my" an internal reference to this class.
   var my = {};

   //////////////////////////////////////////////////////////////
   // Private variables.
   //
   // Note:  the variables above this section are also private.
   //////////////////////////////////////////////////////////////
   const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'
   ];
   const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November',
      'December'
   ];
   const noFuturesMessage =
      '<em>No (upcoming) sessions yet. Check back again!</em>';
   const separatorStyle = '1pt solid #fff';
   // dateToday will be used for comparisons with dates in the
   // locations table while generating the table.  The time
   // component is set to midnight, so that effectively only
   // dates are compared.
   var dateToday = new Date();
   dateToday.setHours(0,0,0,0);

   //////////////////////////////////////////////////////////////
   // Private functions.
   //////////////////////////////////////////////////////////////
   /**
    * Return a date object created from the supplied date
    * string, which is modified to work under Safari (which
    * does not understand "<year> <month> <date>" but does
    * understand the reverse.  (Problem and solution verified
    * under Safari 11.0 [OS 10.12.6] and iOS 10.3.3.)  The Date
    * object contructor works under other browsers, for both
    * formats.  For various reasons "<year> <month> <date>" is
    * preferred in the location arrays (e.g. easier to visually
    * check entry sorting).
    * @param {string} dateString The "Y M D" date string.
    * @return {Date} Date object based on the passed date string.
    */
   function createDateObjCrossBrowser(dateString) {
      // NOTE:  assume dateString consists of 3 space-separated
      // substrings, the year, month, and date.
      //
      // Reverse the ordering of the 3 substrings for Safari.
      reversedOrder = dateString.split(' ').reverse().join(' ');
      return new Date(reversedOrder);
   };

   /**
    * Return an element containing the provided content, which
    * can be either text or HTML, and which is parsed into
    * appropriate element(s).  This element should allow all
    * browsers to safely handle the contents.  This is a solution
    * primarily for Internet Explorer, for which this has been a
    * perennial problem:
    *      https://www.google.com/search?q=javascript+innerhtml+not+working+internet+explorer
    * @param {string} htmlText The cell's contents.
    * @return {Element} The generated element object containing
    *    the provided content.
    */
   function createSafeCellContent(htmlText) {
      // Create a <div> to hold the parsed/generated elements
      // from htmlText.  Internet Explorer can barf if a <td>
      // element's innerHTML is directly updated.  But it
      // *should* be fine when doing so to <div>s.
      var cellDiv = document.createElement('div');
      cellDiv.innerHTML = htmlText;
      return cellDiv;
   };

   /**
    * Return a table body cell object ("td") containing the
    * provided content, which can be either text or HTML, and
    * which is parsed into appropriate element(s).  The contents
    * are subject to "strikeout" if requested.
    * @param {string} htmlText The cell's contents.
    * @param {boolean=} doStrikeOut Whether to apply strikeout to
    *    the cell's contents.  [Default: false]
    * @return {Element} The generated table cell ("td") object
    *    containing the provided content.
    */
   function createSafeCellElement(
         htmlText, doStrikeOut = false) {
      var cellContent = createSafeCellContent(htmlText);
      if (doStrikeOut) {
         // Strikeout the cell's contents.
         var strikeoutElem = document.createElement('s');
         strikeoutElem.appendChild(cellContent);
         cellContent = strikeoutElem;
      }

      var cellElem = document.createElement('td');
      cellElem.appendChild(cellContent)
      return cellElem;
   };

   /**
    * Return an integer reflecting a comparison between the
    * passed date objects in the manner of strcmp(3), namely:
    *  - <0 if dateX < dateY
    *  - ==0 if dateX == dateY
    *  - >0 if dateX > dateY
    * @param {Date} dateObjX The lefthand side operand.
    * @param {Date} dateObjY The righthand side operand.
    * @return {number} The comparison between the 2 date objects.
    */
   function dateObjectCompare(dateObjX, dateObjY) {
      return dateObjX.valueOf() - dateObjY.valueOf()
   };

   /**
    * Return a 3-column row intended to be a table's header, and
    * which will contain a horizontal line underneath.
    * @param {Element} tableBody Object which is a table's body
    *    ("tbody") element object.
    * @return {Element} The generated table row ("tr") object
    *    that is the table's header.
    */
   function generateHeader() {
      var tableHeader = document.createElement('tr');
      tableHeader.style.borderBottom = separatorStyle;

      var col1 = document.createElement('td');
      col1.appendChild(document.createTextNode('Date'));
      var col2 = document.createElement('td');
      col2.appendChild(document.createTextNode('Location (Map)'));
      var col3 = document.createElement('td');
      col3.appendChild(document.createTextNode('Notes'));
      tableHeader.appendChild(col1);
      tableHeader.appendChild(col2);
      tableHeader.appendChild(col3);

      return tableHeader;
   };

   /**
    * Returns a table body row object ("tr") consisting of a
    * single cell containing the provided "empty table" content
    * (which can be plain text or HTML).
    * @param {string} emptyCellContents The text/HTML that is to
    *    be the cell contents of the generated row.
    * @return {Element} The generated table row ("tr") object
    *    that is the "empty table" row.
    */
   function generateEmptyTableRow(emptyCellContents) {
      var emptyTableCell = createSafeCellElement(
         emptyCellContents);
      emptyTableCell.colSpan = 3;
      emptyTableCell.style = 'text-align:left';

      var emptyTableRow = document.createElement('tr');
      emptyTableRow.appendChild(emptyTableCell);
      return emptyTableRow;
   };

   /**
    * Returns a table body row object ("tr") created from the
    * passed row data, an array of 3 strings consisting of:
    *  - date (no time, or time is set to midnight)
    *  - location
    *  - notes
    * All 3 strings must be present.  They should be empty ('')
    * if the generated cell is to be empty.  They may include
    * HTML markup tags, though these should be simple ones (font,
    * links); otherwise, the table may not be properly rendered
    * on certain browsers (mainly, older Internet Explorers).
    * @param {!Array<string>} rowData The row's data.
    * @param {boolean=} strikeoutRow Whether to apply strikeout
    *    to all cells in the row.  [Default: false]
    * @return {Element} The generated row ("tr") element object.
    */
   function generateEntryRow(rowData, strikeoutRow = false) {
      var rowElem = document.createElement('tr');

      var dateRow = createDateObjCrossBrowser(rowData[0]);
      rowElem.appendChild(createSafeCellElement(
         dateRow.getFullYear() + ' ' +
            getShortName(monthNames[dateRow.getMonth()]) + ' ' +
            dateRow.getDate() + ' ' +
            '(' + getShortName(dayNames[dateRow.getDay()]) + ')',
         strikeoutRow));
      rowElem.appendChild(createSafeCellElement(
         rowData[1], strikeoutRow));
      rowElem.appendChild(createSafeCellElement(
         rowData[2], strikeoutRow));

      return rowElem;
   };

   /**
    * Returns a table body row object ("tr") consisting of a
    * single cell containing the provided separator content
    * (which can be plain text or HTML), enclosed in a box.
    * @param {!Array<string>} rowData The row's data.
    * @return {Element} The generated table row ("tr") object
    *    that is the separator row.
    */
   function generateSeparatorRow(separatorContent) {
      var separatorRow = document.createElement('tr');
      separatorRow.style.borderBottom = separatorStyle;
      separatorRow.style.borderLeft = separatorStyle;
      separatorRow.style.borderRight = separatorStyle;
      separatorRow.style.borderTop = separatorStyle;

      var separatorCell = createSafeCellElement(
         separatorContent);
      separatorCell.colSpan = 3;
      separatorCell.style = 'text-align:left';
      separatorRow.appendChild(separatorCell);

      return separatorRow;
   };

   /**
    * Return the 3-letter prefix "short" version of the provided
    * name, which is assumed to be either a month or weekday name
    * (for which 3-letter prefix is the short version).
    * @param {string} longName The month/weekday name.
    * @return {string} The 3-letter prefix "short" name.
    */
   function getShortName(longName) {
      return longName.substring(0,3);
   };

   //////////////////////////////////////////////////////////////
   // Public variables and functions.
   //////////////////////////////////////////////////////////////

   //------------------------------------------------------------
   // These variables support the generation of events
   // information.  There are 3:  the next upcoming event, a
   // "future events" table, and a "past events" table.  The
   // first is the earliest chronological event occurring on or
   // after today.  The "future events" table consists of all
   // events ocurring on or after the start date provided to the
   // data preprocessor function, preprocessEventsData().  The
   // "past events" table consists of all events occuring
   // strictly before the aforementioned start date.
   //
   // The following 3 variables are set by the date preprocessor
   // function, preprocessEventsData().  The first two determine
   // the following subsets of events:
   // - 0...pastStartIdx-1 : "past events"
   // - pastStartIdx...pastEndIdx-1 : "future events" recent past
   // - pastEndIdx : next upcoming event
   // - pastEndIdx... : "future events" upcoming
   my.pastStartIdx = -1;
   my.pastEndIdx = -1;
   my.indicesAreValid = false;
   //------------------------------------------------------------

   /**
    * Process the events in the allLocations array so that
    * information regarding it can be subsequently generated.
    * Only events starting on or after the provided start date
    * will be used.
    * @param {string} startDate The date the table begins.
    */
   my.preprocessEventsData = function (
         startDate = TimetableTables.thisQuarterStart) {
      var startDateObj = createDateObjCrossBrowser(startDate);
      // Determine past (before startDate) events first.  This
      // sets my.pastStartIdx.
      for (my.pastStartIdx = 0;
              my.pastStartIdx < TimetableTables.allLocations.length;
              ++my.pastStartIdx) {
         var pastDate = createDateObjCrossBrowser(
            TimetableTables.allLocations[my.pastStartIdx][0]);
         if (dateObjectCompare(pastDate, startDateObj) >= 0) {
            break;
         }
      }
      // Now determine the upcoming events (which also determines
      // the recent-past events).  This sets my.pastEndIdx.
      for (my.pastEndIdx = my.pastStartIdx;
           my.pastEndIdx < TimetableTables.allLocations.length;
           ++my.pastEndIdx) {
         var recentDate = createDateObjCrossBrowser(
            TimetableTables.allLocations[my.pastEndIdx][0]);
         if (dateObjectCompare(recentDate, dateToday) >= 0) {
            break;
         }
      }

      // Make it okay to obtain future-events information.
      my.indicesAreValid = true;
   };

   /**
    * Create a "future events" table, and append it to the div
    * element whose ID is provided.  The table will consist of 4
    * parts:  a header (column labels), upcoming events (starting
    * from today), a separator row (consisting of the supplied
    * separator contents), and events of the recent past.  (See
    * header comments for my.past*Idx for what specific events
    * are used.)
    * @param {string} divId ID of the <div> element to which the
    *    generated table will be appended.
    * @param {string} separator The text/HTML that the separator
    *    row will contain.
    */
   my.appendFutureEventsTable = function (divId, separator) {
      // The indices must already be set.
      if (!my.indicesAreValid) {
         console.log(
            'preprocessEventsData() was not run before ' +
            'appendFutureEventsTable() was called.');
         return;
      }

      // Create the table's body first.
      var tableBody = document.createElement('tbody');
      tableBody.appendChild(generateHeader());

      // Generate table rows.
      if (my.pastEndIdx == TimetableTables.allLocations.length) {
         tableBody.appendChild(generateEmptyTableRow(
            '<p>' + noFuturesMessage + '</p>'));
      } else {
         for (var jj = my.pastEndIdx;
              jj < TimetableTables.allLocations.length;
              ++jj) {
            tableBody.appendChild(
               generateEntryRow(
                  TimetableTables.allLocations[jj]));
         }
      }
      tableBody.appendChild(generateSeparatorRow(separator));
      // Note:  strikeout is applied to all (recent) past events
      // in the future events table.
      if (my.pastStartIdx < my.pastEndIdx) {
         // The last row has a different style from the rest.
         var kkLast = my.pastEndIdx - 1;
         for (var kk = my.pastStartIdx; kk < kkLast; ++kk) {
            tableBody.appendChild(
               generateEntryRow(TimetableTables.allLocations[kk],
                  true));
         }
         // The bottom row is underlined.
         var bottomRow =
            generateEntryRow(
               TimetableTables.allLocations[kkLast],
               true);
         bottomRow.style.borderBottom = separatorStyle;
         tableBody.appendChild(bottomRow);
      }

      // Create the containing table object.
      var table = document.createElement('table');
      table.style.borderCollapse = 'collapse';
      table.appendChild(tableBody);

      // Append the table to the <div> object.
      var theDiv = document.getElementById(divId);
      theDiv.appendChild(table);
   };

   /**
    * Create an "upcoming event" string, and append it to the div
    * element whose ID is provided.  The string will consist of
    * the location and the date (in parentheses).
    * @param {string} divId ID of the <div> element to which the
    *    generated string will be appended.
    */
   my.appendNextEventSite = function (divId) {
      // The indices must already be set.
      if (!my.indicesAreValid) {
         console.log(
            'preprocessEventsData() was not run before ' +
            'appendNextEventSite() was called.');
         return;
      }

      var nextSite = '<p>Where: ';
      if (my.pastEndIdx == TimetableTables.allLocations.length) {
         nextSite += noFuturesMessage;
      } else {
         nextSite += TimetableTables.allLocations[my.pastEndIdx][1];
         var nextDate = createDateObjCrossBrowser(
            TimetableTables.allLocations[my.pastEndIdx][0]);
         nextSite +=
            ' (<em>' + nextDate.getFullYear() + ' ' +
            monthNames[nextDate.getMonth()] + ' ' +
            nextDate.getDate() + ', ' +
            dayNames[nextDate.getDay()] + '</em>)';
      }
      nextSite += '</p>';

      var upcomingEventElem = createSafeCellContent(nextSite);

      // Append the table to the <div> object.
      var theDiv = document.getElementById(divId);
      theDiv.appendChild(upcomingEventElem);
   };

   /**
    * Create a "past events" table, and append it to the div
    * element whose ID is provided.  The table will consist of 2
    * parts:  a header (column labels), and past events.  (See
    * header comments for my.past*Idx for what specific events
    * are used.)
    * @param {string} divId ID of the <div> element to which the
    *    generated table will be appended.
    */
   my.appendPastEventsTable = function (divId) {
      // The indices must already be set.
      if (!my.indicesAreValid) {
         console.log(
            'preprocessEventsData() was not run before ' +
            'appendPastEventsTable() was called.');
         return;
      }

      // Create the table's body first.
      var tableBody = document.createElement('tbody');
      tableBody.appendChild(generateHeader());

      const emptyTableText =
         '<p><em>No past sessions.</em></p>';
      if (my.pastStartIdx == 0) {
         tableBody.appendChild(generateEmptyTableRow(
             emptyTableText));
      } else {
         // The last row has a different style from the rest.
         for (var jj = my.pastStartIdx - 1; jj > 0; --jj) {
            tableBody.appendChild(
               generateEntryRow(
                  TimetableTables.allLocations[jj]));
         }
         // The bottom row is underlined.
         var bottomRow =
            generateEntryRow(TimetableTables.allLocations[0]);
         bottomRow.style.borderBottom = separatorStyle;
         tableBody.appendChild(bottomRow);
      }

      // Create the containing table object.
      var table = document.createElement('table');
      table.style.borderCollapse = 'collapse';
      table.appendChild(tableBody);

      // Append the table to the <div> object.
      var theDiv = document.getElementById(divId);
      theDiv.appendChild(table);
   };

   //////////////////////////////////////////////////////////////
   // Export everything above within a class object.
   //////////////////////////////////////////////////////////////
   return my;
}());

// End hiding script from old browsers (TO HERE). -->
