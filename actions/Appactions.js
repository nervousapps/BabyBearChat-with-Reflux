import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';

var Actions = Reflux.createActions([
	'name',
	'rightuser',
	'clearMess',
  'message',
  'updateUserList',
  'updateGroupList'
]);

export default Actions;
