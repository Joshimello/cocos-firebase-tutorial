import Player from "./player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {
  @property(cc.EditBox)
  nameInput: cc.EditBox = null;

  @property(cc.Prefab)
  playerPrefab: cc.Prefab = null;

  @property(cc.Node)
  spawnNode: cc.Node = null;

  // onLoad () {}

  start() {}

  // update (dt) {}

  onLoginClick() {
    const newPlayer = cc.instantiate(this.playerPrefab);
    newPlayer.parent = this.spawnNode;
    newPlayer.position.y = -100;
    newPlayer.getComponent(Player).setPlayerName(this.nameInput.string);
    this.node.active = false;
  }
}
