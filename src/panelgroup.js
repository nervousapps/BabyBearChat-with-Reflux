import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';
import './css/container.css';
import Group from './group.js';
import Input from './input.js';


class Panelgroup extends React.Component{

	constructor(props, context) {
		super(props, context);
	}

	clickFunc(){
		this.props.socket.emit('data', {"usrName": this.props.name, "usrReach": "BabyBearChannel", "action": "discussion"});
	}

	render(){
		return (
		    <div className="panel panel-primary">
	                <div className="panel-heading">
	                    <span className="glyphicon glyphicon-sunglasses"></span> Groups
	                </div>
	                <div className="panel-body-user">
	                    <ul className="chat">
	                    	<li onClick={this.clickFunc.bind(this)}>BabyBearChannel</li>
	                    </ul>
											{
												this.props.groups.map((group, i) => {
													return(
														<Group
															key={i}
															group={group}
															name={this.props.name}
															socket={this.props.socket}
														/>
													);
												})
											}
	                </div>
	                <div className="panel-footer">
										<Input socket={this.props.socket} desti={this.props.desti} name={this.props.name} placehold="create/join/quit/part:GROUPNAME" buttonTxt="Request"/>
	                </div>
	            </div>
      );
	}
}

export default Panelgroup;
