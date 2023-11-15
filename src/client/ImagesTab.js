/* global smartoffice, common, assertNamespace, FormData */

assertNamespace('smartoffice');

smartoffice.ImagesTab = function ImagesTab(bus, cssSelector) {
   var thisInstance = this;
   var initialized  = false;
   var images       = [];
   var config;
   
   var showImageCarousel = function showImageCarousel() {
      $(cssSelector + ' #imageCarousel').removeClass('d-none');
   };

   var hideImageCarousel = function hideImageCarousel() {
      $(cssSelector + ' #imageCarousel').addClass('d-none');
   };

   var onImageListReceived = function onImageListReceived(imageList) {
      var itemHtml   = '';
      var index      = 0;
      images         = [];
      
      (imageList || []).forEach(img => {
         if (img.url) {
            images.push({url: img.url});
            itemHtml += '<div id="' + index + '" class="carousel-item ' + ((index === 0) ? 'active' : '') + '">';
            itemHtml += '   <img src="' + img.url + '" class="d-block w-100">';
            itemHtml += '</div>';
            index++;
         }
      });
      
      if (index === 0) {
         hideImageCarousel();
      } else {
         showImageCarousel();
      }
      $(cssSelector + ' #carouselItems').html(itemHtml);
      $(cssSelector + ' #imageCount').text(index + ' image(s)');
   };
   
   var pollImageList = function pollImageList() {
      thisInstance.pollJsonData(config.apiGatewayBaseUrl + '/userimage', onImageListReceived);
   };
   
   var uploadImage = function uploadImage() {
      var filePathCssSelector = cssSelector + ' #imageToUpload';
      var fileSelectorWidgets = $(filePathCssSelector) || [];
      var fileSelectorWidget  = fileSelectorWidgets[0] || {};
      var imageFilePath       = (fileSelectorWidget.files || [])[0];

      if (!imageFilePath) {
         console.log('failed to evaluate image for upload.');
         return;
      }

      var formData = new FormData();
      formData.append('file', imageFilePath);
         
      smartoffice.http.postFormData(config.apiGatewayBaseUrl + '/userimage', formData)
         .then(pollImageList)
         .catch(err => 'failed to upload image (' + imageFilePath + '): ' + err);
   };
   
   var deleteImage = function deleteImage() {
      var carouselItems = $(cssSelector + ' #carouselItems .carousel-item') || [];
      var imageKey;

      for (var i = 0; (i < carouselItems.length) && !imageKey; i++) {
         var item = carouselItems['' + i];
         
         if ($(item).hasClass('active')) {
            var imageUrl = ((images[item.id] || {}).url) || '';
            imageKey     = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
         }
      }

      if (!imageKey) {
         return;
      }

      smartoffice.http.del(config.apiGatewayBaseUrl + '/userimage/' + encodeURIComponent(imageKey))
         .then(pollImageList)
         .catch(err => 'failed to delete image (' + imageKey + '): ' + err);
   };
   
   var initializeTab = function initializeTab(configuration) {
      if (initialized) {
         return;
      }

      initialized = true;
      config      = configuration;
      
      var htmlContent = '';
      htmlContent += '<div class="container bg-body-secondary rounded-3 mt-3">';
      htmlContent += '   <input id="imageToUpload" type="file"/>';
      htmlContent += '   <button id="uploadImageButton" class="btn btn-outline-success m-1" type="button">Upload</button>';
      htmlContent += '   <button id="deleteImageButton" class="btn btn-outline-danger m-1" type="button">Delete</button>';

      htmlContent += '   <p id="imageCount"></p>';
      htmlContent += '   <div id="imageCarousel" class="carousel slide d-none">';
      htmlContent += '     <div id="carouselItems" class="carousel-inner"></div>';
      htmlContent += '     <button class="carousel-control-prev" type="button" data-bs-target="#imageCarousel" data-bs-slide="prev">';
      htmlContent += '        <span class="carousel-control-prev-icon" aria-hidden="true"></span>';
      htmlContent += '        <span class="visually-hidden">Previous</span>';
      htmlContent += '     </button>';
      htmlContent += '     <button class="carousel-control-next" type="button" data-bs-target="#imageCarousel" data-bs-slide="next">';
      htmlContent += '        <span class="carousel-control-next-icon" aria-hidden="true"></span>';
      htmlContent += '        <span class="visually-hidden">Next</span>';
      htmlContent += '     </button>';
      htmlContent += '   </div>';
      htmlContent += '</div>';
      
      $(cssSelector).html(htmlContent);
      $(cssSelector + ' #uploadImageButton').on('click', uploadImage);
      $(cssSelector + ' #deleteImageButton').on('click', deleteImage);
      
      pollImageList();
   };

   var onConfigReceived = function onConfigReceived(configuration) {
      if (configuration) {
         initializeTab(configuration);
      }
   };

   bus.subscribeToPublication(smartoffice.client.topics.configuration, onConfigReceived);    
};

smartoffice.ImagesTab.prototype = new smartoffice.Tab();