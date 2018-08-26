function IndentalNode(id,rect)
{
  Node.call(this,id,rect);

  this.glyph = "M60,60 L60,60 L240,60 L240,240 L60,240 Z M120,120 L120,120 L180,120 M120,180 L120,180 L180,180 M120,150 L120,150 L180,150"

  this.answer = function(q)
  {
    if(!DATABASE[this.id]){
      console.warn(`Missing /database/${this.id}.js`)
      return null;
    }
    return new Parser(DATABASE[this.id]).result;
  }

  function Parser(data)
  {
    this.result = build(data.split("\n").map(liner))

    function build(lines)
    {
      // Assoc lines
      var stack = {}
      var target = lines[0]
      for(id in lines){
        var line = lines[id]
        if(line.skip){ continue; }
        target = stack[line.indent-2];
        if(target){ target.children.push(line) }
        stack[line.indent] = line
      }

      // Format
      var h = {}
      for(id in lines){
        var line = lines[id];
        if(line.skip || line.indent > 0){ continue; }
        h[line.content.toUpperCase()] = format(line)
      }
      return h
    }

    function format(line)
    {
      var a = [];
      var h = {};
      for(id in line.children){
        var child = line.children[id];
        if(child.key){ h[child.key.toUpperCase()] = child.value }
        else if(child.children.length == 0){ a.push(child.content) }
        else{ h[child.content.toUpperCase()] = format(child) }
      }
      return a.length > 0 ? a : h
    }

    function liner(line)
    {
      return {
        indent:line.search(/\S|$/),
        content:line.trim(),
        skip:line == "" || line.substr(0,1) == "~",
        key:line.indexOf(" : ") > -1 ? line.split(" : ")[0].trim() : null,
        value:line.indexOf(" : ") > -1 ? line.split(" : ")[1].trim() : null,
        children:[]
      }
    }
  }
}

var DATABASE = {};