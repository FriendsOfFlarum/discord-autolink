matches.forEach(function(m)
{
  var tag = addSelfClosingTag(config.tagName, m[0][1], m[0][0].length, -10);

  tag.setAttribute('code', m[1][0]);

  if (m[2] && m[2][0])
  {
    tag.setAttribute('event', m[2][0]);
  }
});
