import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';
import Actions from '../actions/Appactions.js';

class AppStore extends Reflux.Store
{
	constructor()
	{
		super();
    this.state = {
			messages:[],
			users:[],
			groups:[],
			desti:"BabyBearChannel",
			name:""
		};
		this.listenables = Actions;
	}

	onName(name)
	{
		this.setState({name: name});
	}

	onRightuser(chunk)
	{
    var {messages} = this.state;
		messages.push(chunk);
		this.setState({messages});
    console.log("MSGCONTAINER LOG : " + this.state.messages);
		console.log(chunk);
	}

	onClearMess(chunk)
	{
		var {users} = this.state;
		var {groups} = this.state;
    var {messages} = this.state;
		messages = [];
		this.setState({messages});

    var {name} = this.state;
		if(chunk != name){
			var {desti} = this.state;
			desti = chunk;
			this.setState({desti});
		}
		if(chunk.charAt(0) == "_"){
			for(var i=0 ; i<groups.length ; i++){
				if(groups[i].name == chunk){
					groups[i].active = false;
				}
			}
			this.setState({groups});
		}else {
			for(var i=0 ; i<users.length ; i++){
				if(users[i].name == chunk){
					users[i].active = false;
				}
			}
			this.setState({users});
		}
	}

  onMessage(chunk){
    var {desti} = this.state;
		var {name} = this.state;
		if((chunk.from === desti && chunk.to == name) || (chunk.from === name && chunk.to == desti) || (chunk.to === desti && chunk.to === "BabyBearChannel") || (chunk.to.charAt(0) == '_' && chunk.to == desti)){
			var {messages} = this.state;
			messages.push(chunk);
			console.log("MSGCONTAINER LOG msgReceived : " + messages);
			this.setState({messages});
		}else{
      var {users} = this.state;
			var {groups} = this.state;
			if(chunk.to.charAt(0) == "_"){
				for(var i=0 ; i<groups.length ; i++){
	        if(groups[i].name == chunk.to){
	          groups[i].active = true;
	        }
	      }
	      this.setState({groups});
			}else {
				for(var i=0 ; i<users.length ; i++){
	        if(users[i].name == chunk.from){
	          users[i].active = true;
	        }
	      }
	      this.setState({users});
			}
    }

  }

  onUpdateUserList(chunk, rm){
		var {users} = this.state;
		if(rm){
      for(var i=0 ; i<users.length ; i++){
        if(users[i].name == chunk){
          users.splice(i);
        }
      }
		}else{
			users.push({"name":chunk, "active":false});
		}
		this.setState({users})
	}

  onUpdateGroupList(chunk, rm){
		var {groups} = this.state;
		if(rm){
			var idx = groups.indexOf(chunk);
			groups.splice(idx);
		}else{
			groups.push({"name":chunk, "active":false});
		}
		this.setState({groups});
	}
}

export default AppStore;
