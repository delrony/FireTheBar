var width = 600;

var isLeft = true;
var totalLeft = 20;
var barWidth = 400;

var totalBullet = 0;
var hitBullet = 0;
var missedBullet = 0;

var barMoved = 0;
var barIncreased = 0;

var fireBullet = true;

var decreaseWidth = function(){
    if (barWidth <= width) {
        barWidth -= 20;
    }
    $("#bar").css("width", barWidth + "px");
    $("#bar").css("background-color", "blue");
};

var increaseWidth = function(){
    if (barWidth <= width) {
        barWidth += 20;
        barIncreased++;
        $("#bar-increased").html(barIncreased);
    }
    $("#bar").css("width", barWidth + "px");
    $("#bar").css("background-color", "brown");
};

var moveCount = 0;

var moveBar = setInterval(function () {
    moveCount++;
    barMoved++;
    
    $("#bar-moved").html(barMoved);
    
    if ((totalLeft + barWidth) <= (width + 20) && isLeft) {
        totalLeft += 20;
        if ((totalLeft + barWidth) >= (width + 20)) isLeft = false;
    } else {
        if (totalLeft <= 40) isLeft = true;
        totalLeft -= 20;
    }
    
    if (moveCount % 20 === 0) {
        increaseWidth();
        moveCount = 0;
    }
    
    if (barWidth <= 20 || barWidth >= 600) {
        fireBullet = false;
        clearInterval(moveBar);
    }
    
    $("#bar").css("left", totalLeft + "px");
}, 200);

// Does the bullet hit the bar?
var isInBar = function(bulletLeft, bulletTop) {
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
};

$(document).click(function(event) {
    // defining the firing zone
    if ((event.pageY > 210 && event.pageY <= 410) 
            && (event.pageX >= 20 && event.pageX <= 620) 
            && fireBullet)
    {
        totalBullet++;
        $("#bullet-fired").text(totalBullet);
        
        var newBullet = $("<div class='bullet'></div>");
        newBullet.css("left", (event.pageX) + "px");
        newBullet.css("top", (event.pageY) + "px");
        $("#bar").after(newBullet);
        
        var bulletLeft = parseInt(newBullet.css("left"), 10);
        var bulletTop = parseInt(newBullet.css("top"), 10);
        
        var bulletUp = setInterval(function(){
            // if a bullet hit the bar then reduce its size
            if (isInBar(bulletLeft, bulletTop)) {
                hitBullet++;
                $("#bullet-hit").html(hitBullet);
                clearInterval(bulletUp);
                newBullet.remove();
                decreaseWidth();
                moveCount = 0;
            }
            
            // The bullets travel only upto target div
            if (bulletTop <= 10) {
                missedBullet++;
                $("#bullet-missed").html(missedBullet);
                clearInterval(bulletUp);
                increaseWidth();
                moveCount = 0;
            }
            else {
                bulletTop -= 5;
                newBullet.css("top", bulletTop + "px");
            }
        }, 25);
    }
});

