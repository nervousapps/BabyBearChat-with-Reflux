import Reflux from 'reflux';
import AppStore from './stores/Appstores.js';
import Actions from './actions/Appactions.js';

import React from 'react';
import ReactDOM from 'react-dom';
import SocketIOClient from 'socket.io-client';
import Msgcontainer from './src/msgcontainer.js';
import Paneluser from './src/paneluser.js';
import Panelgroup from './src/panelgroup.js';
import Navbar from './src/navbar.js';
import 'react-bootstrap';
import './src/css/container.css';

var date = new Date();

var ipParse = window.location.href.toString().split("/");
var IP = ipParse[2].split(":");

const uri = 'https://'+IP[0]+':3000';
const options = { transports: ['websocket'] };

class Index extends Reflux.Component{

	constructor(props, context) {
		super(props, context);
		this.client = SocketIOClient(uri, options);
		this.state = {};
		this.store = AppStore;

		//console.log(this.state.desti);

		this.htmlspecialchars = this.htmlspecialchars.bind(this);

		this.connect = this.connect.bind(this);
		this.wrongUsr = this.wrongUsr.bind(this);
		this.updateUserList = this.updateUserList.bind(this);
		this.updateGroupList = this.updateGroupList.bind(this);
		this.onUnload = this.onUnload.bind(this);
		this.updateUserMess = this.updateUserMess.bind(this);
		this.clearMess = this.clearMess.bind(this);
		this.message = this.message.bind(this);
		this.rightuser = this.rightuser.bind(this);
	}

	onUnload(event) { // the method that will be used for both add and remove event
		this.client.emit('data', {"name": name, "action": "quit"});
	}

	componentWillUnmount() {
		window.removeEventListener("beforeunload", this.onUnload)
	}

	componentDidMount() {
		this.client.on('connect', this.connect);
		this.client.on('wrongusr', this.wrongUsr);
		this.client.on('rightusr', this.rightuser);
		this.client.on('updateUserList', this.updateUserList);
		this.client.on('updateGroupList', this.updateGroupList);
		this.client.on('updateUserMess', this.updateUserMess);
		this.client.on('clearMsg', this.clearMess);
		this.client.on('data', this.message);
	}

	updateUserMess(chunk){
		Actions.message(chunk);
	}

	clearMess(chunk){
		Actions.clearMess(chunk);
	}

	message(chunk){
		Actions.message(chunk);
	}

	rightuser(chunk){
		Actions.rightuser(chunk);
	}

	updateUserList(chunk, rm){
		Actions.updateUserList(chunk, rm);
	}

	updateGroupList(chunk, rm){
		Actions.updateGroupList(chunk, rm);
	}


	htmlspecialchars(str) {
		if (typeof(str) == "string") {
			str = str.replace(/&/g, "&amp;");
			str = str.replace(/"/g, "&quot;");
			str = str.replace(/'/g, "&#039;");
			str = str.replace(/</g, "&lt;");
			str = str.replace(/>/g, "&gt;");
		}
		return str;
	}


	connect(){
		var person = this.htmlspecialchars(prompt("Please enter your name", "HarryPotter"));
		if (person != null) {
			Actions.name(person);
			var passwd = this.htmlspecialchars(prompt("Please enter your password", "*********"));
			if(passwd != null){
				this.client.emit('data', {"name": this.state.name, "passwd": passwd, "action": "connection"});
			}
		}
	}

	wrongUsr(){
		var person = this.htmlspecialchars(prompt("Please choose another user name, this one is already taken ! Or your password is wrong ", "HarryPotter"));
		if (person != null) {
			Actions.name(person);
			var passwd = this.htmlspecialchars(prompt("Please enter your password", "*********"));
			if(passwd != null){
				this.client.emit('data', {"name": name, "passwd": passwd, "action": "connection"});
			}
		}
	}

	render(){
		return(
			<div>
				<Navbar name={this.state.name}/>
				<div className="container">
					<div className="row">
						<div className="col-md-8">
							<Msgcontainer
							socket={this.client}
							messages={this.state.messages}
							name={this.state.name}
							desti={this.state.desti}
							/>
						</div>
						<div className="col-md-4">
							<Paneluser socket={this.client} users={this.state.users} name={this.state.name}/>
							<Panelgroup socket={this.client} groups={this.state.groups} name={this.state.name}/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

ReactDOM.render(<Index />, document.getElementById('container'));
