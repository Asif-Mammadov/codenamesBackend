exports.playersHere = (blueOps, redOps, blueSpy, redSpy) => {
    if (
      blueOps.length === 0 ||
      redOps.length === 0 ||
      blueSpy.socketID === null ||
      redSpy === null
    ) return false;
    return true;
}