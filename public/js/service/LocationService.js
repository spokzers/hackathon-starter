function LocationService() {

    this.getLocations = function(serviceAreaId, fieldType, searchKey) {
        var url = 'http://' + window.location.host + '/app/spring/location/search/serviceAreaId/' + serviceAreaId 
                    + '/field/' + fieldType + '/searchKey/' + searchKey;
        return window.superagent.get('/app/location/search/serviceAreaId/' + serviceAreaId 
                    + '/field/' + fieldType + '/searchKey/' + searchKey).set('Accept','application/json; charset=utf-8');
    };
    
}