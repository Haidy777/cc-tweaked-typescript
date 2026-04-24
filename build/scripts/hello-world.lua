--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
id = os.getComputerID()
label = os.getComputerLabel() or "unnamed"
time = textutils.formatTime(os.time())
term.clear()
term.setCursorPos(1, 1)
print("Hello from cc-tweaked-typescript!")
print(((("Computer #" .. tostring(id)) .. " (") .. label) .. ")")
print("Current time: " .. time)
print()
print("If you can read this, the build pipeline works!")
