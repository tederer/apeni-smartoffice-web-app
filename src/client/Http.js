/* global smartoffice, assertNamespace, Headers, fetch */

assertNamespace('smartoffice.common');

smartoffice.common.Http = function Http(keycloak) {
   var getHeaders = function getHeaders(optionalHeaders) {
      var headers = new Headers(optionalHeaders);
      headers.append('Authorization', 'Bearer ' + keycloak.token);
      return headers;
   };

   this.get = async function get(url) {
      return new Promise((resolve, reject) => {
         if (!(keycloak && keycloak.token)) {
            reject(new Error('keycloak token is not available for authorization'));
         }

         var options = {method: 'GET', headers: getHeaders()};

         fetch(url, options)
            .then(response => {
               if (!response.ok) {
                  reject(new Error('HTTP GET request failed with status ' + response.status));
               }
               response.text()
                  .then(resolve)
                  .catch(err => {
                      reject(new Error('Failed to get text from response (URL=' + url + '): ' + err));
                  });
            })
            .catch(err => reject(new Error('Failed to fetch data from ' + url + ': ' + err)));
      });
   };

   // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#uploading_a_file
   var post = async function post(url, body, optionalHeaders) {
      return new Promise((resolve, reject) => {
         if (!(keycloak && keycloak.token)) {
            reject(new Error('keycloak token is not available for authorization'));
         }

         var headers = getHeaders(optionalHeaders);
         var options = {method: 'POST', headers: headers, body: body };
         
         fetch(url, options)
            .then(response => {
               if (!response.ok) {
                  reject(new Error('HTTP POST request failed with status ' + response.status));
               } else {
                  resolve();
               }
            })
            .catch(err => reject(new Error('Failed to fetch data from ' + url + ': ' + err)));
      });
   };   

   this.postFormData = async function postFormData(url, formData) {
      return post(url, formData);
   };   

   this.postObjectInBody = async function postObjectInBody(url, objectToPost) {
      var stringifiedObjectToPost;

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      
      try {
         stringifiedObjectToPost = JSON.stringify(objectToPost);
      } catch(err) {
         return Promise.reject(err);
      }

      return post(url, stringifiedObjectToPost, headers);
   };

   this.del = async function del(url) {
      return new Promise((resolve, reject) => {
         if (!(keycloak && keycloak.token)) {
            reject(new Error('keycloak token is not available for authorization'));
         }

         var options = {method: 'DELETE', headers: getHeaders() };

         fetch(url, options)
            .then(response => {
               if (!response.ok) {
                  reject(new Error('HTTP DELETE request failed with status ' + response.status));
               } else {
                  resolve();
               }
            })
            .catch(err => reject(new Error('Failed to fetch data from ' + url + ': ' + err)));
      });
   };
};
