import React from 'react'
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet'
import { Popup } from 'react-leaflet'
import ContentEditable from 'react-contenteditable'
import Parser from 'html-react-parser';
import './EditablePopup.css'

const prefix = 'leaflet-popup-button'

class EditablePopup extends React.Component{
   constructor(props){
      super(props)

      const sourceTypes = ['Layer','Circle','CircleMarker','Marker','Polyline','Polygon','ImageOverlay','VideoOverlay','SVGOverlay','Rectangle','LayerGroup','FeatureGroup','GeoJSON']

      sourceTypes.forEach( type => {
         L[type].include({
            nametag: type.toLowerCase()
         })
      })

   }

   componentDidMount(){

      console.log(this.thePopup.leafletElement._source.nametag)

      if (this.props.open){
         setTimeout( () => {
            this.thePopup.leafletElement._source.openPopup()
         },0.001)
      }

      this.setState({
         nametag: this.props.nametag || this.thePopup.leafletElement._source.nametag
      })

   }

   parsedChildren = this.props.children.$$typeof ? ReactDOMServer.renderToStaticMarkup(this.props.children) : this.props.children

   state = {
      editScreenOpen: false,
      inputValue: this.parsedChildren,
      content: this.parsedChildren,
      nametag: this.props.nametag
   }

   openEditScreen = () => {
      // console.log(this.thePopup.leafletElement._source.nametag)
      this.setState({editScreenOpen: true})
   }

   closeEditScreen = () => {
      this.setState({editScreenOpen: false})
   }

   handleEdits = (e) => {
      this.setState({inputValue: e.target.value})
   }

   saveEdits = () => {
      if (!isNaN(this.props.sourceKey) && this.props.saveContentCallback){
         this.props.saveContentCallback(this.state.inputValue, this.props.sourceKey)
      }
      this.setState({
         content: this.state.inputValue,
      })
      this.closeEditScreen()
   }

   cancelEdits = () => {
      this.setState({
         inputValue: this.state.content
      })
      this.closeEditScreen()
   }

   removeSource = () => {
      if(!this.props.sourceKey){
         this.thePopup.leafletElement._source.remove()
      } else if( (this.props.sourceKey || this.props.sourceKey ===0 ) && this.props.removalCallback){
         this.props.removalCallback(this.props.sourceKey)
      }
   }



   render(){

      let Buttons;
      // const { nametag } = this.thePopup.leafletElement._source

      if (this.props.removable && !this.props.editable){
         Buttons = (
            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} remove`} onClick={this.removeSource} >Remove this {this.state.nametag}</button>
            </div>
         )
      } else if (!this.props.removable && this.props.editable){
         Buttons = (
            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} edit`} onClick={ this.openEditScreen }>Edit</button>
            </div>
         )
      } else if (this.props.removable && this.props.editable){
         Buttons = (
            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} remove`} onClick={this.removeSource} >Remove this {this.state.nametag}</button>
               <button onClick={ this.openEditScreen } className={`${prefix} edit`}>Edit</button>
            </div>
         )
      }

      const contentScreen = (
         <>
            {Parser(this.state.content)}
            {/*}  { (typeof this.state.content === 'string') && Parser(this.state.content)}  */}
            {Buttons}
         </>
      )

      const editScreen = (
         <>
            <ContentEditable className="leaflet-popup-input" html={this.state.inputValue} ref="editableDiv" onChange={ this.handleEdits } />

            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} cancel`} onClick={this.cancelEdits} >Cancel</button>
               <button className={`${prefix} save`} onClick={this.saveEdits} >Save</button>
            </div>
         </>
      )

      return(
         <Popup {...this.props} ref={thePopup => this.thePopup = thePopup} minWidth="160">
            {this.state.editScreenOpen ? editScreen : contentScreen}
         </Popup>
      )
   }
}



export default EditablePopup
