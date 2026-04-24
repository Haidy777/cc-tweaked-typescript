--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
____exports.Direction = ____exports.Direction or ({})
____exports.Direction.North = "n"
____exports.Direction.South = "s"
____exports.Direction.East = "e"
____exports.Direction.West = "w"
local LEFT_TURN = {[____exports.Direction.North] = ____exports.Direction.West, [____exports.Direction.West] = ____exports.Direction.South, [____exports.Direction.South] = ____exports.Direction.East, [____exports.Direction.East] = ____exports.Direction.North}
local RIGHT_TURN = {[____exports.Direction.North] = ____exports.Direction.East, [____exports.Direction.East] = ____exports.Direction.South, [____exports.Direction.South] = ____exports.Direction.West, [____exports.Direction.West] = ____exports.Direction.North}
local OPPOSITE = {[____exports.Direction.North] = ____exports.Direction.South, [____exports.Direction.South] = ____exports.Direction.North, [____exports.Direction.East] = ____exports.Direction.West, [____exports.Direction.West] = ____exports.Direction.East}
local MOVE_DELTA = {[____exports.Direction.North] = {dx = 0, dy = 1}, [____exports.Direction.South] = {dx = 0, dy = -1}, [____exports.Direction.East] = {dx = 1, dy = 0}, [____exports.Direction.West] = {dx = -1, dy = 0}}
function ____exports.turnLeft(dir)
    return LEFT_TURN[dir]
end
function ____exports.turnRight(dir)
    return RIGHT_TURN[dir]
end
function ____exports.opposite(dir)
    return OPPOSITE[dir]
end
function ____exports.moveDelta(dir)
    return MOVE_DELTA[dir]
end
function ____exports.manhattanDistance(a, b)
    return math.abs(a.x - b.x) + math.abs(a.y - b.y) + math.abs(a.z - b.z)
end
function ____exports.copyPosition(pos)
    return {x = pos.x, y = pos.y, z = pos.z, dir = pos.dir}
end
return ____exports
