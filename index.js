var defined = require('defined');

module.exports = function (babel, opts) {
  if (!opts) opts = {};
  var factory = defined(opts.factory, opts.jsxPragma);
  var t = babel.types;
  return new babel.Transformer('jsx-factory', {
    JSXElement: function transform (node) {
      if (factory === undefined && this.state && this.state.opts) {
        factory = defined(this.state.opts.factory, this.state.opts.jsxPragma);
      }
      if (factory === undefined) throw new Error(
        'factory or jsxPragma must be configured'
      );
      if (/^[A-Z]/.test(node.openingElement.name.name)) {
        return t.callExpression(
          t.identifier(factory),
          [
            t.identifier(node.openingElement.name.name),
            t.objectExpression(node.openingElement.attributes)
          ]
        );
      }
 
      return t.callExpression(
        t.identifier(factory),
        [
          t.literal(node.openingElement.name.name),
          t.objectExpression(node.openingElement.attributes),
          t.arrayExpression(node.children.map(childf))
        ]
      );
 
      function childf (c) {
        if (c.type === 'JSXElement') {
          return transform(c);
        }
        else if (c.type === 'Literal') {
          return t.literal(c.value); // for some reason necessary
        }
        else return c;
      }
    }
  });
};
