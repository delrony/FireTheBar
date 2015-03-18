/* 
 * EventHandler
 * 
 * This object manages the adding and firing different custom events
 */
var eventHandler = (function() {
    var _listeners = {};
    
    /**
     * Adding listener function to a custom event
     * 
     * @param {string} eventName
     * @param {function} action
     */
    var addListener = function(eventName, action) {
        if (!(eventName in _listeners)) {
            _listeners[eventName] = [];
        }
        
        _listeners[eventName].push(action);
    };
    
    /**
     * Broadcasting or firing an custom event
     * 
     * @param {string} eventName
     */
    var fireEvent = function(eventName) {
        if (eventName in _listeners) {
            for (var i in _listeners[eventName]) {
                _listeners[eventName][i].call();
            }
        }
    };
    
    /**
     * Public methods
     */
    return {
        add: addListener,
        fire: fireEvent
    };
})();

/**
 * MovingBar - The #bar div
 * 
 */
var movingBar = (function() {
    /**
     * It is used for setInterval and clearInterval method
     * @type number
     */
    var intervalVar = undefined;
    /**
     * We change this variable to increate or reduce the bar width
     * @type Number
     */
    var barWidth = 400;
    /**
     * We change this variable to move the bar left and right
     * @type Number
     */
    var totalLeft = 20;
    /**
     * It is used in combination with totalLeft to move the bar
     * true - bar moves to the left; false - bar moves to the right
     * @type Boolean
     */
    var isLeft = true;
    /**
     * How many times the bar has been moved.
     * In every 20 moves, we increase the width of the bar
     * @type Number
     */
    var moveCount = 0;
    var width = 600;
    var isMoving = false;
    
    var increaseWidth = function(){
        if (barWidth <= width) {
            barWidth += 20;
            eventHandler.fire('barIncreased');
        }
        $("#bar").css("width", barWidth + "px");
        $("#bar").css("background-color", "brown");
    };
    
    var decreaseWidth = function(){
        if (barWidth <= width) {
            barWidth -= 20;
        }
        $("#bar").css("width", barWidth + "px");
        $("#bar").css("background-color", "blue");

        eventHandler.fire('barDecreased');
    };
    
    eventHandler.add('bulletHit', function() {
        decreaseWidth();
        moveCount = 0;
    });
    
    eventHandler.add('bulletMissed', function() {
        increaseWidth();
        moveCount = 0;
    });
    
    /**
     * Public methods
     */
    return {
        init: function() {
            barWidth = 400;
            $( "#bar" ).css("width", barWidth);
            
            totalLeft = 20;
            $( "#bar" ).css( "left", 20 );
            
            isLeft = true;
            moveCount = 0;
            isMoving = false;
            
            $( "#bar" ).css( 'background-color', 'green' );
        },
        
        moveBar: function() {
            intervalVar = setInterval(function () {
                moveCount++;
                isMoving = true;
                eventHandler.fire('barMoved');

                // calculating new left position of the bar
                if ((totalLeft + barWidth) <= (width + 20) && isLeft) {
                    totalLeft += 20;
                    if ((totalLeft + barWidth) >= (width + 20)) isLeft = false;
                } else {
                    if (totalLeft <= 40) isLeft = true;
                    totalLeft -= 20;
                }

                // After uninterrupted 20 moves, increase the bar width
                if (moveCount % 20 === 0) {
                    increaseWidth();
                    moveCount = 0;
                }

                // Stop the bar if its width reduced to 20px (win)
                // Or width increased more than 600 px (lost)
                if (barWidth <= 20 || barWidth >= 600) {
                    clearInterval(intervalVar);
                    eventHandler.fire('barStopped');
                    isMoving = false;
                }

                // Actuall here we move the bar
                $("#bar").css("left", totalLeft + "px");
            }, 200);
        },
        
        stopBar: function() {
            clearInterval(intervalVar);
            eventHandler.fire('barStopped');
            isMoving = false;
        },
        
        // Does the bullet hit the bar?
        // Here actually we determine, if a point is inside or outside of the bar
        isInBar: function(bulletLeft, bulletTop) {
            var barLeftLeft = parseInt($("#bar").css("left"), 10);
            var barLeftTop = parseInt($("#bar").css("top"), 10);
            var barRightLeft = barLeftLeft + parseInt($("#bar").css("width"), 10);
            var barRightTop = barLeftTop + 10;

            if ((bulletLeft >= barLeftLeft && bulletLeft <= barRightLeft) && 
                (bulletTop >= barLeftTop && bulletTop <= barRightTop)) {
                return true;
            } else {
                return false;
            }
        },
        
        isMoving: function() {
            return isMoving;
        }
    };
})();

