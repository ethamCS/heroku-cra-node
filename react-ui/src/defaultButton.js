import React from 'react'
import autobind from 'react-autobind'
import "./index.css"

class DefaultButton extends React.Component{
    constructor(props){
        super(props)
        autobind(this)
    }

    render(){
        if(this.props.disabled === true){
            return(
                <button className="p-2 rounded-xl bg-white bg-opacity-25" disabled={this.props.disabled} onClick={this.props.onClick}>{this.props.children}</button>
            ) 
        }
        else{
            return(
                <button className="p-2 rounded-xl bg-white" disabled={this.props.disabled} onClick={this.props.onClick}>{this.props.children}</button>
            )
        }
    }
}

export default DefaultButton