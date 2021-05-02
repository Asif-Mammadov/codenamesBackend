class UserIdError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserIdError";
    this.message = message;
  }

}
