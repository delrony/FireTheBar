var Game = (function() {
    
    function initAndStart() {
        statistics.init();
        fireZone.init();
        movingBar.init();
        movingBar.moveBar();
    }
    
    initAndStart();
    
    $( "#control button").click(function() {
        if (movingBar.isMoving()) {
            movingBar.stopBar();
        }
        
        initAndStart();
    });
})();