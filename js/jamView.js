/*
 * jamView v2.0  7.18  FlashMaj
 */

var JamView;


function jamView_load_init(){	
	/*
	 * default value
	 */
	let VIEW_TYPE="ob",
		SENSITIVITY=0.5,//鼠标移动1px旋转多少角度；
		DISTANCE=400;
	
	
	/*
	 * local obj
	 */
	function Local_JamView(spec){
		var that = this;
		
		//default spec
		this.spec={
			type:VIEW_TYPE,
			sensitivity:SENSITIVITY,
			distance:DISTANCE
		};
		
		//status
		this.running=false;
		this.isMouseDown=false;
		this.buttonType=undefined;
		this.physijs=false;
		
		//spec
		for(var name in spec){
			that.spec[name]=spec[name];
		}
		//必须属性
		this.scene=spec.scene;
		this.camera=spec.camera;
		this.domElement=spec.domElement;
		if(spec.targetObject){//fp视角必须属性
			this.targetObject=spec.targetObject;
			try{
				if(this.targetObject instanceof Physijs.Mesh)that.physijs=true;
			}catch(e){}
		}else{
			this.targetObject=new THREE.Object3D();
		}
		
		//obj
		this.eventManager=new EventManager(that);
		
		//fun
		this.takeON=takeON;//开启操作
		this.takeOFF=takeOFF;//关闭操作
		this.setTargetObject=setTargetObject;
		this.setDistance=setDistance;
		this.updateCameraRadian=updateCameraRadian;//根据镜头和目标对象的坐标更新镜头相对弧度，ob模式
		this.updateCameraPosition=updateCameraPosition;//根据镜头相对弧度更新镜头坐标，ob模式
		//init
		switch(this.spec.type){
			case "fp":{
				let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
				if(!havePointerLock){
					console.error("您的浏览器不支持第一人称视角!");
					return false;
				};
				
				that.pitchObject=new THREE.Object3D();
				document.addEventListener("pointerlockchange",function(e){pointerLockChange(e,that)},false);
				document.addEventListener("mozpointerlockchange",function(e){pointerLockChange(e,that)},false);
				document.addEventListener("webkitpointerlockchange",function(e){pointerLockChange(e,that)},false);
				break;
			}
		}
		
		Local_JamView.allViews.push(this);
	}
	Local_JamView.allViews=[];
	JamView=Local_JamView;
	
	/*
	 * eventManager
	 */
	function EventManager(obj){
		this.obj=obj;
		this.listening=false;
		this.eventListeners=[
			function(e){onMouseDown(e,obj);},
			function(e){onMouseUp(e,obj);},
			function(e){onMouseMove(e,obj);}
		];
		this.eventListeners[0].eventName="mousedown";
		this.eventListeners[1].eventName="mouseup";
		this.eventListeners[2].eventName="mousemove";
	}
	//eventListener
	function addEventListeners(obj){
		if(!obj.eventManager.listening){
			for(var i=0;i<obj.eventManager.eventListeners.length;i++){
				let eventListener = obj.eventManager.eventListeners[i];
				if(eventListener.eventName=="mousedown"){
					obj.domElement.addEventListener(eventListener.eventName,eventListener,false);
					continue;
				}
				window.addEventListener(eventListener.eventName,eventListener,false);
			}
			obj.eventManager.listening=true;
		}
	}
	function removeEventListeners(obj){
		if(obj.eventManager.listening){
			for(var i=0;i<obj.eventManager.eventListeners.length;i++){
				let eventListener = obj.eventManager.eventListeners[i];
				if(eventListener.eventName=="mousedown"){
					obj.domElement.removeEventListener(eventListener.eventName,eventListener);
					continue;
				}
				window.removeEventListener(eventListener.eventName,eventListener);
							}
			obj.eventManager.listening=false;
		}
	}
	
	/*
	 * eventFun
	 */
	function onMouseDown(e,obj){
		obj.isMouseDown=true;
		obj.buttonType=e.button;
		//-----
	}
	function onMouseUp(e,obj){
		obj.isMouseDown=false;
		//-----
		obj.buttonType=undefined;
	}
	var a=0;
	function onMouseMove(e,obj){
		let mouseX=e.pageX-obj.domElement.offsetLeft,
			mouseY=e.pageY-obj.domElement.offsetTop,
			movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
			movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		let sensitivity = obj.spec.sensitivity;
		//
		switch(obj.spec.type){
			case "ob":{
				if(obj.isMouseDown&&obj.buttonType==0){
					obj.cameraRadian.x+=movementY*sensitivity/180*Math.PI;
					obj.cameraRadian.y+=movementX*sensitivity/180*Math.PI;
					if(obj.cameraRadian.x>Math.PI*89/180)obj.cameraRadian.x=Math.PI*89/180;
					if(obj.cameraRadian.x<-Math.PI*89/180)obj.cameraRadian.x=-Math.PI*89/180;
					obj.updateCameraPosition();
				}
				break;
			}
			case "fp":{
				if(isPointerLock()){
					obj.targetObject.rotation.y -= movementX * sensitivity/180*Math.PI;
					obj.pitchObject.rotation.x -= movementY * sensitivity/180*Math.PI;
					if(obj.pitchObject.rotation.x>=Math.PI/2)obj.pitchObject.rotation.x=Math.PI/2;
					if(obj.pitchObject.rotation.x<=-Math.PI/2)obj.pitchObject.rotation.x=-Math.PI/2;
					if(obj.physijs){
						obj.targetObject.__dirtyPosition=true;
						obj.targetObject.__dirtyRotation=true;
					}
				}
				break;
			}
		}		
	}
	function pointerLockChange(e,obj){
		if (isPointerLock()){
			//锁定
			if(obj.spec.onPointerLock)obj.spec.onPointerLock();
		} else {
			//非锁定
			if(obj.running){
				obj.takeOFF();
			}
			if(obj.spec.onPointerUnLock)obj.spec.onPointerUnLock();
		}
	}
	
	
	/*
	 * jamView.fun
	 */
	function takeON(){
		let obj = this;
		if(!obj.running)addEventListeners(obj);
		//如果是ob视角则update相对弧度数据
		if(obj.spec.type=="ob")obj.updateCameraRadian();
		//如果是fp视角则锁上鼠标
		if(obj.spec.type=="fp"){
			if(!obj.running){
				obj.pitchObject.rotation.x=obj.pitchObject.rotation.y=obj.pitchObject.rotation.z=0;
				obj.camera.rotation.x=obj.camera.rotation.y=obj.camera.rotation.z=0;
				obj.pitchObject.position.set(0,0,0);
				obj.camera.position.set(0,0,0);
				obj.targetObject.add(obj.pitchObject);
				obj.pitchObject.add(obj.camera);
			}
			takePointerLockON();
		};
		obj.running=true;
	}
	function takeOFF(){
		let obj = this;
		removeEventListeners(obj);
		if(obj.spec.type=="ob"){
			
		}
		if(obj.spec.type=="fp"){
			if(isPointerLock()){
				takePointerLockOFF();
			};
			obj.pitchObject.remove(obj.camera)
			obj.targetObject.remove(obj.pitchObject);
		}
		obj.isMouseDown=false;
		obj.running=false;
	}
	function setDistance(distance){
		this.spec.distance=distance;
	}
	function setTargetObject(targetObject){
		var that = this;
		if(that.spec.type=="fp"&&that.running){
			that.targetObject.remove(that.pitchObject);
			targetObject.add(that.pitchObject);
		}
		this.targetObject=targetObject;
		try{
			if(targetObject instanceof Physijs.Mesh)that.physijs=true;
		}catch(e){}
	}
	function updateCameraRadian(updateDistance){//相对于轴
		let position0 = this.targetObject.position,
			position1 = this.camera.position;
		
		let dy=position1.y-position0.y,
			dx=position1.x-position0.x,
			dz=position1.z-position0.z;
			
		let dd=Math.sqrt(Math.pow(dx,2)+Math.pow(dz,2)),
			dl=Math.sqrt(Math.pow(dy,2)+Math.pow(dd,2));
			
		let radianX,radianY;
		if(dz>=0){
			radianY=Math.acos(dx/dd);
		}else{
			radianY=-Math.acos(dx/dd);
		}
		if(dy>=0){
			radianX=Math.acos(dd/dl);
		}else{
			radianX=-Math.acos(dd/dl);
		}
		if(updateDistance){
			this.spec.distance=dl;
		}
		this.cameraRadian={
			x:radianX,
			y:radianY
		}
	}
	function updateCameraPosition(){
		let camera = this.camera,
			targetObj = this.targetObject,
			distance = this.spec.distance,
			radian = this.cameraRadian,
			dd = distance*Math.cos(radian.x);
		
		camera.position.y=targetObj.position.y+distance*Math.sin(radian.x);
		camera.position.x=targetObj.position.x+dd*Math.cos(radian.y);
		camera.position.z=targetObj.position.z+dd*Math.sin(radian.y);
		camera.lookAt(targetObj.position);
	}
	
	/*
	 * other fun
	 */
	function takePointerLockON(){
		document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
		document.body.requestPointerLock();
	}
	function takePointerLockOFF(){
		document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
		document.body.exitPointerLock();
	}
	function isPointerLock(){
		return (document.pointerLockElement===document.body||document.mozPointerLockElement===document.body||document.webkitPointerLockElement===document.body);
	}
}
jamView_load_init();

/*
 * require
 */
try{
	define(function(){
		return JamView;
	})
}catch(e){
	console.log("JamView：非require方式加载.");
}