<!-- Hide script from old browsers (until "TO HERE").

/////////////////////////////////////////////////////////////////
// To add new locations, find the locations_<year> 2-dimensional
// array for the appropriate year, and add the entry based on the
// entry date.  Maintain chronological ordering, or else tables
// will be incorrectly generated.  (If necessary, create new
// here_..., notes_..., and site_... constants.)
//
// Note:  if you create a new locations_<year> 2-dimensional
// array for a new year, be sure to add an entry for it in the
// "combined" allLocations 2-dimensional array.
//
// At the start of each quarter, update thisQuarterStart to the
// first day of the current quarter.
//
//  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
//
// No other modification to this file should be necessary!
//
//  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
//
// For details on how to use this file and its contents
// (particularly, within HTML files), see the header comments in
// file timetableCode.js.
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
var TimetableTables = (function () {
   // Make "my" an internal reference to this class.
   var my = {};

   //////////////////////////////////////////////////////////////
   // Private constants and variables.
   //////////////////////////////////////////////////////////////

   //////////////////////////////////////////////////////////////
   // Constants for location/map and note components of entries.
   const here_AOERCLot =
      '<a href="https://goo.gl/maps/eZ6Y9GaEZgF2" ' +
         'target="_blank">here</a>';
   const here_EVCenterLot =
      '<a href="https://goo.gl/maps/nxwTaR2bNV22" ' +
         'target="_blank">here</a>';
   const here_HaciendaCommonsLot =
      '<a href="http://g.co/maps/ehfkw"' +
         'target="_blank">here</a>';
   const here_HaciendaCommonsLotOld =
      '<a href="https://goo.gl/maps/NcjrFCVGads" ' +
         'target="_blank">here</a>'
   const here_RobleFieldGarage =
      '<a href="https://goo.gl/maps/8o5T13upVWm" ' +
         'target="_blank">here</a>';
   const here_RunningFarmLaneLot =
      '<a href="https://goo.gl/maps/uRW5zBBRPcM2" ' +
         'target="_blank">here</a>';
   const here_SearsvilleLot =
      '<a href="https://goo.gl/maps/EHsDkpgM65L2" ' +
         'target="_blank">here</a>';
   const here_TresidderLot =
      '<a href="https://goo.gl/maps/qDCNNTwWR612" ' +
         'target="_blank">here</a>';
   //------------------------------------------------------------
   const notes_NONE = '';
   //  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
   const notes_ParkingAOERC =
      'Parking: ' + here_RobleFieldGarage + ' or ' +
         here_AOERCLot;
   const notes_ParkingEPC =
      'Parking: ' + here_RobleFieldGarage + ', ' +
         here_AOERCLot + ' or ' + here_SearsvilleLot;
   const notes_ParkingEPCOld =
      'Parking: ' + here_SearsvilleLot + ' or ' + here_AOERCLot;
   const notes_ParkingGCCHavanaRoom =
      'Parking: ' + here_RunningFarmLaneLot + ' or ' +
         here_HaciendaCommonsLot;
   const notes_ParkingKennedyCommons =
      'Parking: ' + here_EVCenterLot + ' or ' +
      here_HaciendaCommonsLotOld;
   const notes_ParkingRobleGym =
      'Parking: ' + here_RobleFieldGarage;
   const notes_ParkingWhitePlaza =
      'Parking: ' + here_TresidderLot;
   //  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
   const notes_BreakSpring = 'Spring break';
   const notes_BreakSummer = 'Summer break';
   const notes_BreakThanksgiving = 'Thanksgiving break';
   const notes_BreakWinter = 'Winter break';
   const notes_FinalsWeek = 'Finals week special:<br>';
   //  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
   const notes_Warn10pmStartTime =
      '<span class="red">Later start:  10pm!</span>';
   //------------------------------------------------------------
   const site_TBD = 'TBD';
   //  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
   const site_RobleGymBigStudio =
      '<a href="http://goo.gl/YelGJQ" ' +
         'target="_blank">Roble Gym</a>, Big Studio/R113';
   //  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---  ---
   const site_WarnSessionCancelled =
      '<span class="red"><em>Session cancelled</em></span>';
   //////////////////////////////////////////////////////////////
   // Location entries consist of arrays of 3 components (all
   // strings):  the date, the location/map, and optional notes.
   // (If there are no notes, then use notes_NONE.)  HTML may be
   // used in any and all fields -- for example, "<em>" -- but
   // constructs beyond simple markup tags may not necessarily be
   // supported in all browsers.
   var locations_2018 = [
      ['2018 Jan 1', site_WarnSessionCancelled, notes_BreakWinter],
      ['2018 Jan 8', site_RobleGymBigStudio, notes_NONE],
      [
         '2018 Jan 15',
         site_WarnSessionCancelled,
         'Martin Luther King Jr. Day'
      ],
      ['2018 Jan 22', site_RobleGymBigStudio, notes_Warn10pmStartTime],
      ['2018 Jan 29', site_RobleGymBigStudio, notes_NONE],
      ['2018 Feb 5', site_RobleGymBigStudio, notes_NONE],
      ['2018 Feb 12', site_RobleGymBigStudio, notes_NONE],
      [
         '2018 Feb 19',
         site_WarnSessionCancelled,
         'President\'s Day'
      ],
      ['2018 Feb 26', site_RobleGymBigStudio, notes_NONE],
      ['2018 Mar 5', site_RobleGymBigStudio, notes_NONE],
      ['2018 Mar 12', site_RobleGymBigStudio, notes_NONE],
      ['2018 Mar 19', site_RobleGymBigStudio, notes_NONE],
      ['2018 Mar 26', site_WarnSessionCancelled, notes_BreakSpring]
   ];
   var locations_2017 = [
      ['2017 Sep 25', site_RobleGymBigStudio, notes_NONE],
      ['2017 Oct 2', site_RobleGymBigStudio, notes_NONE],
      ['2017 Oct 9', site_RobleGymBigStudio, notes_NONE],
      ['2017 Oct 16', site_RobleGymBigStudio, notes_NONE],
      ['2017 Oct 23', site_RobleGymBigStudio, notes_NONE],
      ['2017 Oct 30', site_RobleGymBigStudio, notes_NONE],
      ['2017 Nov 6', site_RobleGymBigStudio, notes_NONE],
      ['2017 Nov 13', site_RobleGymBigStudio, notes_NONE],
      ['2017 Nov 20', site_WarnSessionCancelled, notes_BreakThanksgiving],
      ['2017 Nov 28', site_RobleGymBigStudio, notes_NONE],
      ['2017 Dec 4', site_RobleGymBigStudio, notes_NONE],
      [
         '2017 Dec 12',
         site_RobleGymBigStudio,
         notes_FinalsWeek + '<span class="red">2-4pm</span>'
      ],
      ['2017 Dec 17', site_WarnSessionCancelled, notes_BreakWinter],
      ['2017 Dec 24', site_WarnSessionCancelled, notes_BreakWinter]
   ];

   //////////////////////////////////////////////////////////////
   // Public variables.
   //////////////////////////////////////////////////////////////

   //------------------------------------------------------------
   // The combined array of all the other location arrays.
   my.allLocations = locations_2017.concat(
      locations_2018
   );
   //------------------------------------------------------------
   // The start date for the current quarter, used as the default
   // value for TimetableCode.preprocessEventsData().
   //
   // Setting this variable to the first date of the current
   // quarter permits all normal date-related updates to occur in
   // just this file (and, in particular, *not* in index.html and
   // oldLocatios.html).
   my.thisQuarterStart = '2018 Jan 8'
   //------------------------------------------------------------

   //////////////////////////////////////////////////////////////
   // Export everything above within a class object.
   //////////////////////////////////////////////////////////////
   return my;
}());

// End hiding script from old browsers (TO HERE). -->
