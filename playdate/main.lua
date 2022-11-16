import("CoreLibs/qrcode")
import("CoreLibs/graphics")
import("CoreLibs/timer")

local UPDATE_WEBAPP_URL = "www.gamesrightmeow.com/pd-update"
local ITCHIO_GAME_ID = "pdreader"

local version = playdate.metadata.version
local qrCode = nil

playdate.graphics.drawText("Generating QR code...", 0, 0)

playdate.graphics.generateQRCode(UPDATE_WEBAPP_URL.."/?version="..version.."&game="..ITCHIO_GAME_ID, 200, 
function(image)
  playdate.graphics.clear()
  image:draw(0, 0)
end)

function playdate.update()
  playdate.timer.updateTimers()
end