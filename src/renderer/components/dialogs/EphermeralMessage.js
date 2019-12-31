import React, { useState } from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter, DeltaDialogContent } from './DeltaDialog'
import { DeltaButtonPrimary } from './SmallDialog'
import { Classes } from '@blueprintjs/core'

export default function EphermeralMessage (props) {
  const { isOpen, onClose } = props
  const tx = window.translate

  const options = [
    ['off', 'Off'],
    ['one_second', 'One Second'],
    ['one_minue', 'One Minue'],
    ['one_hour', 'One hour'],
    ['one_day', 'One day'],
    ['one_week', 'One week'],
    ['one_month', 'One month']
  ]

  const [selectedOption, setSelectedOption] = useState('off')
  const onClickOk = () => onClose() // TODO: Implement

  return (
    <DeltaDialog
      isOpen={isOpen}
      title='Ephermeral Message' // TODO: Translate
      onClose={onClose}
    >
      <DeltaDialogBody>
        <DeltaDialogContent>
          <ul className='ephermeral-message__select-option'>
            {options.map(([key, text]) => {
              return (
                <li className={selectedOption === key ? 'active' : ''} onClick={() => setSelectedOption(key)}>{text}</li>
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
