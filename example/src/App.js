import React, { Component } from 'react'

import AppointmentPicker from 'react-appointment-picker'

export default class App extends Component {
  state = {
    loading:false
  }
  addAppointmentCallback=(day, number, time, id, cb)=>{
    this.setState({
      loading:true
    },async()=>{
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(`Added appointment ${number}, day ${day}, time ${time}, id ${id}`)
      cb(day,number)
      this.setState({ loading: false })
    })
  }
  render () {
    const days = [
      [{ id:1, number: 1, isSelected: true, periods: 2 }, { id:2, number: 2}, null, { id:3, number: '3', isReserved: true, }, { id:4, number: '4'}, null, { id:5, number: 5}, { id:6, number: 6}],
      [{ id:7, number: 1, isReserved: true, periods:3 }, { id:8, number: 2, isReserved: true}, null, { id:9, number: '3', isReserved: true}, { id:10, number: '4'}, null, { id:11, number: 5}, { id:12, number: 6}],
      [{ id:13, number: 1 }, { id:14, number: 2}, null, { id:15, number: 3, isReserved: true}, { id:16, number: '4'}, null, { id:17, number: 5}, { id:18, number: 6}],
      [{ id:19, number: 1 }, { id:20, number: 2}, null, { id:21, number: 3}, { id:22, number: '4'}, null, { id:23, number: 5}, { id:24, number: 6}],
      [{ id:25, number: 1, isReserved: true }, { id:26, number: 2}, null, { id:27, number: '3', isReserved: true}, { id:28, number: '4'}, null, { id:29, number: 5}, { id:30, number: 6, isReserved: true}]
    ]
    const {loading}=this.state
    return (
      <div>
        <h1>Appointment Picker</h1>
        <AppointmentPicker
          addAppointmentCallback={this.addAppointmentCallback}
          initialDay={new Date("2018-05-05")}
          days={days}
          maxReservableAppointments={3}
          alpha
          visible
          selectedByDefault
          loading={loading}
         />
      </div>
    )
  }
}
