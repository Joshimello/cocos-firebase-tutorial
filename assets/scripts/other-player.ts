const { ccclass, property } = cc._decorator;

@ccclass
export default class OtherPlayer extends cc.Component {
  @property(sp.Skeleton)
  playerSkeleton: sp.Skeleton = null;

  @property(cc.Label)
  playerNameLabel: cc.Label = null;

  private _playerName: string = "";
  private _databaseRef: firebase.database.Reference = null;
  private _targetPosition: cc.Vec3 = cc.v3(0, 0, 0);
  private _previousPosition: cc.Vec3 = cc.v3(0, 0, 0);
  private _lastState: string = "idle";

  private _lastUpdateTime: number = 0;
  private _disconnectThreshold: number = 500;
  private _interpolationFactor: number = 0.1;

  onLoad() {
    this.playerSkeleton.animation = "wait";
  }

  start() {}

  setPlayerName(name: string) {
    this._playerName = name;
    this.playerNameLabel.string = name;
    this.setupFirebaseListener();
  }

  // TODO-5: Implement Firebase database other player data listener
  private setupFirebaseListener() {
    // this._databaseRef = ...
    // this._databaseRef.on(..., ...);
  }

  // TODO-6: Implement Firebase database other player data update
  private onPlayerDataUpdate(snapshot: firebase.database.DataSnapshot) {
    // Get the snapshot value
    const playerData = null;
    if (!playerData) return;

    // Setting the positions and animation states from the database values
    this._previousPosition = this._targetPosition.clone();
    this._targetPosition = cc.v3(playerData.position.x, playerData.position.y);
    if (this._lastState !== playerData.state) {
      this._lastState = playerData.state;
      this.playerSkeleton.animation =
        playerData.state === "walking" ? "move" : "wait";
    }

    if (this._targetPosition.x !== this._previousPosition.x) {
      this.playerSkeleton.node.scaleX =
        this._targetPosition.x > this._previousPosition.x ? 0.75 : -0.75;
    }

    this._lastUpdateTime = playerData.lastUpdate || Date.now();
  }

  update(dt: number) {
    this.handleMovement(dt);
    this.checkDisconnection();
  }

  private handleMovement(dt: number) {
    if (!this._targetPosition.equals(this.node.position)) {
      const newPosition = cc.v3(
        cc.misc.lerp(
          this.node.position.x,
          this._targetPosition.x,
          this._interpolationFactor,
        ),
        cc.misc.lerp(
          this.node.position.y,
          this._targetPosition.y,
          this._interpolationFactor,
        ),
        0,
      );

      this.node.position = newPosition;
    }
  }

  private checkDisconnection() {
    const currentTime = Date.now();
    if (currentTime - this._lastUpdateTime > this._disconnectThreshold) {
      this.removePlayer();
    }
  }

  private removePlayer() {
    if (this._databaseRef) {
      this._databaseRef.off();
    }

    this.node.removeFromParent();
  }

  onDestroy() {
    if (this._databaseRef) {
      this._databaseRef.off();
    }
  }
}
