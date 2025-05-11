import Player from "./player";
import OtherPlayer from "./other-player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property(cc.Prefab)
  playerPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  otherPlayerPrefab: cc.Prefab = null;

  @property(cc.Node)
  spawnNode: cc.Node = null;

  @property(cc.Node)
  loginNode: cc.Node = null;

  @property(cc.EditBox)
  nameInput: cc.EditBox = null;

  private _localPlayerName: string = "";
  private _otherPlayers: Map<string, cc.Node> = new Map();
  private _playersRef: firebase.database.Reference = null;

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
    console.log("Firebase initialized:", app);

    this._playersRef = firebase.database().ref("players");
  }

  stringRandomSuffix(string: string) {
    const randomInt = Math.floor(Math.random() * 10000);
    const suffix = randomInt.toString().padStart(4, "0");
    return `${string}_${suffix}`;
  }

  handlePlayerLogin() {
    if (!this.nameInput.string) this.nameInput.string = "uwu";
    const newName = this.stringRandomSuffix(this.nameInput.string);

    const newPlayer = cc.instantiate(this.playerPrefab);
    newPlayer.parent = this.spawnNode;
    newPlayer.position.y = -100;
    newPlayer.getComponent(Player).setPlayerName(newName);

    this._localPlayerName = newName;
    this.startListeningForPlayers();
    console.log(`Local player logged in as: ${newName}`);

    this.loginNode.active = false;
  }

  startListeningForPlayers() {
    this._playersRef.on("child_added", this.onPlayerAdded.bind(this));
    this._playersRef.on("child_removed", this.onPlayerRemoved.bind(this));
  }

  onPlayerAdded(snapshot: firebase.database.DataSnapshot) {
    const playerName = snapshot.key;
    const playerData = snapshot.val();

    // Skip if this is the local player
    if (playerName === this._localPlayerName) return;

    // Skip if we already have this player
    if (this._otherPlayers.has(playerName)) return;

    console.log(`New player detected: ${playerName}`);

    // Create a new player instance
    const newPlayerNode = cc.instantiate(this.otherPlayerPrefab);
    newPlayerNode.parent = this.spawnNode;

    // Set initial position if available
    if (playerData.position) {
      newPlayerNode.setPosition(playerData.position.x, playerData.position.y);
    }

    // Set player name
    const otherPlayerComponent = newPlayerNode.getComponent(OtherPlayer);
    otherPlayerComponent.setPlayerName(playerName);

    // Store reference to this player
    this._otherPlayers.set(playerName, newPlayerNode);
  }

  onPlayerRemoved(snapshot: firebase.database.DataSnapshot) {
    const playerName = snapshot.key;

    // Skip if this is the local player
    if (playerName === this._localPlayerName) return;

    console.log(`Player disconnected: ${playerName}`);

    // Find and remove the player node
    const playerNode = this._otherPlayers.get(playerName);
    if (playerNode) {
      playerNode.removeFromParent(true);
      this._otherPlayers.delete(playerName);
    }
  }

  onDestroy() {
    if (this._playersRef) {
      this._playersRef.off();
    }
  }
}
