matches.forEach(function(m)
{
  var tag = addSelfClosingTag(config.tagName, m[0][1], m[0][0].length, -10);

  tag.setAttributes({
    'guild': m[1][0],
    'event': m[2][0]
  });
});
