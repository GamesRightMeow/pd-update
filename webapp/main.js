// ----- CONFIGURATION SETTINGS
// itchio URL
const ITCHIO_URL = "https://gamesrightmeow.itch.io"
// a regex that captures the version number from devlog titles
const DEVLOG_REGEX = /Version (\d+\.\d+\.\d+)/

function handleLoad() {
  getGameInfo()
}

function updateStatus(msg) {
  document.getElementById("status").textContent = msg
}

function getGameInfo() {
  var urlParams = new URLSearchParams(window.location.search)

  var gameName = urlParams.get('game')
  if (gameName == null) {
    updateStatus("Game name not set in URL params!")
    return
  }

  // show something temporarily until feed is fetched
  document.getElementById("game-name").textContent = gameName

  var currentVersion = urlParams.get('version')
  if (currentVersion == null) {
    updateStatus("Current version not set in URL params!")
    return
  }

  updateStatus("Checking latest updates...")

  checkForUpdates(gameName, currentVersion)
}

function checkForUpdates(gameName, currentVersion) {
  // see feednami docs https://toolkit.sekando.com/docs/en/feednami
  // also https://www.raymondcamden.com/2015/12/08/parsing-rss-feeds-in-javascript-options
  var url = `${ITCHIO_URL}/${gameName}/devlog.rss`
  feednami.load(url).then(feed => {
    for (let entry of feed.entries) {
      var match = entry.title.match(DEVLOG_REGEX)
      if (match != null) {
        // second element is the capture group
        var latestVersion = match[1]
        var latestVersionUrl = entry.link

        // rss feeds are in chronological order, so if we've found a matching title
        // then we can assume this is the latest version and stop searching
        updatePage(feed.meta.title, currentVersion, latestVersion, latestVersionUrl)
        return
      }
    }

    updateStatus("Unable to determine latest version!")
    console.log(url)
  }).catch(error => updateStatus("Error fetching devlog!"))
}

function updatePage(title, currentVersion, latestVersion, latestUrl) {
  // update game name from feed
  document.getElementById("game-name").textContent = title.replace("Devlog - itch.io", "")

  // compare versions
  if (compareVersions(currentVersion, latestVersion) == -1) {
    updateStatus("Update available!")
    var button = document.getElementById("version-link")
    button.style = "block"
    button.textContent = `download ${latestVersion}`
    button.onclick = () => window.open(latestUrl)
  } else if (compareVersions(currentVersion, latestVersion) == 1) {
    // unlikely edge case, but may occur if someone has a dev version
    updateStatus(`Your current version (${currentVersion}) is newer than the latest version (${latestVersion})`)
    var button = document.getElementById("version-link")
    button.style = "block"
    button.textContent = `view changelog for ${latestVersion}`
    button.onclick = () => window.open(latestUrl)
  } else {
    updateStatus(`You have the latest version (${latestVersion})`)
    var button = document.getElementById("version-link")
    button.style = "block"
    button.textContent = `view changelog for ${latestVersion}`
    button.onclick = () => window.open(latestUrl)
  }
}

function compareVersions(a, b) {
  // TODO: this won't support fancy version numbers like 0.1.0-alpha
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}