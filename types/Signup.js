class Player {
  constructor(obj) {
    this.discordId = '';
    this.battleTag = '';
    this.region = '';
    this.signupMsgId = '';
    this.signedUpOn = '';
    this.confirmedOn = '';
    this.confirmedBy = '';
    this.tankRank = '';
    this.damageRank = '';
    this.supportRank = '';
    this.gamesPlayed = 0;
    this.screenshot = '';
    Object.assign(this, obj);
  }
}

module.exports = Player;
