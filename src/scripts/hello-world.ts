// Hello World — proves the TypeScript → Lua build pipeline works

const id = os.getComputerID()
const label = os.getComputerLabel() ?? 'unnamed'
const time = textutils.formatTime(os.time() as number)

term.clear()
term.setCursorPos(1, 1)

print(`Hello from cc-tweaked-typescript!`)
print(`Computer #${id} (${label})`)
print(`Current time: ${time}`)
print()
print('If you can read this, the build pipeline works!')
