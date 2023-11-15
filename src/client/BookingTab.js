/* global smartoffice, common, assertNamespace, setInterval */

assertNamespace('smartoffice');

smartoffice.BookingTab = function BookingTab(bus, cssSelector) {
   const POLLING_INTERVAL_IN_MS = 5000;

   var thisInstance = this;
   var initialized  = false;
   var lastReceivedBookingList;
   var lastReceivedWorkspaceList;
   var username;
   var config;
   
   var addLeadingZeros = function addLeadingZeros(input, length) {
      var text = '' + input;
      for (var i = text.length; i < length; i++) {
        text = '0' + text;
      }
      return text;
   };
   
   var getStringForDateTimeSelect = function getStringForDateTimeSelect(date) {
      return date.getFullYear() + '-' +
         addLeadingZeros(date.getMonth() + 1, 2) + '-' +
         addLeadingZeros(date.getDate(), 2) + 'T' +
         addLeadingZeros(date.getHours(), 2) + ':' +
         addLeadingZeros(date.getMinutes(), 2);  
   };
   
   var getDateTime = function getDateTime(selector) {
      var inputWidget = ($(selector) || [])[0];
      var value       = (inputWidget || {}).value; 
      const regex     = /^[0-9]+-[0-9]+-[0-9]+T[0-9]+:[0-9]+$/;
      if (!value.match(regex)) {
         return undefined;
      }
      return (new Date(value)).toISOString();
   };

   var getStartDateTime = function getStartDateTime() {
      return getDateTime(cssSelector + ' #startDateTime');
   };

   var getEndDateTime = function getEndDateTime() {
      return getDateTime(cssSelector + ' #endDateTime');
   };

   var overlaps = function overlaps(start, end, booking) {
      var startInMs        = (new Date(start)).getTime();
      var endInMs          = (new Date(end)).getTime();
      var bookingStartInMs = (new Date(booking.startDateTime)).getTime();
      var bookingEndInMs   = (new Date(booking.endDateTime)).getTime();
      var noOverlap        = (endInMs <= bookingStartInMs) || (startInMs >= bookingEndInMs);
      return !noOverlap;
   };

   var updateAvailableWorkspaces = function updateAvailableWorkspaces() {
      var start = getStartDateTime();
      var end   = getEndDateTime();
      
      if (!lastReceivedWorkspaceList || !start || !end) {
         return;
      }

      var workspaceNumbers = [];
      
      if (lastReceivedBookingList && (start < end)) {
         workspaceNumbers = lastReceivedWorkspaceList.map(workspace => workspace.workspaceNumber);
      
         lastReceivedBookingList.forEach(booking => {
            if (overlaps(start, end, booking)) {
               workspaceNumbers = workspaceNumbers.filter(workspaceNr => workspaceNr !== booking.workspaceNumber);
            }
         });
      }

      var itemHtml   = '';
      workspaceNumbers.forEach(workspaceNumber => {
         if (workspaceNumber) {
            itemHtml += '<option value="' + workspaceNumber + '">' + workspaceNumber + '</option>';
         }
      });
      
      $(cssSelector + ' #availableWorkspaceSelect').html(itemHtml);
   };

   var onWorkspaceListReceived = function onWorkspaceListReceived(workspaceList) {
      lastReceivedWorkspaceList = workspaceList;
      updateAvailableWorkspaces();
   };
   
   var pollWorkspaceList = function pollWorkspaceList() {
      thisInstance.pollJsonData(config.apiGatewayBaseUrl + '/workspace', onWorkspaceListReceived);
   };

   var updateExistingBookingsWidget = function updateExistingBookingsWidget() {
      var itemHtml   = '';
      (lastReceivedBookingList || []).forEach(booking => {
         if (booking.userName === username) {
            var start = getStringForDateTimeSelect(new Date(booking.startDateTime));
            var end   = getStringForDateTimeSelect(new Date(booking.endDateTime));
            itemHtml += '<option value="' + booking.bookingNumber + '">' + start.replace('T', ' ') + ' (' + booking.workspaceNumber + ')</option>';
         }
      });

      $(cssSelector + ' #existingBookings').html(itemHtml);
   };

   var onBookingListReceived = function onBookingListReceived(bookingList) {
      lastReceivedBookingList = bookingList;

      if (!username) {
         return;
      }

      updateExistingBookingsWidget();
      updateAvailableWorkspaces();
   };

   var pollBookingList = function pollBookingList() {
      thisInstance.pollJsonData(config.apiGatewayBaseUrl + '/booking',   onBookingListReceived);
   };
   
   var pollBookingListPeriodically = function pollBookingListPeriodically() {
      pollBookingList();
      setInterval(pollBookingList, POLLING_INTERVAL_IN_MS);
   };

   var getWorkspaceNumber = function getWorkspaceNumber() {
      var worspaceSelectWidget = ($('#availableWorkspaceSelect') || [])[0];
      return (worspaceSelectWidget || {}).value;
   };

   var bookWorkspace = function bookWorkspace() {
      var workspaceNumber = getWorkspaceNumber();
      var startDateTime   = getStartDateTime();
      var endDateTime     = getEndDateTime();
      if (!workspaceNumber || !startDateTime || !endDateTime) {
         return;
      }

      var objectToPost = {
         workspaceNumber: workspaceNumber,
         startDateTime  : startDateTime,
         endDateTime    : endDateTime
      };

      smartoffice.http.postObjectInBody(config.apiGatewayBaseUrl + '/booking', objectToPost)
         .then(pollBookingList)
         .catch(err => console.log('failed to book workspace (' + workspaceNumber + '): ' + err));
   };

   var deleteBooking = function deleteBooking() {
      var selectWidget = (($(cssSelector + ' #existingBookings') || [])[0] || {});
      var bookingNumber;
      for (var i = 0; i < selectWidget.length; i++) {
         var entry = selectWidget['' + i] || {};
         if(entry.selected) {
            bookingNumber = entry.value;
         }
      } 

      if (bookingNumber) {
         smartoffice.http.del(config.apiGatewayBaseUrl + '/booking/' + encodeURIComponent(bookingNumber))
            .then(pollBookingList)
            .catch(err => console.log('failed to delete booking (' + bookingNumber + '): ' + err));
      }
   };

   var initializeTab = function initializeTab(configuration) {
      if (initialized) {
         return;
      }

      initialized = true;
      config      = configuration;
      
      var htmlContent = '';
      htmlContent += '<h1 class="text-center">booking</h1>';
      htmlContent += '<div class="container bg-body-secondary rounded-3 p-1">';
      htmlContent += '<table class="mx-auto">';
      htmlContent += '<tr><td class="text-end">start:</td><td><input id="startDateTime" type="datetime-local" class="m-1" /></td></tr>';
      htmlContent += '<tr><td class="text-end">end:</td><td><input id="endDateTime" type="datetime-local" class="m-1" /></td></tr>';
      htmlContent += '<tr><td class="text-end">workspace:</td><td><select id="availableWorkspaceSelect" class="m-1"></select></td></tr>';
      htmlContent += '<tr><td class="text-center" colspan="2"><button id="submitButton" class="btn btn-outline-success m-1" type="button">book workspace</button></td></tr>';
      htmlContent += '</table>';
      htmlContent += '</div>';
      htmlContent += '<div class="container bg-body-secondary rounded-3 p-1 mt-2">';
      htmlContent += '<table class="mx-auto">';
      htmlContent += '<tr><td class="text-center">existing bookings:</td></tr>';
      htmlContent += '<tr><td class="text-center"><select id="existingBookings" class="m-1"></select></td></tr>';
      htmlContent += '<tr><td class="text-center"><button id="deleteBooking" class="btn btn-outline-danger m-1" type="button">delete selected booking</button></td></tr>';
      htmlContent += '</table>';
      htmlContent += '</div>';
      $(cssSelector).html(htmlContent);

      $(cssSelector + ' #submitButton').on('click', bookWorkspace);
      $(cssSelector + ' #deleteBooking').on('click', deleteBooking);

      var now = Date.now();
      var inTwoHours = now + 2 * 60 * 60 * 1000;
      $(cssSelector + ' #startDateTime')[0].value = getStringForDateTimeSelect(new Date(now));
      $(cssSelector + ' #endDateTime')[0].value = getStringForDateTimeSelect(new Date(inTwoHours));

      $(cssSelector + ' #startDateTime').on('change', updateAvailableWorkspaces);
      $(cssSelector + ' #endDateTime').on('change', updateAvailableWorkspaces);
      
      pollWorkspaceList();
      pollBookingListPeriodically();
   };

   var onConfigReceived = function onConfigReceived(configuration) {
      if (configuration) {
         initializeTab(configuration);
      }
   };

   var onUserNameReceived = function onUserNameReceived(name) {
      username = name;
      if (lastReceivedBookingList) {
         onBookingListReceived(lastReceivedBookingList);
      }
   };

   bus.subscribeToPublication(smartoffice.client.topics.configuration,    onConfigReceived);    
   bus.subscribeToPublication(smartoffice.client.topics.account.username, onUserNameReceived);
};

smartoffice.BookingTab.prototype = new smartoffice.Tab();