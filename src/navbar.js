import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';
import './css/container.css';

class Navbar extends React.Component{
	render(){
		return (

			<div className="navbar navbar-default">


						 <div className="col-md-4">
						 	<a className="navbar-left navbar-brand" >  BabyBearChat  </a>
						</div>
						<div className="col-md-4 text-center">
							<img src="./src/css/icons/bear.png" className="img-circle" />
						</div>
						<div className="col-md-4">
								<a className="navbar-right navbar-brand">  {this.props.name}  </a>
						</div>


			</div>
  	);
	}
}

export default Navbar;
