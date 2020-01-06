import React, { useState, useEffect } from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter, DeltaDialogContent } from './DeltaDialog'
import { DeltaButtonPrimary } from './SmallDialog'
import { Classes } from '@blueprintjs/core'
import { callDcMethodAsync } from '../../ipc'

export default function EphermeralMessage (props) {
  const chatId = props.selectedChat.id
  const { isOpen, onClose } = props
  const tx = window.translate

  const options = [
    [0, 'off', 'Off'],
    [1, 'one_second', 'One Second'],
    [60, 'one_minue', 'One Minue'],
    [60*60, 'one_hour', 'One hour'],
    [24*60*60,'one_day', 'One day'],
    [7*24*60*60, 'one_week', 'One week'],
    [31*7*24*60*60, 'one_month', 'One month']
  ]

  const [autodeleteTimer, setAutodeleteTimer] = useState(-1)

  const onClickOk = async () => {
    await callDcMethodAsync('chat.setChatAutodeleteTimer', [chatId, autodeleteTimer])
    onClose()
  }

  useEffect(() => {
    (async () => {
      const autodeleteTimer = await callDcMethodAsync('chat.getChatAutodeleteTimer', [chatId])
      setAutodeleteTimer(autodeleteTimer)
    })()
  }, [])

  return (
    <DeltaDialog
      isOpen={isOpen}
      title='Ephermeral Message' // TODO: Translate
      onClose={onClose}
    >
      <DeltaDialogBody>
        <DeltaDialogContent>
          <ul className='ephermeral-message__select-option'>
            {options.map(([timer, key, text]) => {
              return (
                <li className={autodeleteTimer === timer ? 'active' : ''} onClick={() => setAutodeleteTimer(timer)}>{text}</li>
              )
            })}
          </ul>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <DeltaButtonPrimary
            noPadding
            onClick={onClickOk}
          >
            {tx('ok')}
          </DeltaButtonPrimary>
        </div>
      </DeltaDialogFooter>
    </DeltaDialog>
  )
}
