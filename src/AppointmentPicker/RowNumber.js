import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class RowNumber extends Component {
  static propTypes = {
    rowNumber: PropTypes.string,
    visible: PropTypes.bool
  }

  render () {
    return this.props.visible ? (
      <div className='appointment-picker__col__name'>
        {this.props.rowNumber}
      </div>
    ) : null
  }
}
