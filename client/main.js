angular.module('ekg.home', [
  'ekg.auth'
])

.controller('MainController', function ($scope, DataGetter, Auth, TimeFactory) {

  $scope.time = TimeFactory;
  $scope.dataArray = {
    results: [],
    indicators: []
  };
  $scope.renderer = 'line';
  var graphInterval;
  var serverInterval;
  var longGraphStartIndex = 0;
  var longGraphLength = 2500;
  var shortGraphStartIndex = 750;
  var shortGraphLength = 250;

  function grabDataInterval(forward){
    var time = (($scope.time.dayOfWeek * 24 + $scope.time.hour) * 60 + $scope.time.minute) * 60000;
    $scope.getData(time);
    if (forward) time += 30000;
    if (!forward && time - 30000 >= 0) time -= 30000;
    $scope.time = {
      dayOfWeek: ((time - ((time - Math.floor(time / 60000) % 60) / 60) % 24) / 24) % 7,
      hour: ((time - Math.floor(time / 60000) % 60) / 60) % 24,
      minute: Math.floor(time / 60000) % 60
    };
  };

  function changeGraphInterval(forward){
    $scope.largerSnippet = {
      results: $scope.dataArray.results.slice(longGraphStartIndex, longGraphStartIndex + longGraphLength),
      indicators: $scope.dataArray.indicators.slice(longGraphStartIndex, longGraphStartIndex + longGraphLength)
    };
    $scope.snippet = {
      results: $scope.largerSnippet.results.slice(shortGraphStartIndex, shortGraphStartIndex + shortGraphLength),
      indicators: $scope.largerSnippet.indicators.slice(shortGraphStartIndex, shortGraphStartIndex + shortGraphLength)
    };
    if (forward) longGraphStartIndex += 5;
    if (!forward && longGraphStartIndex - 5 >= 0) longGraphStartIndex -= 5;
  };

  function updateDisplayInterval(forward, interval){

  };

  $scope.fastForward = function(){
    window.clearInterval(graphInterval);
    window.clearInterval(serverInterval);
    graphInterval = window.setInterval(changeGraphInterval, 10, true);
    serverInterval = window.setInterval(grabDataInterval, 3000, true);
  };

  $scope.playForward = function(){
    window.clearInterval(graphInterval);
    window.clearInterval(serverInterval);
    graphInterval = window.setInterval(changeGraphInterval, 30, true);
    serverInterval = window.setInterval(grabDataInterval, 9000, true);
  };

  $scope.playBackward = function(){
    window.clearInterval(graphInterval);
    window.clearInterval(serverInterval);
    graphInterval = window.setInterval(changeGraphInterval, 30, false);
    serverInterval = window.setInterval(grabDataInterval, 9000, false);
  };

  $scope.fastBackward = function(){
    window.clearInterval(graphInterval);
    window.clearInterval(serverInterval);
    graphInterval = window.setInterval(changeGraphInterval, 10, false);
    serverInterval = window.setInterval(grabDataInterval, 3000, false);
  };

  $scope.stopPlay = function(){
    window.clearInterval(graphInterval);
    window.clearInterval(serverInterval);
  }

  $scope.getData = function(time) {
    DataGetter.getData(time)
      .success(function(result){
        $scope.dataArray = {
          results: $scope.dataArray.results.concat(result.results),
          indicators: $scope.dataArray.indicators.concat(result.indicators)
        };
      })
      .catch(function(error){
        console.log('http get error', error);
      });
  };

  // Initialized data with current time
  $scope.getData(0);
  grabDataInterval(true);
  changeGraphInterval(true);

  // Signout function
  $scope.signout = Auth.signout;
  /*
  jQuery('#longGraph')
    .mousedown(function(event){
      console.log('in mousedown call back');
      var startingX = event.clientX;
      jQuery(window).mousemove(function(event){
        var drag = event.clientX - startingX;
        if ($scope.longGraphStartX + drag/10 < 0) {
          $scope.longGraphStartX = 0;
        } else if ($scope.longGraphStartX + drag/10 + $scope.longGraphLength > $scope.data.length) {
          $scope.longGraphStartX = $scope.data.length - $scope.longGraphLength;
        } else {
          $scope.longGraphStartX = $scope.longGraphStartX + drag/10;
        }
        $scope.largerSnippet = {
          results:$scope.data.results.slice($scope.longGraphStartX, $scope.longGraphStartX + $scope.longGraphLength),
          indicators:$scope.data.indicators.slice($scope.longGraphStartX, $scope.longGraphStartX + $scope.longGraphLength)
        };
      })
    });
 */
})
  // Retrieves ekg data from node server
.factory('DataGetter', function ($http) {
  return {
    getData: function(time) {
      return $http.post('/users/data', {
        time: time
      });
    }
  };
});
