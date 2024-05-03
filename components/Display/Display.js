/* eslint-disable no-console */
/**
 * @fileoverview Shows the display frame and renders all the
 * widgets inside of it
 */

import React from 'react'
import GridLayout from 'react-grid-layout'
import socketIOClient from 'socket.io-client'
import _ from 'lodash'
import { view } from 'react-easy-state'

import Frame from './Frame.js'
import HeightProvider from '../Widgets/HeightProvider'
import Widgets from '../../widgets'
import EmptyWidget from '../Widgets/EmptyWidget'

import { getDisplay } from '../../actions/display'

const DEFAULT_STATUS_BAR = []
const DEFAULT_LAYOUT = 'spaced'

class Display extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      widgets: [],
      layout: DEFAULT_LAYOUT,
      statusBar: DEFAULT_STATUS_BAR
    }
    this.throttledRefresh = _.debounce(this.refresh, 1500)
  }

  componentDidMount() {
    //const sleep = ms => new Promise(r => setTimeout(r, ms));
    //sleep(2000)
    console.log(this.props)
    this.refresh()
    const { host = 'http://localhost' } = this.props
    const socket = socketIOClient(host)
    socket.on('admin:update', () => this.throttledRefresh())
  }

  componentDidUpdate(prevProps) {
    if (prevProps.display != this.props.display) this.refresh()
  }

  refresh = () => {
    const { display } = this.props
    if(display){
    return getDisplay(display).then(({ widgets = [], layout, statusBar = DEFAULT_STATUS_BAR }) => {
      console.log('refresh display, get display data (widgets,layout,statusBar) ',JSON.stringify(display))
      this.setState({ widgets, layout, statusBar })
    })
    } // else error
  }

  render() {
    const { widgets, layout, statusBar } = this.state
    const widgetLayout = widgets.map(widget => ({
      i: widget._id,
      x: widget.x || 0,
      y: widget.y || 0,
      w: widget.w || 1,
      h: widget.h || 1
    }))

    const GridLayoutWithHeight = HeightProvider(GridLayout, this.container, layout)

    return (
      <Frame statusBar={statusBar}>
        <div className={'gridContainer'} ref={ref => (this.container = ref)}>
          <GridLayoutWithHeight
            className='layout'
            isDraggable={false}
            isResizable={false}
            layout={widgetLayout}
            cols={6}
            margin={layout == 'spaced' ? [10, 10] : [0, 0]}
          >
            {widgets.map(widget => {
              const Widget = Widgets[widget.type] ? Widgets[widget.type].Widget : EmptyWidget
              console.log('widgetdata: ', widget)
              return (
                <div key={widget._id} className={'widget'}>
                  <Widget data={widget.data} />
                </div>
              )
            })}
          </GridLayoutWithHeight>
          <style jsx>
            {`
              .gridContainer {
                flex: 1;
                overflow: hidden;
                margin-bottom: ${layout == 'spaced' ? 10 : 0}px;
              }
              .widget {
                border-radius: ${layout == 'spaced' ? 6 : 0}px;
                overflow: hidden;
              }
            `}
          </style>
        </div>
      </Frame>
    )
  }
}

export default view(Display)
