module.exports = {
  doAuth
}

const electron = require('electron')
const {
  appIcon
} = require('../../application-constants')

// const log = require('../../logger').getLogger('main/oauth2')

async function doAuth (url) {
  return new Promise((resolve, reject) => {
    open(url, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    }
    )
  })
}

function open (url, cb) {
  const defaults = {
    bounds: {
      width: 500,
      height: 638
    },
    headerHeight: 36,
    minWidth: 450,
    minHeight: 450
  }
  const initialBounds = defaults.bounds

  const win = new electron.BrowserWindow({
    backgroundColor: '#282828',
    backgroundThrottling: false, // do not throttle animations/timers when page is background
    darkTheme: true, // Forces dark theme (GTK+3)
    height: initialBounds.height,
    icon: appIcon(),
    minHeight: defaults.minHeight,
    minWidth: defaults.minWidth,
    show: false,
    title: 'DeltaChat oAuth2',
    titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
    useContentSize: true, // Specify web page size without OS chrome
    width: initialBounds.width,
    x: initialBounds.x,
    y: initialBounds.y,
    webPreferences: {
      nodeIntegration: false
    }
  })

  win.loadURL(url)

  win.once('ready-to-show', () => {
    win.show()
  })

  if (win.setSheetOffset) {
    win.setSheetOffset(defaults.headerHeight)
  }

  win.webContents.on('will-navigate', (e, url) => {
    console.log(url)
    // e.preventDefault()
  })

  win.on('close', e => { })
  win.on('blur', e => { win.hidden = true })
  win.on('focus', e => { win.hidden = false })
}
