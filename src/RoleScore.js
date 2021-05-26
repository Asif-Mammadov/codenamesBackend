class RoleScore {
  constructor(right, wrong, innocent, assassin) {
    this.right = right;
    this.wrong = wrong;
    this.i = innocent;
    this.a = assassin;
  }
  getRight(){
    return this.right;
  }
  getWrong(){
    return this.wrong;
  }
  getInnocent(){
    return this.i;
  }
  getAssassin(){
    return this.a;
  }
  setRight(right){
    this.right = right;
  }
  setWrong(wrong){
    this.wrong = wrong;
  }
  setInnocent(innocent){
    this.i = innocent;
  }
  setAssassin(assassin){
    this.a = assassin;
  }
}

module.exports = {
  RoleScore: RoleScore,
};
