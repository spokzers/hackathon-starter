function ServiceAreaService() {

    this.getServiceAreas = function() {
//        var url = 'http://' + window.location.host + '/app/spring/servicearea/list';
        return window.superagent.get('/app/servicearea/list').set('Accept', 'application/json');
    };
}