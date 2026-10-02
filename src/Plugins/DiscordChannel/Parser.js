matches.forEach(function(m)
{
  var tag = addSelfClosingTag(config.tagName, m[0][1], m[0][0].length, -10);
  var hasMessage = !!(m[3] && m[3][0]);

  tag.setAttributes({
    'guild': m[1][0],
    'channel': m[2][0],
    'type': hasMessage ? 'message' : 'channel'
  });

  if (hasMessage)
  {
    tag.setAttribute('message', m[3][0]);
  }
});
