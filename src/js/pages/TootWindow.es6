import React from 'react'
import PropTypes from 'prop-types'

import {VISIBLITY_DIRECT, VISIBLITY_PRIVATE, VISIBLITY_UNLISTED, VISIBLITY_PUBLIC} from 'src/constants'
import {IconFont} from 'src/pages/parts'
import TootPanel from './components/TootPanel'
import {postStatusManaged} from 'src/infra/TimelineData'


const MODE_TOOT = 'toot'
const MODE_DIRECT = 'direct'

const STORAGE_KEY_LAST_SEND_FROM = 'naumanni::last_send_from'


/**
 * Status作成画面
 */
export default class TootWindow extends React.Component {
  static contextTypes = {
    context: PropTypes.any,
  }

  constructor(...args) {
    super(...args)

    this.state = {
      ...this.getStateFromContext(),
    }
  }

  /**
   * @override
   */
  componentDidMount() {
    // update accounts
    const {context} = this.context

    this.listenerRemovers = [
      context.onChange(::this.onChangeConext),
    ]
  }

  /**
   * @override
   */
  componentWillUnmount() {
    for(const remover of this.listenerRemovers) {
      remover()
    }
  }

  /**
   * @override
   */
  render() {
    const {tokens} = this.state.tokenState

    return (
      <div className="tootWindow">
        <div className="tootWindow-close">
          <button onClick={this.props.onClose}><IconFont iconName="cancel" /></button>
        </div>

        <TootPanel
          initialSendFrom={this.loadSendForm()}
          tokens={tokens}
          onSend={::this.onSend}
        />
      </div>
    )
  }

  onChangeConext() {
    this.setState(this.getStateFromContext())
  }

  getStateFromContext() {
    const {tokenState} = this.context.context.getState()
    return {
      tokenState,
    }
  }

  async onSend(sendFrom, messageContent) {
    // とりまこっから送る
    await Promise.all(
      sendFrom.map(async (token) => await postStatusManaged(token, messageContent))
    )

    this.saveSendFrom(sendFrom)

    // close tootwindow
    this.props.onClose()
  }

  saveSendFrom(sendFrom) {
    const accts = sendFrom.map((t) => t.acct)
    localStorage.setItem(STORAGE_KEY_LAST_SEND_FROM, JSON.stringify(accts))
  }

  loadSendForm() {
    try {
      // TODO: 値のValidation
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LAST_SEND_FROM))
    } catch(e) {
      // pass
    }
  }
}

