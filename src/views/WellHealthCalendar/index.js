import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect as reduxConnect } from 'react-redux'
import Calendar from 'react-calendar/dist/entry.nostyle'
import {List} from 'immutable'
import EventList from '../../components/EventList'
import {Grid, Row, Col, PageHeader, Button, Modal, Form, FormControl, FormGroup, ControlLabel, DropdownButton, ButtonToolbar, MenuItem} from 'react-bootstrap'
import {setCalendarEvents} from '../../actions/App'
import Moment from 'react-moment'
import MomentJS from 'moment'
import { extendMoment } from 'moment-range'
import './styles.css'
import './stylesM.css'

const MomentRangeJS = extendMoment(MomentJS)

const mapStateToProps = ({ Window, CalendarEvents }) => ({
  Window,
  CalendarEvents
})

const mapDispatchToProps = {
  setCalendarEvents
}

class WellHealthCalendar extends Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.onFormChange = this.onFormChange.bind(this)
    this.handleShow = this.handleShow.bind(this)
    this.handleHide = this.handleHide.bind(this)
 
    this.state = {
      activeDate: Date,
      isMobile: false,
      CalendarEvents: new List(),
      show: false
    }
  }

  static propTypes = { 
    activeDate: PropTypes.Date,
    isMobile: PropTypes.bool,
    CalendarEvents: new List()
  }

  static defaultProps = {
    activeDate: new Date(),
  }
  
  componentWillMount() {
     this.getState(this.props)
  }

  componentDidMount() {
  }
  
  componentWillReceiveProps(nextProps) {
    this.getState(nextProps)
  }

  getState = props => {
    const {activeDate, Window, CalendarEvents} = props

    this.setState({
      activeDate,
      Window,
      CalendarEvents
      })
  }

  onFormChange = (e) => this.setState({[e.target.name]: e.target.value})

  handleShow = () => this.setState({show: true})

  handleHide = () => this.setState({show: false})

  onChange = activeDate => this.setState({activeDate})

  hasEvents = ({ date, view }) => {
    let {CalendarEvents} = this.state
    const {isMobile} = this.state.Window
    let mapCounter = {} // Use to display only 1 eventLabelColor per day for mobile
    return(
      <div class="TileContent">
        {CalendarEvents.length > 0 ? CalendarEvents.map(k => {
          const calendarDay = MomentJS(date)
          const eventStartTime = MomentJS(k.startTime)
          const eventFound = eventStartTime.isSame(calendarDay, 'day')
          mapCounter[eventStartTime.day()] = (mapCounter[eventStartTime.day()] + 1) || 1
          
          return view === 'month' && eventFound && !isMobile ? 
            <div className="hasEventsContainer">
              <span className="eventLabelColor" />
              <span className="eventStartTime"><Moment format="h:mma">{k.startTime}</Moment> {k.title}</span>
              <h6 className="eventTitle">{k.name}</h6>
            </div>
            : view === 'month' && eventFound && mapCounter[eventStartTime.day()] < 2 ? 
            <div class="hasEventsContainerMobile"><span className="eventLabelColor" /></div>
            : null
      }) : null}
    </div>
    )
  }

  setCalendarEvent = () => {
    let {activeDate, CalendarEvents, title, startTime, endTime, description} = this.state
    startTime = new Date(activeDate.getFullYear(), activeDate.getMonth(), activeDate.getDay(), startTime.getHours(), startTime.getMinutes())
    endTime = new Date(activeDate.getFullYear(), activeDate.getMonth(), activeDate.getDay(), endTime.getHours(), endTime.getMinutes())
    
    if(this.validForm(CalendarEvents, startTime, endTime)) {
      CalendarEvents.push({key: CalendarEvents.length, title, startTime, endTime, description})
      CalendarEvents.sort((a, b) => MomentJS(b.startTime) < MomentJS(a.startTime))
      this.props.setCalendarEvents(CalendarEvents)
      this.handleHide()
    }
  }


  Today = () => {
    this.setState({activeDate: new Date()})
  }

  onActiveDateChange = ({ activeStartDate, view }) => this.setState({activeDate: activeStartDate})

  validForm = (CalendarEvents, startTime, endTime) => {
    const now = MomentJS(new Date())
    const newStartTime = MomentJS(startTime)
    const newEndTime = MomentJS(endTime)
    const range1 = MomentRangeJS().range(newStartTime, newEndTime)
    const activeCalendarEvents = CalendarEvents.filter(i => MomentJS(i.startTime).isSame(this.state.activeDate, 'day'))

    for(let i = 0; i < activeCalendarEvents.length; i++) {
      const thisStartTime = MomentJS(activeCalendarEvents[i].startTime)
      const thisEndTime = MomentJS(activeCalendarEvents[i].endTime)
      const range2 = MomentRangeJS().range(thisStartTime, thisEndTime)

      if(range1.overlaps(range2)) {
        return alert("Appointment overlaps with an existing one.")
      }
      if(now.isAfter(newStartTime, 'hour')) {
        return alert("Please select a date in the future.")
      }
    }
    return true
  }

  render() {
    const {CalendarEvents, activeDate, startTime, endTime} = this.state
    return (
      <Grid className="WellHealthCalendar Container">
        <Row>
          <PageHeader className="pageHeader">WELL HEALTH CALENDAR</PageHeader>
        </Row>
        <Row>
          <Button onClick={this.handleShow} className="todayButton">Create</Button>
          <Button onClick={this.Today} className="todayButton">Today</Button>
        </Row>
        <Row>
          <Col>
            <Calendar
              onChange={this.onChange}
              value={activeDate}
              activeStartDate={activeDate} // fallback if value not set
              tileContent={this.hasEvents}
              minDetail={"month"}
              onActiveDateChange={this.onActiveDateChange}
              showFixedNumberOfWeeks={true}
              next2Label={null}
              prev2Label={null}
              nextLabel={<i class="fa fa-chevron-circle-right"/>}
              prevLabel={<i class="fa fa-chevron-circle-left"/>}
            />
          </Col>
          <Col className="EventList" lgHidden mdHidden sm={12}>
            <h2><Moment format="MMMM D">{activeDate}</Moment></h2>
            {CalendarEvents.length > 0 ? <EventList data={CalendarEvents} activeDate={activeDate}/> : null}
          </Col>
        </Row>
        <Row>
          <Modal
          {...this.props}
          show={this.state.show}
          onHide={this.handleHide}
          dialogClassName="custom-modal"
          >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
            Request Appointment on<br/>
            <Moment format="MMMM D, YYYY">{activeDate}</Moment>
            </Modal.Title>
          </Modal.Header>
            <Modal.Body>
            <Form className="Container AppointmentForm">
              <Row>
                <FormGroup>
                  <FormGroup>
                    <ControlLabel>Patient Name</ControlLabel>
                    <FormControl type="text" name="title" placeholder="Name" onChange={this.onFormChange}/>
                  </FormGroup>
                    <ControlLabel>Start Time</ControlLabel>
                    <ButtonToolbar>
                    <DropdownButton title={startTime ? <Moment format="h:mma">{startTime}</Moment> : <Moment format="h:mma">{activeDate}</Moment>} id="dropdown-size-medium" onSelect={(startTime) => this.setState({startTime})}>
                      <MenuItem eventKey={new Date(0, 0, 0, 9, 0)}>9:00am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 9, 30)}>9:30am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 10, 0)}>10:00am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 10, 30)}>10:30am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 11, 0)}>11:00am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 11, 30)}>11:30am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 12, 0)}>12:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 12, 30)}>12:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 13, 0)}>1:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 13, 30)}>1:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 14, 0)}>2:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 14, 30)}>2:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 15, 0)}>3:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 15, 30)}>3:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 16, 0)}>4:00pm</MenuItem>
                    </DropdownButton>
                    </ButtonToolbar> 
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>End Time</ControlLabel>
                    <ButtonToolbar>
                    <DropdownButton title={endTime ? <Moment format="h:mma">{endTime}</Moment> : <Moment format="h:mma">{activeDate}</Moment>} id="dropdown-size-medium" onSelect={(endTime) => this.setState({endTime})}>
                      <MenuItem eventKey={new Date(0, 0, 0, 9, 0)}>9:00am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 9, 30)}>9:30am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 10, 0)}>10:00am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 10, 30)}>10:30am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 11, 0)}>11:00am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 11, 30)}>11:30am</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 12, 0)}>12:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 12, 30)}>12:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 13, 0)}>1:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 13, 30)}>1:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 14, 0)}>2:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 14, 30)}>2:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 15, 0)}>3:00pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 15, 30)}>3:30pm</MenuItem>
                      <MenuItem eventKey={new Date(0, 0, 0, 16, 0)}>4:00pm</MenuItem>
                    </DropdownButton>
                    </ButtonToolbar> 
                  </FormGroup>
                <FormGroup>
                  <ControlLabel>Notes</ControlLabel>
                  <FormControl type="text" name="notes" placeholder="Notes" onChange={this.onFormChange} componentClass="textarea"/>
                </FormGroup>
              </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.setCalendarEvent}>Create</Button>
            </Modal.Footer>
          </Modal>
        </Row>
      </Grid>
    )
  }
}
export default reduxConnect(mapStateToProps, mapDispatchToProps)(WellHealthCalendar)