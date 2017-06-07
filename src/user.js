import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';

class User extends React.Component{

	constructor(props, context) {
        super(props, context);
        console.log("USR LOG : " + this.props.name);
  }

  clickFunc(){
		this.props.socket.emit('data', {"usrName": this.props.name, "usrReach": this.props.user.name, "action": "discussion"});
	}

	render(){
		var line;
		if(!this.props.user.active){
			line = (
					<li onClick={this.clickFunc.bind(this)} >
						{this.props.user.name}
					</li>
			)
		}else{
			line = (
		            <li onClick={this.clickFunc.bind(this)} >
										<span className="glyphicon glyphicon-envelope pull-right"></span>
										{this.props.user.name}
								</li>
			)
		}

		return(
			<div>
				<ul className="chat">
						{line}
				</ul>
		  </div>
		)
	}
}

export default User;
