matches.forEach(function(m)
{
  var tag = addSelfClosingTag(config.tagName, m[0][1], m[0][0].length, -10);

  tag.setAttributes({
    'guild': m[1][0],
    'channel': m[2][0],
    'message': m[3][0]
  });
});
