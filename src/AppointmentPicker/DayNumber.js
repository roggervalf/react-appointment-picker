import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class DayNumber extends Component {
  static propTypes = {
    dayNumber: PropTypes.string,
    visible: PropTypes.bool
  }

  render () {
    return this.props.visible ? (
      <div className='appointment-picker__col__name'>
        {this.props.dayNumber}
      </div>
    ) : null
  }
}
