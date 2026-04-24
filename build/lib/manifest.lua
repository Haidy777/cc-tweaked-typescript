--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
____exports.MANIFEST_URL = "https://raw.githubusercontent.com/Haidy777/cc-tweaked-typescript/refs/heads/main/manifest.json"
____exports.LOCAL_MANIFEST_PATH = "/.installer-manifest.json"
____exports.INSTALLED_PATH = "/.installed.json"
function ____exports.httpGet(url)
    local response = http.get(url)
    if response == nil then
        return nil
    end
    local body = response.readAll()
    response.close()
    return body
end
function ____exports.readFile(path)
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
function ____exports.writeFile(path, content)
    local dir = fs.getDir(path)
    if dir ~= "" and not fs.exists(dir) then
        fs.makeDir(dir)
    end
    local handle = fs.open(path, "w")
    if handle == nil then
        return false
    end
    handle.write(content)
    handle.close()
    return true
end
function ____exports.buildBaseUrl(repo)
    return ((((("https://raw.githubusercontent.com/" .. repo.owner) .. "/") .. repo.name) .. "/refs/heads/") .. repo.branch) .. "/"
end
function ____exports.loadInstalledFiles()
    local body = ____exports.readFile(____exports.INSTALLED_PATH)
    if body == nil then
        return {}
    end
    local data = textutils.unserializeJSON(body)
    if data == nil then
        return {}
    end
    return data
end
function ____exports.saveInstalledFiles(installed)
    local json = textutils.serializeJSON(installed)
    ____exports.writeFile(____exports.INSTALLED_PATH, json)
end
function ____exports.fetchManifest(url)
    if url == nil then
        url = ____exports.MANIFEST_URL
    end
    local body = ____exports.httpGet(url)
    if body == nil then
        return nil
    end
    return textutils.unserializeJSON(body)
end
function ____exports.loadCachedManifest()
    local body = ____exports.readFile(____exports.LOCAL_MANIFEST_PATH)
    if body == nil then
        return nil
    end
    return textutils.unserializeJSON(body)
end
function ____exports.cacheManifest(manifestBody)
    ____exports.writeFile(____exports.LOCAL_MANIFEST_PATH, manifestBody)
end
function ____exports.ensureLualib(baseUrl, content)
    if (string.find(content, "lualib_bundle", 1, true)) ~= nil then
        if not fs.exists("lualib_bundle.lua") then
            local libContent = ____exports.httpGet(baseUrl .. "build/lualib_bundle.lua")
            if libContent ~= nil then
                ____exports.writeFile("lualib_bundle.lua", libContent)
            end
        end
    end
end
return ____exports
