import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';
import Rnd from './css/index.js';
import './css/container.css';
import Input from './input.js';
import Msg from './msg.js';

let rnd;

class Msgcontainer extends React.Component{

	constructor(props, context) {
		super(props, context);
	}

	render(){
		return (
				<div className="panel panel-primary">
					<div className="panel-heading">
						<span className="glyphicon glyphicon-comment"></span>{this.props.desti}
					</div>
					<div className="panel-body">
					{
						this.props.messages.map((message, i) => {
							return(
								<Msg
								key={i}
								message={message.body}
								from={message.from}
								to={message.to}
								date={message.date}
								name={this.props.name}
								desti={this.props.desti}
								/>
							);
						})
					}
					</div>
					<div className="panel-footer">
						<Input socket={this.props.socket} desti={this.props.desti} name={this.props.name} placehold="Type your message here..." buttonTxt="Send"/>
					</div>
				</div>
		);
	}
}

export default Msgcontainer;
