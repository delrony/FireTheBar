var Game = (function() {
    
    function initAndStart() {
        statistics.init();
        fireZone.init();
        movingBar.init();
        movingBar.moveBar();
    }
    
    //initAndStart();
    
    // HANDLE THE START BUTTON
    $( "#control button.start" ).click(function() {
        if (movingBar.isMoving()) {
            movingBar.stopBar();
        }
        
        initAndStart();
    });
    
    // HANDLE THE HELP BUTTON
    $( "#control button.help" ).click(function() {
        if ($( this ).text() === "Show help") {
            $( "#help-text ").show();
            $( this ).text("Hide help");
        } else {
            $( "#help-text ").hide();
            $( this ).text("Show help");
        }
    });
})();