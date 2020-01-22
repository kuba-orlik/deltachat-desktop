const main = module.exports = {
  hide,
  init,
  send,
  setAspectRatio,
  setTitle,
  chooseLanguage,
  show,
  toggleAlwaysOnTop,
  isAlwaysOnTop,
  toggleDevTools,
  win: null
}

const electron = require('electron')
const {
  appIcon,
  appWindowTitle,
  windowDefaults
} = require('../../application-constants')

const log = require('../../logger').getLogger('main/mainWindow')

function init (app) {
  if (main.win) {
    return main.win.show()
  }

  const defaults = windowDefaults()

  const win = main.win = new electron.BrowserWindow({
    backgroundColor: '#ffffff',
    backgroundThrottling: false, // do not throttle animations/timers when page is background
    darkTheme: true, // Forces dark theme (GTK+3)
    // height: initialBounds.height,
    icon: appIcon(),
    minHeight: defaults.minHeight,
    minWidth: defaults.minWidth,
    show: false,
    title: appWindowTitle(),
    titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
    useContentSize: true, // Specify web page size without OS chrome
    // width: initialBounds.width,
    // x: initialBounds.x,
    // y: initialBounds.y,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadURL(defaults.main)

  app.on('second-instance', () => {
    log.debug('Someone tried to run a second instance')
    if (win) {
      if (win.isMinimized()) win.show()
      win.focus()
    }
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (win.setSheetOffset) {
    win.setSheetOffset(defaults.headerHeight)
  }

  win.webContents.on('will-navigate', (e, url) => {
    // Prevent drag-and-drop from navigating the Electron window, which can happen
    // before our drag-and-drop handlers have been initialized.
    e.preventDefault()
  })

  win.on('close', e => {})
  win.on('blur', e => { win.hidden = true })
  win.on('focus', e => { win.hidden = false })
}

function hide () {
  if (!main.win) return
  main.win.hide()
}

function send (...args) {
  if (!main.win) {
    log.warn('main.win not defined, can\'t send ipc to renderer')
    return
  }
  main.win.send(...args)
}

/**
 * Enforce window aspect ratio. Remove with 0. (Mac)
 */
function setAspectRatio (aspectRatio) {
  if (!main.win) return
  main.win.setAspectRatio(aspectRatio)
}

function setTitle (title) {
  if (!main.win) return
  if (title) {
    main.win.setTitle(`${appWindowTitle()} - ${title}`)
  } else {
    main.win.setTitle(appWindowTitle())
  }
}

function show () {
  if (!main.win) return
  main.win.show()
}

function toggleAlwaysOnTop () {
  if (!main.win) return
  const flag = !main.win.isAlwaysOnTop()
  log.info(`toggleAlwaysOnTop ${flag}`)
  main.win.setAlwaysOnTop(flag)
}

function isAlwaysOnTop () {
  return main.win ? main.win.isAlwaysOnTop() : false
}

function toggleDevTools () {
  if (!main.win) return
  log.info('toggleDevTools')
  if (main.win.webContents.isDevToolsOpened()) {
    main.win.webContents.closeDevTools()
  } else {
    main.win.webContents.openDevTools({ mode: 'detach' })
  }
}

function chooseLanguage (locale) {
  main.win.send('chooseLanguage', locale)
}
