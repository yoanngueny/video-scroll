export function calcRatioToCover(sourceWidth, sourceHeight, destinationWidth, destinationHeight) {
  var ratio;
  if (sourceWidth < sourceHeight) {
    ratio = destinationWidth / sourceWidth
    if ((sourceHeight * ratio) < destinationHeight)
      ratio = destinationHeight / sourceHeight
  }
  else { // (sourceHeight <= sourceWidth)
    ratio = destinationHeight / sourceHeight
    if ((sourceWidth * ratio) < destinationWidth)
      ratio = destinationWidth / sourceWidth
  }
  return ratio;
}