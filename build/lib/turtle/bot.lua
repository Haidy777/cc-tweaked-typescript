local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ArrayReverse = ____lualib.__TS__ArrayReverse
local ____exports = {}
local ____detect = require("lib.turtle.detect")
local requireTurtle = ____detect.requireTurtle
local ____navigation = require("lib.turtle.navigation")
local copyPosition = ____navigation.copyPosition
local Direction = ____navigation.Direction
local manhattanDistance = ____navigation.manhattanDistance
local moveDelta = ____navigation.moveDelta
local opposite = ____navigation.opposite
local turnLeft = ____navigation.turnLeft
local turnRight = ____navigation.turnRight
local Bot = __TS__Class()
Bot.name = "Bot"
function Bot.prototype.____constructor(self, options)
    if options == nil then
        options = {}
    end
    self.movements = {}
    self.t = requireTurtle()
    self.position = options.position and copyPosition(options.position) or ({x = 0, y = 0, z = 0, dir = Direction.North})
    self.homePosition = options.homePosition and copyPosition(options.homePosition) or copyPosition(self.position)
    self.fuelEnabled = self.t.getFuelLevel() ~= "unlimited"
    local ____options_debug_0 = options.debug
    if ____options_debug_0 == nil then
        ____options_debug_0 = false
    end
    self.debug = ____options_debug_0
    local ____options_trackMovement_1 = options.trackMovement
    if ____options_trackMovement_1 == nil then
        ____options_trackMovement_1 = false
    end
    self.movementTracking = ____options_trackMovement_1
end
function Bot.prototype.getFuelLevel(self)
    if not self.fuelEnabled then
        return 1
    end
    return self.t.getFuelLevel()
end
function Bot.prototype.getMaxFuelLevel(self)
    if not self.fuelEnabled then
        return 1
    end
    return self.t.getFuelLimit()
end
function Bot.prototype.needsRefueling(self)
    if not self.fuelEnabled then
        return false
    end
    return self:getFuelLevel() == 0
end
function Bot.prototype.refuelAll(self)
    if not self.fuelEnabled then
        return
    end
    do
        local slot = 1
        while slot <= 16 do
            self.t.select(slot)
            local itemCount = self.t.getItemCount()
            if itemCount > 0 then
                self.t.refuel(itemCount)
            end
            slot = slot + 1
        end
    end
    self.t.select(1)
end
function Bot.prototype.log(self, msg)
    if self.debug then
        local p = self.position
        print((((((((("[Bot] " .. msg) .. " @ ") .. tostring(p.x)) .. ",") .. tostring(p.y)) .. ",") .. tostring(p.z)) .. " facing ") .. p.dir)
    end
