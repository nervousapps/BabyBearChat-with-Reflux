import React from 'react';
import {render} from 'react-dom';
import 'react-bootstrap';

class Msg extends React.Component{

	constructor(props, context) {
        super(props, context);
        console.log("MSG LOG : " + this.props.message);
    }



	render(){
		var line;
		if((this.props.from === this.props.desti)  || (this.props.to === "BabyBearChannel" && this.props.from != this.props.name) || (this.props.to.charAt(0) === "_" && this.props.from != this.props.name)){
			line = (
				<div>
				<ul className="chat">
					<li className="clearfix">
	  				<span className="chat-img pull-left">
							<img src="./src/css/icons/u.png" className="img-circle" />
						</span>
							<div className="chat-body clearfix">
								<div className="header">
									<small className="text-muted">
										<strong className="primary-font"></strong>{this.props.from}
									</small>
									<small className="pull-right text-muted">
										<span className="glyphicon glyphicon-time"></span>
										{this.props.date}
									</small>
								</div>

								<p className="text-center">{this.props.message}</p>

							</div>
						</li>
					</ul>
				</div>
				)
		}else{
			line = (
				<div>
				<ul className="chat">
					<li className="clearfix">
	  				<span className="chat-img pull-right">
							<img src="./src/css/icons/me.png" className="img-circle" />
						</span>
							<div className="chat-body clearfix">
								<div className="header">
									<small className="pull-right text-muted">
										<strong className="primary-font"></strong>{this.props.from}
									</small>
									<small className="text-muted">
										<span className="glyphicon glyphicon-time"></span>
										{this.props.date}
									</small>
								</div>

								<p className="text-center">{this.props.message}</p>

							</div>
						</li>
					</ul>
				</div>
				)
		}
		return(
			<div>
				{line}
			</div>
		)
	}
}

export default Msg;
