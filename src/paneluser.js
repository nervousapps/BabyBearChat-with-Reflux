import React from 'react';
import {render} from 'react-dom';
import './css/container.css';
import User from './user.js';


class Paneluser extends React.Component{

	constructor(props, context) {
        super(props, context);
    }

	render(){
		return (

		        <div className="panel panel-primary">
	                <div className="panel-heading">
	                    <span className="glyphicon glyphicon-user"></span> Connected users
	                </div>
	                <div className="panel-body-user" id="panelUsr">
	                    {
		                		this.props.users.map((user, i) => {
		                			return(
		                				<User
		                					key={i}
		                					user={user}
		                					name={this.props.name}
		                					socket={this.props.socket}
		                				/>
		                			);
		                		})
		                	}
	                </div>
	            </div>

      );
	}
}

export default Paneluser;
