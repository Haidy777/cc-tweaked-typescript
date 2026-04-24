--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
function readFile(path)
    if not fs.exists(path) then
        return nil
    end
    local handle = fs.open(path, "r")
    if handle == nil then
        return nil
    end
    local content = handle.readAll()
    handle.close()
    return content
end
function loadCachedManifest()
    local body = readFile(MANIFEST_CACHE_PATH)
    if body == nil then
        printError("No cached manifest available")
        return nil
    end
    return textutils.unserializeJSON(body)
end
MANIFEST_URL = "https://raw.githubusercontent.com/Haidy777/cc-tweaked-typescript/refs/heads/main/manifest.json"
MANIFEST_CACHE_PATH = "/.installer-manifest.json"
INSTALLED_PATH = "/.installed.json"
function httpGet(url)
    local response, err = http.get(url)
    if response == nil then
        printError("HTTP error: " .. (err or "unknown"))
        return nil
    end
    local body = response.readAll()
    response.close()
    return body
end
function writeFile(path, content)
    local dir = fs.getDir(path)
    if dir ~= "" and not fs.exists(dir) then
        fs.makeDir(dir)
    end
    local handle, err = fs.open(path, "w")
    if handle == nil then
        printError((("Cannot write " .. path) .. ": ") .. (err or "unknown"))
        return false
    end
    handle.write(content)
    handle.close()
    return true
end
function buildBaseUrl(repo)
    return ((((("https://raw.githubusercontent.com/" .. repo.owner) .. "/") .. repo.name) .. "/refs/heads/") .. repo.branch) .. "/"
end
function fetchManifest()
    print("Fetching manifest...")
    local body = httpGet(MANIFEST_URL)
    if body == nil then
        print("Failed to fetch remote manifest, trying cache...")
        return loadCachedManifest()
    end
    local manifest = textutils.unserializeJSON(body)
    if manifest == nil then
        printError("Failed to parse manifest")
        return loadCachedManifest()
    end
    writeFile(MANIFEST_CACHE_PATH, body)
    return manifest
end
function loadInstalled()
    local body = readFile(INSTALLED_PATH)
    if body == nil then
        return {}
    end
    local data = textutils.unserializeJSON(body)
    if data == nil then
        return {}
    end
    return data
end
function saveInstalled(installed)
    local json = textutils.serializeJSON(installed)
    writeFile(INSTALLED_PATH, json)
end
function listFiles(manifest)
    print()
    print("=== Available Files ===")
    print()
    local hasScripts = false
    for name in pairs(manifest.files) do
        local entry = manifest.files[name]
        if entry.type == "script" then
            if not hasScripts then
                print("Scripts:")
                hasScripts = true
            end
            print((("  " .. name) .. " - ") .. entry.description)
        end
    end
    local hasLibs = false
    for name in pairs(manifest.files) do
        local entry = manifest.files[name]
        if entry.type == "lib" then
            if not hasLibs then
                if hasScripts then
                    print()
                end
                print("Libraries:")
                hasLibs = true
            end
            print((("  " .. name) .. " - ") .. entry.description)
        end
    end
    if not hasScripts and not hasLibs then
        print("No files available.")
    end
    print()
end
function ensureLualib(manifest)
    local entry = manifest.files.lualib_bundle
    if entry == nil then
        return
    end
    if fs.exists(entry.target) then
        return
    end
    print("  Installing required runtime library...")
    local url = buildBaseUrl(manifest.repo) .. entry.source
    local content = httpGet(url)
    if content ~= nil then
        writeFile(entry.target, content)
    end
end
function installFile(manifest, name)
    local file = manifest.files[name]
    if file == nil then
        printError("Unknown file: " .. name)
        print("Run \"installer list\" to see available files.")
        return false
    end
    local url = buildBaseUrl(manifest.repo) .. file.source
    print(("Downloading " .. name) .. "...")
    local content = httpGet(url)
    if content == nil then
        printError("Failed to download " .. name)
        return false
    end
    if not writeFile(file.target, content) then
        printError("Failed to save " .. name)
        return false
    end
    local found = string.find(content, "lualib_bundle", 1, true)
    if found ~= nil then
        ensureLualib(manifest)
    end
    local installed = loadInstalled()
    installed[name] = true
    saveInstalled(installed)
    print("  Saved to " .. file.target)
    return true
end
function installAll(manifest)
    local success = 0
    local failed = 0
    for name in pairs(manifest.files) do
        do
            local __continue41
            repeat
                local entry = manifest.files[name]
                if entry.type == "system" then
                    __continue41 = true
                    break
                end
                if installFile(manifest, name) then
                    success = success + 1
                else
                    failed = failed + 1
                end
                __continue41 = true
            until true
            if not __continue41 then
                break
            end
        end
    end
    print()
    print(((("Done: " .. tostring(success)) .. " installed, ") .. tostring(failed)) .. " failed")
end
function updateAll(manifest)
    local installed = loadInstalled()
    local count = 0
    for name in pairs(installed) do
        if manifest.files[name] ~= nil then
            installFile(manifest, name)
            count = count + 1
        else
            print(("Warning: " .. name) .. " no longer in manifest, skipping")
        end
    end
    if count == 0 then
        print("Nothing installed to update.")
        print("Run \"installer install <name>\" first.")
    end
end
function selfUpdate(manifest)
    local entry = manifest.files.installer
    if entry == nil then
        printError("Installer not found in manifest")
        return
    end
    local url = buildBaseUrl(manifest.repo) .. entry.source
    print("Downloading installer update...")
    local content = httpGet(url)
    if content == nil then
        printError("Failed to download installer update")
        return
    end
    local currentProgram = shell.getRunningProgram()
    if not writeFile(currentProgram, content) then
        printError("Failed to write installer update")
        return
    end
    print("Installer updated!")
end
function printUsage()
    print("cc-tweaked-typescript installer")
    print()
    print("Usage:")
    print("  installer list          Show available files")
    print("  installer install <n>   Install a specific file")
    print("  installer install all   Install everything")
    print("  installer update        Update all installed files")
    print("  installer self-update   Update the installer itself")
end
args = {...}
command = args[1]
target = args[2]
if command == nil or command == "help" or command == "--help" then
    printUsage()
elseif command == "list" then
    local manifest = fetchManifest()
    if manifest ~= nil then
        listFiles(manifest)
    end
elseif command == "install" then
    if target == nil then
        printError("Usage: installer install <name|all>")
    else
        local manifest = fetchManifest()
        if manifest ~= nil then
            if target == "all" then
                installAll(manifest)
            else
                installFile(manifest, target)
            end
        end
    end
elseif command == "update" then
    local manifest = fetchManifest()
    if manifest ~= nil then
        updateAll(manifest)
    end
elseif command == "self-update" then
    local manifest = fetchManifest()
    if manifest ~= nil then
        selfUpdate(manifest)
    end
else
    printError("Unknown command: " .. command)
    printUsage()
end
