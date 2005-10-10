/**
 * The contents of this file are from Apple Computer's 
 * "Dashboard Programming Guide" and are coppied here for the purpose of
 * implementing the recommended standard interface elements.
 * 
 * Source:
 * http://developer.apple.com/documentation/AppleApplications/Conceptual/Dashboard_Tutorial/index.html
 * Copyright 2005 Apple Computer, Inc
 * License: unknown
 */
 
 
 
var flipShown = false;
var animation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null};
function mousemove (event)
{
    if (!flipShown)
    {
        if (animation.timer != null)
        {
            clearInterval (animation.timer);
            animation.timer  = null;
        }
        var starttime = (new Date).getTime() - 13;
        animation.duration = 500;
        animation.starttime = starttime;
        animation.firstElement = document.getElementById ('flip');
        animation.timer = setInterval ("animate();", 13);
        animation.from = animation.now;
        animation.to = 1.0;
        animate();
        flipShown = true;
    }
}
function mouseexit (event)
{
    if (flipShown)
    {
        // fade in the info button
        if (animation.timer != null)
        {
            clearInterval (animation.timer);
            animation.timer  = null;
        }
        var starttime = (new Date).getTime() - 13;
        animation.duration = 500;
        animation.starttime = starttime;
        animation.firstElement = document.getElementById ('flip');
        animation.timer = setInterval ("animate();", 13);
        animation.from = animation.now;
        animation.to = 0.0;
        animate();
        flipShown = false;
    }
}
function animate()
{
    var T;
    var ease;
    var time = (new Date).getTime();
    T = limit_3(time-animation.starttime, 0, animation.duration);
    if (T >= animation.duration)
    {
        clearInterval (animation.timer);
        animation.timer = null;
        animation.now = animation.to;
    }
    else
    {
        ease = 0.5 - (0.5 * Math.cos(Math.PI * T / animation.duration));
        animation.now = computeNextFloat (animation.from, animation.to, ease);
    }
    animation.firstElement.style.opacity = animation.now;
}
function limit_3 (a, b, c)
{
    return a < b ? b : (a > c ? c : a);
}
function computeNextFloat (from, to, ease)
{
    return from + (to - from) * ease;
}