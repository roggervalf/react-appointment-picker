import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RowNumber from './RowNumber'

export default class Col extends Component {
  static propTypes = {
    rowNumber: PropTypes.string,
    visible: PropTypes.bool,
    isSelected: PropTypes.bool,
    children: PropTypes.array
  }

  render () {
    const { visible, rowNumber, isSelected } = this.props
    const className = 'appointment-picker__col' +
    (isSelected ? ' appointment-picker__col--selected' : ' appointment-picker__col--enabled')
    return (
      <div className={className}>
        <RowNumber rowNumber={rowNumber} visible={visible} />
        {this.props.children}
      </div>
    )
  }
}
