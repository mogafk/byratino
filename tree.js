import uuid from './utils/uuid';

class Node {
    constructor({
        id,
        tree,
        parent,
        ...extra
    } = data) {
        this.id = id;
        this.tree = tree;

        this.data = extra;

        this.childs = [];
        this.parent = parent || null;
    }

    addChild(data) {
        const node = this.tree.addNode({
            ...data,
            parent: this.id
        });
        this.childs.push(node);

        return node;
    }

    getChilds() {
        return this.childs.length ? this.childs : null;
    }

    getParent() {
        return this.tree.getNodeById(this.parent);
    }
}

class Tree {
    constructor() {
        this.data = {};
        this.root = null;
    }

    addNode(data) {
        const id = uuid();
        this.data[id] = new Node({
            ...data, 
            id, 
            tree: this
        });

        if (this.root === null) {
            this.root = this.data[id];
        }

        return this.data[id];
    }

    getNodeById(id) {
        return this.data[id] || null;
    }
}

class Btrie extends Tree {
    constructor() {
        super();
        super.addNode();

        this.begins = [];
        this.terminates = [];
    }

    // TODO: оптимизировать в хеш
    findSomeBegin(string) {
        const { begins } = this;

        for (let i = 0; i < begins.length; i++) {
            const id = begins[i];
            const node = this.getNodeById(id);

            if (node.data.string === string) {
                return node;
            }
        }

        return null;
    }

    addNode(data = {}) {
        let node;
        if (data.parent) {
            node = super.addNode(data);

            if (data.terminated) this.terminates.push(node.id);
        } else {
            const someBegins = data.begins ? this.findSomeBegin(data.string) : null;
            if (someBegins !== null) return someBegins;
            // else this.begins.push(node.id);
            
            
            const parent = this.root;
            node = parent.addChild(data);
            this.begins.push(node.id);

/*
            const someBegins = data.begins ? this.findSomeBegin(data.string) : null;
            const parent = someBegins || this.root;

            node = parent.addChild(data);
            
            if (someBegins === null) this.begins.push(node.id);*/
        }

        return node;
    }

    // todo: вынести в Tree
    removeNode(id) {
        const node = this.getNodeById(id);
        this.data[id] = null;

        // обнуляем родителя у детей текущего узла
        const childs = node.getChilds();
        childs.forEach(childs => {
            childs.parent = null;
        });
        
        // удаляем текущий узел из детей родителя
        const parent = node.getParent();
        parent.childs = parent.getChilds().filter(childNode => childNode !== node);

        return {parent, childs};
    }
    // todo: safeRemoveNode?


    compreseChildren(parent, childs) {
        console.log('compreseChildren iter', childs.length)
        if (childs.length === 0) return;
        // TODO: конкатенация с parent, если ребенок всего 1
        
        let grouped = childs.reduce((acc, node) => {
            const str = node.data.string;
            if (typeof acc[str] === 'undefined') acc[str] = [];
            acc[str].push(node);

            return acc;
        }, {})

        console.log('grouped', grouped);

        // grouped = Object.values(grouped);
        Object.values(grouped)
            .filter(group => group.length > 1)
            .forEach(group => {
                const refNode = group[0];
                for (let i = 1; i < group.length; i++) {
                    const node = group[i];
                    const { childs, parent } = this.removeNode(node.id);
                    // забираем детей у удаленного узла
                    // TODO: terminating node
                    childs.forEach(child => child.parent = refNode.id);
                    console.log('refNode.childs', refNode.childs)
                    console.log('childs', childs)
                    refNode.childs = refNode.childs.concat(childs);
                }

                if (refNode.childs.length) {
                    this.compreseChildren(refNode, refNode.getChilds);
                }

            });


        Object.values(grouped)
            .filter(group => group.length === 1) 
            .forEach(group => 
                this.compreseChildren(group[0], group[0].getChilds())
            );
    }


    // node - не обяз
    comprese(node) {
        node = node || this.root;
        this.compreseChildren(this.root, node.getChilds());
    }

    exportToD3() {

    }

    consoleAllBeginsChars() {
        this.begins.forEach(id => {
            console.log(
                this.getNodeById(id).data.string
            );
        })
    }
}

export default Btrie;
