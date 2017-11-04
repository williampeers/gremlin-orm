const Gremlin = require('gremlin');
const VertexModel = require('./vertex-model');
const EdgeModel = require('./edge-model');

class Gorm {
  constructor(dialect, port, url, options) {
    const argLength = arguments.length;
    if (argLength == 0) {
      return null;
    } else if (argLength == 1) {
      this.client = Gremlin.createClient();
    } else if (argLength == 3) {
      this.client = Gremlin.createClient(port, url);
    } else {
      this.client = Gremlin.createClient(port, url, options);
    }

    if (Array.isArray(dialect)) {
      this.dialect = dialect[0];
      this.partition = dialect[1];
    }
    else {
      this.dialect = dialect;
    }

  }

  define(label, schema) {
    return defineVertex(label, schema);
  }

  defineVertex(label, schema) {
    return new VertexModel(label, schema, this);
  }

  defineEdge(label, schema) {
    return new EdgeModel(label, schema, this);
  }

  function makeNormalJSON(gremlinResponse, parentClass) {
  let data = [];
  gremlinResponse.forEach((grem) => {
    let object = Object.create(parentClass);
    object.id = grem.id;
    object.label = grem.label;

    let currentPartition = parentClass.partition ? parentClass.partition : '';
    Object.keys(grem.properties).forEach((propKey) => {
      if (propKey != currentPartition) {
        object[propKey] = grem.properties[propKey][0].value;
      }
    });
    data.push(object);
  })
  return data;
}

}

module.exports = Gorm;
