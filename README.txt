jamView  v2.0.0  2018.07.19  FalshMaj  qq:1106219402

基于three.js的视角操作插件
现有"ob"(观察视角)、"fp"(第一人称视角)两种模式


new JamView({  //创建视角对象
	scene:scene,//必须参数，three场景
	camera:camera,//必须参数,three镜头
	domElement：domElement，//ob视角必须参数，被操作的dom对象
	targetObject:targetObject,//fp视角必须参数，镜头固定对象；ob视角观察对象(默认为坐标原点)
	type:type,//非必须参数，视角类型，默认为"ob"
});

其余参数：
	sensitivity：鼠标灵敏度，鼠标移动1px旋转的角度
	distance：镜头距离ob观察对象的距离


方法：
jamView.takeON();//开启视角操作 （再次进入fp模式）
jamView.takeOFF();//关闭视角操作
jamView.setDistance();//设置观察距离
jamView.setTargetObject();//设置目标对象
jamView.updateCameraRadian(updateDistance);//根据当前镜头和目标对象的坐标更新镜头角度信息(若经其他操作变更了镜头或目标对象坐标，需在开启视角操作之前更新一次该信息),updateDistance可选参数，是否更新距离，默认false