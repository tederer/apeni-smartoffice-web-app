/* global smartoffice, common, assertNamespace */

assertNamespace('smartoffice');

/*
 * Polls the provided url and provided the received JSON object to the consumer function.
 * In case of problems the consumer function gets called with undefined as argument.
 */
smartoffice.Tab = function Tab() {
   this.pollJsonData = function pollJsonData(url, consumer) {
      smartoffice.http.get(url)
      .then(rawDataAsString => {
         try {
           consumer(JSON.parse(rawDataAsString));
         } catch(err) {
            console.log('failed to parse data from ' + url + ': ' + err);
            console.log('raw data: ' + rawDataAsString);
            consumer(undefined);
         }
      })
      .catch(err => {
         console.log('failed to poll data from ' + url + ': ' + err);
         consumer(undefined);
      });
   }; 
};
