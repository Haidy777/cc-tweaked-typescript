--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
function ____exports.isTurtle()
    return turtle ~= nil
end
function ____exports.requireTurtle()
    if turtle == nil then
        error("This program requires a turtle")
    end
    return turtle
end
local function getUpgradeType(side)
    local types = peripheral.getType(side)
    if types == nil then
        return nil
    end
    return types[1] or nil
end
function ____exports.getTurtleInfo()
    if turtle == nil then
        return nil
    end
    local fuelLevel = turtle.getFuelLevel()
    local fuelLimit = turtle.getFuelLimit()
    return {
        id = os.getComputerID(),
        label = os.getComputerLabel() or nil,
        fuelLevel = fuelLevel,
        fuelLimit = fuelLimit,
        fuelEnabled = fuelLevel ~= "unlimited",
        selectedSlot = turtle.getSelectedSlot(),
        leftUpgrade = getUpgradeType("left"),
        rightUpgrade = getUpgradeType("right")
    }
end
function ____exports.printTurtleInfo()
    local info = ____exports.getTurtleInfo()
    if info == nil then
        print("Not a turtle")
        return
    end
    print("Turtle #" .. tostring(info.id))
    if info.label ~= nil then
        print("  Label: " .. info.label)
    end
    if info.fuelEnabled then
        print((("  Fuel: " .. tostring(info.fuelLevel)) .. "/") .. tostring(info.fuelLimit))
    else
        print("  Fuel: unlimited")
    end
    print("  Selected slot: " .. tostring(info.selectedSlot))
    if info.leftUpgrade ~= nil then
        print("  Left upgrade: " .. info.leftUpgrade)
    end
    if info.rightUpgrade ~= nil then
        print("  Right upgrade: " .. info.rightUpgrade)
    end
end
return ____exports
