# Death counter

An OBS browser source that ads a simple twitch-chat controlled death counter.

Settings are saved in the "localStorage" api, so even if you close/re-open OBS, your settings and count should be the same.

https://deathcounter.opl.io/?channels=moonmoon&whitelist=mod,subscriber,vip
> Replace "moonmoon" with your twitch username.

> Remove or add subscriber/vip from the user list to disable classes of users being able to adjust your counter.
> 
> Mods and the channel broadcaster always have full permissions. Whitelist only permits people to use `+1` and `-1` commands

---
# Twitch Chat Commands
## +1 and -1

This can be any valid number, so `+5`, and `-2.5` work as well. If the counter gets messed up or you want to set it so something specific, someone with admin permissions will need to use `!set`.

examples:
```
+1
-1
+5
-12.2
+0.6
```


## !move {Direction} {Number}

`"!move left 5"` moves the counter left, 5 pixels relative to the current position

## !moveTo {X} {Y}

`"!moveTo 0 0"` moves to the top left corner, coordinates are absolute, not relative to current position like `!move` is

## !hide

fades out the counter over 3 seconds

## !show

fades it back in

## !reset

resets everything but the current count to default.

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


## !addCounter {Name} {JSON Encoded Settings}
Adds a new counter, will default to original settings if no new ones are passed in.

Example:
```
!addCounter example {"smallText":"Example Counter"}
```

Modifying a specific counter instead of the default is as simple as starting your message with the counters name
```
example !set color red
example +1
example -5
```

## !permituser {username}
Allows a specific user to access only the +/- command

Example:
```
!permituser moonmoon
!removeuser moonmoon
```