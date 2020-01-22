console.time('init')

const { app, session } = require('electron')
const rc = app.rc = require('../rc')

if (!app.requestSingleInstanceLock()) {
  /* ignore-console-log */
  console.error('Only one instance allowed. Quitting.')
  app.quit()
}

// Setup folders

// Setup Logger
const logHandler = require('./log-handler')()
const logger = require('../logger')
const log = logger.getLogger('main/index')
logger.setLogHandler(logHandler.log)
process.on('exit', logHandler.end)

// Report uncaught exceptions
process.on('uncaughtException', (err) => {
  const error = { message: err.message, stack: err.stack }
  log.error('uncaughtError', error)
  throw err
})

const windows = require('./windows')

app.ipcReady = false
app.isQuitting = false

Promise.all([
  new Promise((resolve) => app.on('ready', resolve))
])
  .then(onReady)
  .catch(error => {
    log.critical('Fatal Error during init', error)
    process.exit(1)
  })

function onReady () {
  windows.main.init(app, { hidden: false })
  if (rc.debug) windows.main.toggleDevTools()
}

app.once('ipcReady', () => {
  console.timeEnd('init')
  const win = windows.main.win
  win.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault()
      windows.main.hide()
      quit(e)
    }
  })
})

function quit (e) {
  if (app.isQuitting) return

  app.isQuitting = true
  e.preventDefault()
  log.info('Quitting now. Bye.')
  app.quit()
}

app.on('before-quit', e => quit(e))
app.on('window-all-closed', e => quit(e))

app.on('web-contents-created', (e, contents) => {
  contents.on('will-navigate', (e) => {
    e.preventDefault()
  })
  contents.on('new-window', (e) => {
    e.preventDefault()
  })
})

const contentSecurity = 'default-src \'unsafe-inline\' \'self\' \'unsafe-eval\'; img-src \'self\' data:;'

app.once('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details, fun) => {
    fun({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [contentSecurity]
      }
    })
  })
})
