--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____manifest = require("lib.manifest")
local buildBaseUrl = ____manifest.buildBaseUrl
local cacheManifest = ____manifest.cacheManifest
local ensureLualib = ____manifest.ensureLualib
local httpGet = ____manifest.httpGet
local loadCachedManifest = ____manifest.loadCachedManifest
local loadInstalledFiles = ____manifest.loadInstalledFiles
local MANIFEST_URL = ____manifest.MANIFEST_URL
local writeFile = ____manifest.writeFile
local function downloadFile(baseUrl, file)
    local content = httpGet(baseUrl .. file.source)
    if content == nil then
        return false
    end
    ensureLualib(baseUrl, content)
    return writeFile(file.target, content)
end
local function doUpdate(silent)
    local cached = loadCachedManifest()
    local localVersion = cached and cached.version or 0
    local manifestBody = httpGet(MANIFEST_URL)
    if manifestBody == nil then
        if not silent then
            printError("[updater] Could not reach update server")
        end
        return nil
    end
    local remoteManifest = textutils.unserializeJSON(manifestBody)
    if remoteManifest == nil then
        if not silent then
            printError("[updater] Failed to parse remote manifest")
        end
        return nil
    end
    if remoteManifest.version <= localVersion then
        if not silent then
            print("[updater] Already up to date")
        end
        return {updated = false, fromVersion = localVersion, toVersion = remoteManifest.version, filesUpdated = 0}
    end
    if not silent then
        print((("[updater] Update available: v" .. tostring(localVersion)) .. " -> v") .. tostring(remoteManifest.version))
    end
    local installed = loadInstalledFiles()
    local baseUrl = buildBaseUrl(remoteManifest.repo)
    local filesUpdated = 0
    for name in pairs(installed) do
        do
            local __continue12
            repeat
                local file = remoteManifest.files[name]
                if file == nil then
                    __continue12 = true
                    break
                end
                if not silent then
                    print(("[updater] Updating " .. name) .. "...")
                end
                if downloadFile(baseUrl, file) then
                    filesUpdated = filesUpdated + 1
                elseif not silent then
                    printError("[updater] Failed to update " .. name)
                end
                __continue12 = true
            until true
            if not __continue12 then
                break
            end
        end
    end
    cacheManifest(manifestBody)
    if not silent then
        print(("[updater] Done, " .. tostring(filesUpdated)) .. " files updated")
    end
    return {updated = true, fromVersion = localVersion, toVersion = remoteManifest.version, filesUpdated = filesUpdated}
end
--- Check for updates and download newer versions of all installed files.
-- Call this at the start of your scripts to keep them current.
-- Never throws — logs errors and returns null on failure.
-- 
-- @param silent - If true, don't print any status messages (default: false)
-- @returns Update result, or null if the check failed
function ____exports.checkForUpdates(silent)
    if silent == nil then
        silent = false
    end
    local ok, result = pcall(doUpdate, silent)
    if not ok then
        if not silent then
            printError("[updater] Update check failed: " .. tostring(result))
        end
        return nil
    end
    return result
end
return ____exports
