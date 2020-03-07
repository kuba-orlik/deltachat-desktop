import { C } from 'deltachat-node'
const log = require('../../shared/logger').getLogger(
  'main/deltachat/messagelist'
)
import { integerToHexColor } from '../../shared/util'

const filesizeConverter = require('filesize')
import mime from 'mime-types'

import SplitOut from './splitout'
import { Message } from 'deltachat-node'
export default class DCMessageList extends SplitOut {
  sendMessage(
    chatId: number,
    text: string,
    filename: string,
    location: { lat: number; lng: number }
  ) {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this._dc.messageNew(viewType)
    if (filename) msg.setFile(filename, undefined)
    if (text) msg.setText(text)
    if (location) msg.setLocation(location.lat, location.lng)
    const messageId = this._dc.sendMessage(chatId, msg)
    return [messageId, this.getMessage(messageId)]
  }

  sendSticker(chatId: number, stickerPath: string) {
    const viewType = C.DC_MSG_STICKER
    const msg = this._dc.messageNew(viewType)
    msg.setFile(stickerPath, undefined)
    this._dc.sendMessage(chatId, msg)
  }

  deleteMessage(id: number) {
    log.info(`deleting messages ${id}`)
    this._dc.deleteMessages([id])
  }

  getMessage(msgId: number) {
    return this.messageIdToJson(msgId)
  }

  getMessageInfo(msgId: number) {
    return this._dc.getMessageInfo(msgId)
  }

  setDraft(chatId: number, msgText: string) {
    const msg = this._dc.messageNew()
    msg.setText(msgText)

    this._dc.setDraft(chatId, msg)
  }

  messageIdToJson(id: number) {
    const msg = this._dc.getMessage(id)
    if (!msg) {
      log.warn('No message found for ID ' + id)
      const empty: { msg: null } = { msg: null }
      return empty
    }
    return this.messageToJson(msg)
  }

  messageToJson(msg: Message) {
    const filemime = msg.getFilemime()
    const filename = msg.getFilename()
    const filesize = msg.getFilebytes()
    const viewType = msg.getViewType()
    const fromId = msg.getFromId()
    const isMe = fromId === C.DC_CONTACT_ID_SELF
    const setupCodeBegin = msg.getSetupcodebegin()
    const contact = fromId && this._dc.getContact(fromId).toJson()

    const jsonMSG = msg.toJson()

    let attachment = jsonMSG.file && {
      url: jsonMSG.file,
      contentType: convertContentType({
        filemime,
        viewType: jsonMSG.viewType,
        file: jsonMSG.file,
      }),
      fileName: filename || jsonMSG.text,
      fileSize: filesizeConverter(filesize),
    }

    return {
      id: msg.getId(),
      msg: Object.assign(jsonMSG, {
        sentAt: jsonMSG.timestamp * 1000,
        receivedAt: jsonMSG.receivedTimestamp * 1000,
        direction: isMe ? 'outgoing' : 'incoming',
        status: convertMessageStatus(jsonMSG.state),
        attachment,
      }),
      filemime,
      filename,
      filesize,
      viewType,
      fromId,
      isMe,
      contact: contact
        ? { ...contact, color: integerToHexColor(contact.color) }
        : {},
      isInfo: msg.isInfo(),
      setupCodeBegin,
    }
  }

  forwardMessage(msgId: number, chatId: number) {
    this._dc.forwardMessages([msgId], chatId)
    this._controller.chatList.selectChat(chatId)
  }

  getMessageIds(chatId: number) {
    const messageIds = this._dc.getChatMessages(
      chatId,
      C.DC_GCM_ADDDAYMARKER,
      0
    )
    return messageIds
  }

  getMessages(messageIds: number[]) {
    const messages: {
      [key: number]: ReturnType<typeof DCMessageList.prototype.messageIdToJson>
    } = {}
    messageIds.forEach(messageId => {
      if (messageId <= C.DC_MSG_ID_LAST_SPECIAL) return
      messages[messageId] = this.messageIdToJson(messageId)
    })
    return messages
  }

  markSeenMessages(messageIds: number[]) {
    this._dc.markSeenMessages(messageIds)
  }
}

function convertMessageStatus(s: number) {
  switch (s) {
    case C.DC_STATE_IN_FRESH:
      return 'sent'
    case C.DC_STATE_OUT_FAILED:
      return 'error'
    case C.DC_STATE_IN_SEEN:
      return 'read'
    case C.DC_STATE_IN_NOTICED:
      return 'read'
    case C.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case C.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    case C.DC_STATE_OUT_PENDING:
      return 'sending'
    case C.DC_STATE_UNDEFINED:
      return 'error'
  }
}

function convertContentType({
  filemime,
  viewType,
  file,
}: {
  filemime: string
  viewType: number
  file: string
}) {
  if (!filemime) return 'application/octet-stream'
  if (filemime !== 'application/octet-stream') return filemime

  switch (viewType) {
    case C.DC_MSG_IMAGE:
      return 'image/jpg'
    case C.DC_MSG_VOICE:
      return 'audio/ogg'
    case C.DC_MSG_FILE:
      const type = mime.lookup(file)
      if (type) return type
      else return 'application/octet-stream'
    default:
      return 'application/octet-stream'
  }
}
