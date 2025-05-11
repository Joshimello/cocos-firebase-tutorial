const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
  @property(cc.Float)
  playerMoveSpeed: number = 200;

  @property(sp.Skeleton)
  playerSkeleton: sp.Skeleton = null;

  @property(cc.Label)
  playerNameLabel: cc.Label = null;

  private _isNamed = false;
  private _currentDirection: cc.Vec2 = cc.v2(0, 0);
  private _isMoving: boolean = false;
  private _prevMoving: boolean = false;

  private _playerName: string = "";
  private _syncInterval: number = 0.1;
  private _timeSinceLastSync: number = 0;

  onLoad() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
  }

  start() {
    this.playerSkeleton.animation = "wait";
  }

  update(dt: number) {
    this.handleMovement(dt);
    this.handleAnimation(dt);
    this.updateDatabase(dt);
  }

  // TODO-2: Implement Firebase database local player data uploading
  private updateDatabase(dt: number) {
    // We should not sync the database if the player is not named (not logged in)
    if (!this._isNamed) return;

    // We should sync the database only every this._syncInterval seconds to avoid overloading the database
    this._timeSinceLastSync += dt;
    // if (...) return;
    this._timeSinceLastSync = 0;

    // Next, construct the player data object to be sent to the database
    const playerData = {
      name: this._playerName,
      // How to get the position of the node?
      position: {
        x: null,
        y: null,
      },
      state: this._isMoving ? "walking" : "idle",
      lastUpdate: firebase.database.ServerValue.TIMESTAMP,
    };

    // Finally, send the player data to the database
    // the reference to the player's data in the database should be ("players/" + this._playerName)
    // how should we set the data?

    // firebase.database().???
  }

  setPlayerName(name: string) {
    this.playerNameLabel.string = name;
    this._playerName = name;
    this._isNamed = true;
  }

  private onKeyDown(event: cc.Event.EventKeyboard) {
    switch (event.keyCode) {
      case cc.macro.KEY.w:
      case cc.macro.KEY.up:
        this._currentDirection.y = 1;
        break;
      case cc.macro.KEY.s:
      case cc.macro.KEY.down:
        this._currentDirection.y = -1;
        break;
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this._currentDirection.x = -1;
        break;
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this._currentDirection.x = 1;
        break;
    }

    if (
      event.keyCode === cc.macro.KEY.w ||
      event.keyCode === cc.macro.KEY.s ||
      event.keyCode === cc.macro.KEY.a ||
      event.keyCode === cc.macro.KEY.d
    ) {
      this._isMoving = true;
    }
  }

  private onKeyUp(event: cc.Event.EventKeyboard) {
    switch (event.keyCode) {
      case cc.macro.KEY.w:
      case cc.macro.KEY.up:
        if (this._currentDirection.y === 1) this._currentDirection.y = 0;
        break;
      case cc.macro.KEY.s:
      case cc.macro.KEY.down:
        if (this._currentDirection.y === -1) this._currentDirection.y = 0;
        break;
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        if (this._currentDirection.x === -1) this._currentDirection.x = 0;
        break;
      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        if (this._currentDirection.x === 1) this._currentDirection.x = 0;
        break;
    }

    if (this._currentDirection.x === 0 && this._currentDirection.y === 0) {
      this._isMoving = false;
    }
  }

  private handleMovement(dt: number) {
    if (!this._isMoving) return;

    let normalizedDir = this._currentDirection;
    if (this._currentDirection.mag() > 0) {
      normalizedDir = this._currentDirection.normalize();
    }

    const newPos = this.node.position.add(
      cc.v3(
        normalizedDir.x * this.playerMoveSpeed * dt,
        normalizedDir.y * this.playerMoveSpeed * dt,
      ),
    );
    this.node.setPosition(newPos);

    this.updateFacingDirection();
  }

  private handleAnimation(dt: number) {
    if (this._isMoving && !this._prevMoving) {
      this.playerSkeleton.animation = "move";
    } else if (!this._isMoving && this._prevMoving) {
      this.playerSkeleton.animation = "wait";
    }
    this._prevMoving = this._isMoving;
  }

  private updateFacingDirection() {
    if (this.playerSkeleton && this._currentDirection.x !== 0) {
      this.playerSkeleton.node.scaleX =
        this._currentDirection.x > 0 ? 0.75 : -0.75;
    }
  }
}
