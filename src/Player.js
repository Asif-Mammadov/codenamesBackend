class Player {
  constructor(userId, isHost) {
    if (userId === null) throw new UserIdError("The user is null");
    this.userId = userId;
    this.isHost = isHost;
  }
}
