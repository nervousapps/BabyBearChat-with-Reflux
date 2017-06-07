import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';


class Input extends React.Component{

	constructor(props, context) {
	    super(props, context);

	    this.state = {value: ""};
	    this.sendMsg = this.sendMsg.bind(this);
	    this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
	    this.setState({value: event.target.value});
	}

	sendMsg(){
		if(this.props.buttonTxt === "Send"){
			this.props.socket.emit('data', {"name" : this.props.name, "msg" : this.state.value, "desti" : this.props.desti, "action" : "send"});
			this.setState({value: ""});
		}else{
			var values = this.state.value.split(":");
			this.props.socket.emit('data', {"name": this.props.name, "group": "_"+values[1], "action": values[0]});
			this.setState({value: ""});
		}

	}

	render(){
		return(
		    <div className="input-group">
		        <input value={this.state.value} type="text" className="form-control input-sm" onChange={this.handleChange} placeholder={this.props.placehold}/>
		        <span className="input-group-btn">
		        	<button className="btn btn-warning btn-sm" onClick={this.sendMsg}>{this.props.buttonTxt}</button>
		        </span>
		    </div>

		);
	}
}

export default Input;
