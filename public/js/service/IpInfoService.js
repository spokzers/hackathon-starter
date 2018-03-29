function IpInfoService() {

    this.getIpInfo = function() {
//        var url = 'http://' + window.location.host + '/app/spring/' + 'ipinfo/locate';
        return window.superagent.get('/app/ipinfo/locate').set('Accept', 'application/json');
    };
}