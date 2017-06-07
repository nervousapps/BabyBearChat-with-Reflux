import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';

class Group extends React.Component{

	constructor(props, context) {
        super(props, context);
        console.log("GROUP LOG : " + this.props.name);
    }

  clickFunc(){
		this.props.socket.emit('data', {"usrName": this.props.name, "usrReach": this.props.group.name, "action": "discussion"});
	}

	render(){
		var line;
		if(!this.props.group.active){
			line = (
				<ul className="chat">
								<li onClick={this.clickFunc.bind(this)} >{this.props.group.name}</li>
						</ul>
			)
		}else{
			line = (
				<ul className="chat">
		            <li onClick={this.clickFunc.bind(this)} >
								<span className="glyphicon glyphicon-envelope pull-right"></span>
								{this.props.group.name}
								</li>
		        </ul>
			)
		}

		return(
			<div>
				{line}
		    </div>
		)
	}
}

export default Group;
