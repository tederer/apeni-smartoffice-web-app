/* global smartoffice, common, process, assertNamespace */

require('./common/NamespaceUtils.js');

assertNamespace('smartoffice');

smartoffice.SimulatedSmartOfficeRestApi = function SimulatedSmartOfficeRestApi(app, keycloak) {
   
   const IMAGE_FOLDER    = '/tmp';
   const FILENAME_PREFIX = 'smartoffice_';
   const USER_NAME       = 'mmustermann';

   var fs         = require('node:fs');
   var process    = require('node:process');
   var fileUpload = require('express-fileupload');
   
   var bookings          = [];
   var nextBookingNumber = 1;

   var imageFilterPredicate = function imageFilterPredicate(filename) {
      return filename.startsWith(FILENAME_PREFIX);
   };
   
   var toUrl = function toUrl(baseUrl) {
      return filename => {
         return {url: baseUrl + 'images/' + filename};
      };
   };
   
   app.use(fileUpload());
   
   app.get('/images/[^\/]+', (req, res) => {
      var filename = req.path.substring(req.path.lastIndexOf('/') + 1);
      res.sendFile(IMAGE_FOLDER + '/' + filename);
   });

   app.get('/account', keycloak.protect(), (req, res) => {
      res.json({
         userName:   USER_NAME, 
         firstName:  'Max', 
         lastName:   'Mustermann', 
         email:      'max@mustermann.at', 
         isAdmin:    false});
   });

   app.get('/userimage', keycloak.protect(), (req, res) => {
      var baseUrl = req.get('Referer');
      var images = fs.readdirSync(IMAGE_FOLDER).filter(imageFilterPredicate);
      res.json(images.map(toUrl(baseUrl)));
   });

   app.post('/userimage', keycloak.protect(), (req, res) => {
      var receivedFile = req.files.file;
      fs.writeFileSync(IMAGE_FOLDER + '/' + FILENAME_PREFIX + receivedFile.name, receivedFile.data);
      res.send('got ' + FILENAME_PREFIX + receivedFile.name + ' (' + receivedFile.size + ' Bytes)');
   });

   app.delete('/userimage/[^\/]+', keycloak.protect(), (req, res) => {
      var imageFilename = decodeURIComponent(req.path.substring(req.path.lastIndexOf('/') + 1));
      
      if (!imageFilename.startsWith(FILENAME_PREFIX)) {
         res.status(400).send('Invalid image filename.');
      }
      
      try {
         fs.unlinkSync(IMAGE_FOLDER + '/' + imageFilename);
         res.send('deleted ' + imageFilename);
      } catch (err) {
         console.log('failed to delete image "' + imageFilename + '": ' + err);
         res.status(500).send('failed to delete ' + imageFilename);
      }
   });

   var pathOfMainJs   = process.argv[1];
   var folderOfMainJs = pathOfMainJs.substring(0, pathOfMainJs.lastIndexOf('/') - '/src'.length);

   app.get('/workspace', keycloak.protect(), (req, res) => {

      res.sendFile(folderOfMainJs + '/simulationData/workspace_get.json');
   });

   app.get('/booking', keycloak.protect(), (req, res) => {

      res.json(bookings);
      //res.sendFile(folderOfMainJs + '/simulationData/booking_get.json');
   });

   app.post('/booking', keycloak.protect(), (req, res) => {
      var workspaceNumber = req.body.workspaceNumber;
      var startDateTime   = req.body.startDateTime;
      var endDateTime     = req.body.endDateTime;
      bookings.push({
         bookingNumber:   '' + (nextBookingNumber++),
         userName:        USER_NAME, 
         workspaceNumber: workspaceNumber, 
         startDateTime:   startDateTime, 
         endDateTime:     endDateTime});
      res.send('added booking');
   });

   app.delete('/booking/[^\/]+', keycloak.protect(), (req, res) => {
      var bookingNumberToDelete       = decodeURIComponent(req.path.substring(req.path.lastIndexOf('/') + 1));
      var bookingCountBeforeFiltering = bookings.length;
      bookings                        = bookings.filter(booking => booking.bookingNumber !== bookingNumberToDelete);
      
      if (bookingCountBeforeFiltering > bookings.length) {
         res.send('deleted booking ' + bookingNumberToDelete);
      } else {
         res.status(400).send('Cannot delete booking ' + bookingNumberToDelete);
      }
   });
};
