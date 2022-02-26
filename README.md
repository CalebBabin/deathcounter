# Death counter

An OBS browser source that ads a simple twitch-chat controlled death counter.

https://deathcounter.opl.io/?channels=moonmoon&whitelist=mod,subscriber,vip
> Replace "moonmoon" with your twitch username.

> Remove or add subscriber/vip from the user list to disable classes of users being able to adjust your counter.
> 
> Mods and the channel broadcaster always have full permissions. Whitelist only permits people to use `+1` and `-1` commands

---
# Twitch Chat Commands
## +1

Adds 1 to the count. If you want to do more than 1 at a time, use `!set 20` to set the count to 20.

## -1

subtracts 1 from the count

## !move {Direction} {Number}

`"!move left 5"` moves the counter left, 5 pixels relative to the current position

## !moveTo {X} {Y}

`"!moveTo 0 0"` moves to the top left corner, coordinates are absolute, not relative to current position like `!move` is

## !hide

fades out the counter over 3 seconds

## !show

fades it back in

## !reset

resets to default settings and position

## !set {Number}

example: "!set 6.9", "!set 200000"


## !set {Property} {Value}
When you put text instead of a number for the first parameter, this will set the matching property of the counter to the value you enter, valid properties and their defaults are:
```js
{
	x: 94,
	y: 67,
	count: 90,
	fontSize: 50,
	opacity: 1,
	color: '#BBB3A3',
	flashColor: '#ff0000',
	smallText: 'deaths',
	smallTextSize: 25,
	font: "'Redressed', cursive",
	fontWeight: 'normal',
}
```
Examples:
- !set color red
- !set fontWeight bold
- !set fontSize 300