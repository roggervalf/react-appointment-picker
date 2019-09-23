import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DayNumber from './DayNumber'

export default class Day extends Component {
  static propTypes = {
    dayNumber: PropTypes.string,
    visible: PropTypes.bool,
    isSelected: PropTypes.bool,
    children: PropTypes.array
  }

  render () {
    const { visible, dayNumber, isSelected } = this.props
    const className = 'appointment-picker__col' +
    (isSelected ? ' appointment-picker__col--selected' : ' appointment-picker__col--enabled')
    return (
      <div className={className}>
        <DayNumber dayNumber={dayNumber} visible={visible} />
        {this.props.children}
      </div>
    )
  }
}
