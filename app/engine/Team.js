class Team {
  constructor(name) {
    this.name = name;
    this.Operatives = [];
    this.Spymaster = null;
    this.maxOperatives = 4;
  }
  set name(name) {
    this.name = name;
  }
  get name() {
    return this.name;
  }

  // Player - instance of Player class
  // role : char
  // s - for spymaster
  // o - for operative
  assignPlayer(Player, role) {
    if (userId === null)
      throw ""
    if (role === 's') {
      if (this.Spymaster === null) this.Spymaster = Player;
      else throw "Spymaster is taken";
    } else if (role === 'o') {
      if (this.Operatives.length < this.maxOperatives)
        this.Operatives.push(Player);
      else throw "All Operatives are taken";
    } else throw "Character is not supported";
  }
}