/**
 * FireZone  - the big rectangle (#fire-zone div)
 */
var fireZone = (function() {
    /**
     * If the game is finished (bar is not moving), we don't need to fire
     * @type Boolean
     */
    var fireBullet = false;
    /**
     * The missed bullet are attached with the #target div (the top blue line)
     * and visible. When we start a new game, those bullets must be removed.
     * In this array, we store the missed bullets and remove those from DOM
     * during initialization.
     * @type Array
     */
    var missedBullets = [];
    
    // Only clicking in the fire-zone trigger a bullet
    $( "#fire-zone" ).click(function(event) {
        if (fireBullet) {
            eventHandler.fire('bulletFired');

            var newBullet = $("<div class='bullet'></div>");
            newBullet.css("left", (event.pageX) + "px");
            newBullet.css("top", (event.pageY) + "px");
            $("#bar").after(newBullet);

            var bulletLeft = parseInt(newBullet.css("left"), 10);
            var bulletTop = parseInt(newBullet.css("top"), 10);

            // moving the bullet up
            var bulletUp = setInterval(function(){
                // if a bullet hit the bar then reduce the bar's size
                if (movingBar.isInBar(bulletLeft, bulletTop)) {
                    eventHandler.fire('bulletHit');
                    clearInterval(bulletUp);
                    newBullet.remove();
                }

                // The bullets travel only upto target div
                if (bulletTop <= 10) {
                    eventHandler.fire('bulletMissed');
                    clearInterval(bulletUp);
                }
                else {
                    bulletTop -= 5;
                    // here we actually moving the bullet up
                    newBullet.css("top", bulletTop + "px");
                    missedBullets.push(newBullet);
                }
            }, 25);
        }
    });
    
    // If the bar is stopped, we deactivate the fire-zone
    eventHandler.add('barStopped', function() {
        fireBullet = false;
    });
    
    /**
     * Public method
     */
    return {
        init: function() {
            fireBullet = true;
            
            for(var i in missedBullets) {
                missedBullets[i].remove();
            }
            
            missedBullets = [];
        }
    };
}());

/**
 * Statistics - The #score div
 */
var statistics = (function() {
    var barMoved = 0;
    var barIncreased = 0;
    var totalBullet = 0;
    var hitBullet = 0;
    var missedBullet = 0;
    
    eventHandler.add('barIncreased', function() {
        barIncreased++;
        $("#bar-increased").html(barIncreased);
    });
    
    eventHandler.add('barMoved', function() {
        barMoved++;
        $("#bar-moved").html(barMoved);
    });
    
    eventHandler.add('bulletFired', function() {
        totalBullet++;
        $("#bullet-fired").text(totalBullet);
    });
    
    eventHandler.add('bulletHit', function() {
        hitBullet++;
        $("#bullet-hit").html(hitBullet);
    });
    
    eventHandler.add('bulletMissed', function() {
        missedBullet++;
        $("#bullet-missed").html(missedBullet);
    });
    
    return {
        init: function() {
            barMoved = 0;
            $("#bar-moved").html(barMoved);
            barIncreased = 0;
            $("#bar-increased").html(barIncreased);
            totalBullet = 0;
            $("#bullet-fired").text(totalBullet);
            hitBullet = 0;
            $("#bullet-hit").html(hitBullet);
            missedBullet = 0;
            $("#bullet-missed").html(missedBullet);
        }
    };
}());




