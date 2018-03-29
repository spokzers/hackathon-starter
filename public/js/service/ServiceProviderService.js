function ServiceProviderService() {

    this.getServiceProviderPricing = function() {
//        var url = 'http://' + window.location.host + '/app/spring/serviceprovider/pricing';
        return window.superagent.get('/app/serviceprovider/pricing').set('Accept', 'application/json').set('Content-Type', 'application/json');
    };
}