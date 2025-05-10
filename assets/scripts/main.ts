const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property(cc.Label)
  label: cc.Label = null;

  @property
  text: string = "hello";

  onLoad() {}

  start() {
    const firebaseConfig = {
      apiKey: "AIzaSyBzVhYR1jAjItjrg2KD2HM1CDfefhgR3_k",
      authDomain: "cocosfirebasetutorial.firebaseapp.com",
      databaseURL:
        "https://cocosfirebasetutorial-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "cocosfirebasetutorial",
      storageBucket: "cocosfirebasetutorial.firebasestorage.app",
      messagingSenderId: "806550740126",
      appId: "1:806550740126:web:823858b09e4593a82fef8f",
    };

    const app = firebase.initializeApp(firebaseConfig);
    console.log(app);

    const database = firebase.database();
    console.log(database);
  }

  // update (dt) {}
}
