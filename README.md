# Death counter
An OBS browser source that ads a simple twitch-chat controlled death counter.

https://deathcounter.opl.io/?channels=moonmoon&whitelist=mod,subscriber,vip
(replace "moonmoon" with your twitch username)
(remove or add subscriber/vip from the user list to disable classes of users being able to adjust your counter)

Mods and the channel broadcaster always have full permissions. Whitelist only permits people to use `+1` and `-1` commands


twitch chat commands:

```
!set {Number} // example, "!set 6.9", "!set 200000"
+1 // adds 1 to the count
-1 // subtracts 1 from the count
!move {Direction} {Number} // "!move left 5" moves the counter left, 5 pixels relative to the current position
!moveTo {X} {Y} // "!moveTo 0 0" moves to the top left corner, coordinates are absolute, not relative
!size {Number} //font size in pixels
!color {String} // set the text color, you can put in things like "red", "blue", "black", or any valid CSS value, must be one word/no-spaces "#ABC123"
!flashColor {String} // same as color, but changes the color the counter flashes to when incremented/decremented
!hide // fades out the counter over 3 seconds
!show // fades it back in
!reset // resets to default settings and position
```
