import * as d3 from 'd3';

window.d3 =d3;
import Btrie from './tree';

const input = ['молоко', 'молоток', 'мороженное', 'изба', 'избушка'];

function main() {

    const tree = new Btrie();

    let stopped = 0

    for(let i = 0; i < input.length; i++) {
        const word = input[i];
        let wordTreeCursor = tree.addNode({
                string: word[0],
                begins: true,
        });
        for(let ci = 1; ci < word.length; ci++) {
            wordTreeCursor = wordTreeCursor.addChild({
                string: word[ci],
                terminated: ci === (word.length-1)
            });
        }
    }
    console.log(tree);
    window.tree = tree;

    tree.consoleAllBeginsChars();
    renderTree(tree);

    tree.comprese();
    renderTree(tree);
}

function renderTree(tree) {
    const treeData = Object.values(tree.data).filter(d => !!d);

    var root = d3.stratify()
        .id(d => d.id)
        .parentId((d) => d.parent)
    // (Object.values(tree.data));
    (treeData);

    console.log('d3 root', root);

    var svg = d3.select("body").append("svg")
        .attr("width", 370)
        .attr("height", 1940)    
        .append("g")
        // отступы графики от края svg
        .attr("transform", "translate(" + 30 + "," + 30 + ")");

    
    var d3tree = d3.tree()
        .size([340, 900]);
    window.d3tree = d3tree;

    var treeLayer = d3tree(root);
    window.treeLayer = treeLayer;
    console.log('treeLayer', treeLayer);

    var nodes = treeLayer.ancestors().concat(treeLayer.descendants());

    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });

    nodeEnter.append("circle")
        .attr("r", 10)
        .style("fill", "#fff");

    nodeEnter.append("text")
        .attr("x", function(d) { 
            return d.children || d._children ? 3 : -3; 
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { 
            return d.children || d._children ? "end" : "start"; 
        })
        .text(function(d) { return d.data.data.string; })
        .style("fill-opacity", 1);

    var link = svg.selectAll("path.link")
        .data(treeLayer.links(), function(d) { return d; });

    // возможно не хватает контекста
    var line = d3.line()
        .x(d => {/*console.log('line d', d);*/ return [d.source.x, d.target.x]})
        .y(d => [d.source.y, d.target.y]);

    // var linkFn = d3.linkHorizontal()
    //     .x(function(d) { return d.y; })
    //     .y(function(d) { return d.x; });

    var linkFn = d3.linkVertical()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    window.line = line;
    // Enter the links.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => {
            // console.log('link enter data', d);
            // console.log('some line ', line(d));
            return linkFn(d);
        });
}
window.onload = main;   
// main();
// window.onload = renderTree;   
// renderTree();