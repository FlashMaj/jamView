jamView  v2.0.0  2018.07.19  FalshMaj  qq:1106219402

����three.js���ӽǲ������
����"ob"(�۲��ӽ�)��"fp"(��һ�˳��ӽ�)����ģʽ


new JamView({  //�����ӽǶ���
	scene:scene,//���������three����
	camera:camera,//�������,three��ͷ
	domElement��domElement��//ob�ӽǱ����������������dom����
	targetObject:targetObject,//fp�ӽǱ����������ͷ�̶�����ob�ӽǹ۲����(Ĭ��Ϊ����ԭ��)
	type:type,//�Ǳ���������ӽ����ͣ�Ĭ��Ϊ"ob"
});

���������
	sensitivity����������ȣ�����ƶ�1px��ת�ĽǶ�
	distance����ͷ����ob�۲����ľ���


������
jamView.takeON();//�����ӽǲ��� ���ٴν���fpģʽ��
jamView.takeOFF();//�ر��ӽǲ���
jamView.setDistance();//���ù۲����
jamView.setTargetObject();//����Ŀ�����
jamView.updateCameraRadian(updateDistance);//���ݵ�ǰ��ͷ��Ŀ������������¾�ͷ�Ƕ���Ϣ(����������������˾�ͷ��Ŀ��������꣬���ڿ����ӽǲ���֮ǰ����һ�θ���Ϣ),updateDistance��ѡ�������Ƿ���¾��룬Ĭ��false