function TripEstimateService(){

    this.getEstimate = function(tripEstimateDto) {
        
//        var url = 'http://' + window.location.host + '/app/spring/estimate/';
        return window.superagent.post('/app/estimate/').set('Accept', 'application/json').send(tripEstimateDto);
    }
    
        this.getLaterishEstimate = function(tripEstimateDto) {
        
//        var url = 'http://' + window.location.host + '/app/spring/laterish_estimate/';
        return window.superagent.post('/app/laterish_estimate/').set('Accept', 'application/json').send(tripEstimateDto);
    }
}