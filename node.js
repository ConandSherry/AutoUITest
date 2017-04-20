let node = function(currentNode) {
    this.tagName = currentNode.tagName.toLowerCase();
    this.style = "";
    for (let key in currentNode.style) {
        this.style += key + ":" + currentNode.style[key] + ",";
    }
    this.attr = "";
    this.class = "";
    this.childNodes = [];

    for (let key in currentNode._attributes.null) {
        if (key == "class") {
            this.class = currentNode._attributes.null[key].value;
        } else {
            this.attr += key +
                '="' +
                currentNode._attributes.null[key].value +
                '" ';
        }
    }
    let self = this;
    currentNode.childNodes.forEach(function(item) {
        if (item.constructor.name == "DOMText") {
            self.childNodes.push(item.data);
        } else {
            self.childNodes.push(new node(item));
        }
    });
};
node.prototype.toString = function() {
    var string = "<" + this.tagName;
    this.attr ? (string += " " + this.attr) : "";
    this.class ? (string += " " + 'class="' + this.class + '"') : "";
    this.style ? (string += " " + 'style="' + this.style + '"') : "";
    string += ">";
    this.childNodes.forEach(function(item) {
        string += item.toString();
    });
    string += "</" + this.tagName + ">";
    return string;
};
module.exports = node;