end
function Bot.prototype.trackMove(self, move)
    if self.movementTracking then
        local ____self_movements_2 = self.movements
        ____self_movements_2[#____self_movements_2 + 1] = move
    end
end
function Bot.prototype.forward(self)
    if self.fuelEnabled and self:getFuelLevel() == 0 then
        return false
    end
    local ok = self.t.forward()
    if not ok then
        return false
    end
    local delta = moveDelta(self.position.dir)
    local ____self_position_3, ____x_4 = self.position, "x"
    ____self_position_3[____x_4] = ____self_position_3[____x_4] + delta.dx
    local ____self_position_5, ____y_6 = self.position, "y"
    ____self_position_5[____y_6] = ____self_position_5[____y_6] + delta.dy
    self:trackMove({dir = self.position.dir})
    self:log("forward")
    return true
end
function Bot.prototype.back(self)
    if self.fuelEnabled and self:getFuelLevel() == 0 then
        return false
    end
    local ok = self.t.back()
    if not ok then
        return false
    end
    local delta = moveDelta(self.position.dir)
    local ____self_position_7, ____x_8 = self.position, "x"
    ____self_position_7[____x_8] = ____self_position_7[____x_8] - delta.dx
    local ____self_position_9, ____y_10 = self.position, "y"
    ____self_position_9[____y_10] = ____self_position_9[____y_10] - delta.dy
    self:trackMove({dir = self.position.dir, backward = true})
    self:log("back")
    return true
end
function Bot.prototype.up(self)
    if self.fuelEnabled and self:getFuelLevel() == 0 then
        return false
    end
    local ok = self.t.up()
    if not ok then
        return false
    end
    local ____self_position_11, ____z_12 = self.position, "z"
    ____self_position_11[____z_12] = ____self_position_11[____z_12] + 1
    self:trackMove({up = true})
    self:log("up")
    return true
end
function Bot.prototype.down(self)
    if self.fuelEnabled and self:getFuelLevel() == 0 then
        return false
    end
    local ok = self.t.down()
    if not ok then
        return false
    end
    local ____self_position_13, ____z_14 = self.position, "z"
    ____self_position_13[____z_14] = ____self_position_13[____z_14] - 1
    self:trackMove({down = true})
    self:log("down")
    return true
end
function Bot.prototype.left(self)
    self.t.turnLeft()
    self.position.dir = turnLeft(self.position.dir)
end
function Bot.prototype.right(self)
    self.t.turnRight()
    self.position.dir = turnRight(self.position.dir)
end
function Bot.prototype.rotate(self, target)
    if self.position.dir == target then
        return 0
    end
    if turnLeft(self.position.dir) == target then
        self:left()
        return 1
    end
    local turns = 0
    while self.position.dir ~= target do
        self:right()
        turns = turns + 1
    end
    return turns
end
function Bot.prototype.dig(self, dir)
    if dir == "up" then
        return self.t.digUp()
    end
    if dir == "down" then
        return self.t.digDown()
    end
    return self.t.dig()
end
function Bot.prototype.detect(self, dir)
    if dir == "up" then
        return self.t.detectUp()
    end
    if dir == "down" then
        return self.t.detectDown()
    end
    return self.t.detect()
end
function Bot.prototype.inspect(self, dir)
    if dir == "up" then
        return self.t.inspectUp()
    end
    if dir == "down" then
        return self.t.inspectDown()
    end
    return self.t.inspect()
end
function Bot.prototype.drop(self, dir, count)
    if dir == "up" then
        return self.t.dropUp(count)
    end
    if dir == "down" then
        return self.t.dropDown(count)
    end
    return self.t.drop(count)
end
function Bot.prototype.dropAll(self, dir)
    do
        local slot = 1
        while slot <= 16 do
            self.t.select(slot)
            if self.t.getItemCount() > 0 then
                if dir == "up" then
                    self.t.dropUp()
                elseif dir == "down" then
                    self.t.dropDown()
                else
                    self.t.drop()
                end
            end
            slot = slot + 1
        end
    end
    self.t.select(1)
end
function Bot.prototype.suck(self, dir, count)
    if dir == "up" then
        return self.t.suckUp(count)
    end
    if dir == "down" then
        return self.t.suckDown(count)
    end
    return self.t.suck(count)
end
function Bot.prototype.selectSlot(self, slot)
    return self.t.select(slot)
end
function Bot.prototype.isInventoryFull(self)
    do
        local slot = 1
        while slot <= 16 do
            if self.t.getItemCount(slot) == 0 then
                return false
            end
            slot = slot + 1
        end
    end
    return true
end
function Bot.prototype.goTo(self, target)
    local movements = 0
    while self.position.x ~= target.x do
        local dir = self.position.x < target.x and Direction.East or Direction.West
        self:rotate(dir)
        if not self:forward() then
            break
        end
        movements = movements + 1
    end
    while self.position.y ~= target.y do
        local dir = self.position.y < target.y and Direction.North or Direction.South
        self:rotate(dir)
        if not self:forward() then
            break
        end
        movements = movements + 1
    end
    while self.position.z ~= target.z do
        if self.position.z < target.z then
            if not self:up() then
                break
            end
        else
            if not self:down() then
                break
            end
        end
        movements = movements + 1
    end
    return movements
end
function Bot.prototype.goHome(self)
    return self:goTo(self.homePosition)
end
function Bot.prototype.backTrackHome(self)
    if not self.movementTracking then
        error("Movement tracking is not enabled")
    end
    local reversed = self.movements
    __TS__ArrayReverse(reversed)
    for ____, move in ipairs(reversed) do
        if move.up then
            self:down()
        elseif move.down then
            self:up()
        elseif move.dir ~= nil then
            local faceDir = move.backward and move.dir or opposite(move.dir)
            self:rotate(faceDir)
            self:forward()
        end
    end
    self.movements = {}
    return true
end
function Bot.prototype.calculateDistance(self, target)
    return manhattanDistance(self.position, target)
end
function Bot.prototype.destinationReachable(self, target, backtracking)
    if backtracking == nil then
        backtracking = false
    end
    local fuel = self:getFuelLevel()
    if backtracking then
        return #self.movements <= fuel
    end
    return self:calculateDistance(target) <= fuel
end
____exports.default = Bot
return ____exports
