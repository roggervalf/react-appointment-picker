import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Col from './Col'
import Appointment from './Appointment'
import Blank from './Blank'

export class AppointmentPicker extends Component {
  static propTypes = {
    addAppointmentCallback: PropTypes.func,
    alpha: PropTypes.bool,
    visible: PropTypes.bool,
    loading: PropTypes.bool,
    selectedByDefault: PropTypes.bool,
    removeAppointmentCallback: PropTypes.func,
    maxReservableAppointments: PropTypes.number,
    rows: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          isReserved: PropTypes.bool,
          isSelected: PropTypes.bool
        })
      )
    ).isRequired
  }

  static defaultProps = {
    addAppointmentCallback: (row, number, id, cb) => {
      console.log(`Added appointment ${number}, row ${row}, id ${id}`)
      cb(row, number)
    },
    removeAppointmentCallback: (row, number, id, cb) => {
      console.log(`Removed appointment ${number}, row ${row}, id ${id}`)
      cb(row, number)
    },
    maxReservableAppointments: 0
  }

  constructor (props) {
    super(props)
    const { rows } = props
    const {selectedAppointments, size} = this.getAlreadySelectedAppointments()
    const rowPeriods = rows.map(row => {
      let periods = 0
      row.forEach((obj) => {
        periods = obj ? (obj.periods ? (periods + obj.periods) : (periods + 1)) : (periods + 1)
      })
      return periods
    })
    this.state = {
      selectedAppointments: selectedAppointments,
      size: size,
      rowPeriods,
      rowLength: (Math.max.apply(null, rowPeriods))
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (props.maxReservableAppointments < state.size) {
      let sum = 0
      let selectedAppointments = {}
      for (let array in state.selectedAppointments) {
        if (
          sum + state.selectedAppointments[array].length <
          props.maxReservableAppointments
        ) {
          selectedAppointments[array] = state.selectedAppointments[array].slice(0)
        } else {
          const dif = props.maxReservableAppointments - sum
          selectedAppointments[array] = state.selectedAppointments[array].slice(0, dif)
          return {
            selectedAppointments: selectedAppointments,
            size: props.maxReservableAppointments
          }
        }
        sum = sum + state.selectedAppointments[array].length
      }
    }
    return null
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextState.selectedAppointments !== this.state.selectedAppointments || this.props.loading !== nextProps.loading
  }

  getAlreadySelectedAppointments = () => {
    let selectedAppointments = {}
    let size = 0
    const {
      maxReservableAppointments,
      alpha,
      selectedByDefault
    } = this.props
    if (selectedByDefault) {
      this.props.rows.forEach((row, index) => {
        const rowNumber = alpha
          ? String.fromCharCode('A'.charCodeAt(0) + index)
          : (index + 1).toString()
        row.forEach((appointment, index) => {
          if (appointment && appointment.isSelected) {
            const appointmentAlreadySelected = this.includeAppointment(selectedAppointments, rowNumber, appointment.number)
            if (size < maxReservableAppointments && !appointmentAlreadySelected) {
              selectedAppointments = this.addAppointment(selectedAppointments, rowNumber, appointment.number)
              size = size + 1
            }
          }
        })
      })
    }
    return {selectedAppointments, size}
  }

  includeAppointment=(selectedAppointments, row, number) => {
    if (selectedAppointments[row]) {
      return selectedAppointments[row].includes(number)
    }
    return false
  }

  addAppointment=(selectedAppointments, row, number) => {
    if (selectedAppointments[row]) {
      if (!selectedAppointments[row].includes(number)) {
        selectedAppointments[row].push(number)
      }
    } else {
      selectedAppointments[row] = []
      selectedAppointments[row].push(number)
    }
    return {...selectedAppointments}
  }

  deleteAppointment=(row, number) => {
    let { selectedAppointments } = this.state
    if (selectedAppointments[row]) {
      selectedAppointments[row] = selectedAppointments[row].filter((value) => {
        return value !== number
      })
      if (!selectedAppointments[row].length > 0) {
        delete (selectedAppointments[row])
      }
    }
    return {...selectedAppointments}
  }

  acceptSelection= (row, number) => {
    let { selectedAppointments } = this.state
    const size = this.state.size

    this.setState(
      {
        selectedAppointments: this.addAppointment(selectedAppointments, row, number),
        size: size + 1
      }
    )
  }

  acceptDeselection= (row, number) => {
    const size = this.state.size

    this.setState(
      {
        selectedAppointments: this.deleteAppointment(row, number),
        size: size - 1
      }
    )
  }

  selectAppointment = (row, number, id) => {
    let { selectedAppointments } = this.state
    const size = this.state.size
    const {
      maxReservableAppointments,
      addAppointmentCallback,
      removeAppointmentCallback
    } = this.props
    const appointmentAlreadySelected = this.includeAppointment(selectedAppointments, row, number)

    if (size < maxReservableAppointments && !appointmentAlreadySelected) {
      addAppointmentCallback(row, number, id, this.acceptSelection)
    } else if (selectedAppointments[row] && appointmentAlreadySelected) {
      removeAppointmentCallback(row, number, id, this.acceptDeselection)
    }
  }

  render () {
    return (<div className='-content'>
      <div className={this.props.loading ? 'loader' : null} />
      <div className='appointment-picker'>
        {this.renderCols()}
      </div>
    </div>)
  }

  renderCols () {
    const { selectedAppointments: appointments, rowPeriods } = this.state
    const { alpha, visible } = this.props
    return this.props.rows.map((row, index) => {
      const rowNumber = alpha
        ? String.fromCharCode('A'.charCodeAt(0) + index)
        : (index + 1).toString()
      const isSelected = !!appointments[rowNumber]
      const props = {
        visible,
        rowNumber,
        isSelected,
        selectedAppointment: null,
        appointments: row,
        key: `Col${rowNumber}`,
        selectAppointment: this.selectAppointment
      }

      return (
        <Col key={index} {...props}>{this.renderAppointments(row, rowNumber, isSelected, rowPeriods[index])} </Col>
      )
    })
  }

  renderAppointments (appointments, rowNumber, isColSelected, periods) {
    const { selectedAppointments, size, rowLength } = this.state
    const { maxReservableAppointments } = this.props
    const blanks = new Array((rowLength - periods) > 0 ? (rowLength - periods) : 0).fill(0)
    let row = appointments.map((appointment, index) => {
      if (appointment === null) return <Blank key={index} />
      const isSelected =
        isColSelected && this.includeAppointment(selectedAppointments, rowNumber, appointment.number)
      const props = {
        isSelected,
        orientation: appointment.orientation,
        isReserved: appointment.isReserved,
        isEnabled: size < maxReservableAppointments,
        selectAppointment: this.selectAppointment.bind(this, rowNumber, appointment.number, appointment.id),
        appointmentNumber: appointment.number,
        periods: appointment.periods ? appointment.periods : 1,
        key: index
      }

      return <Appointment {...props} />
    })
    if (blanks.length > 0) {
      blanks.forEach((blank, index) => {
        row.push(<Blank key={row.length + index + 1} />)
      })
    }
    return row
  }
}
