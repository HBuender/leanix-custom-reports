class DataIndex {

	constructor(data) {
		this.byID = {};
		for (let key in data) {
			const value = data[key];
			const index = {
				realData: data[key],
				nodes: [],
				byID: {}
			};
			this[key] = index;
			if (!Array.isArray(value.edges)) {
				continue;
			}
			value.edges.forEach(((e) => {
					if (!e.node) {
						return;
					}
					const node = e.node;
					index.nodes.push(node);
					resolveNestedInRelations(node);
					if (!node.id) {
						return;
					}
					index.byID[node.id] = node;
					this.byID[node.id] = node;
				}).bind(this));
		}
	}

	getParent(fromOrigin, from) {
		// v workspace note: only one parent possible
		if (!this[fromOrigin]) {
			return;
		}
		const node = this[fromOrigin].byID[from];
		if (!node) {
			return;
		}
		const parentRel = node.relToParent;
		if (!parentRel) {
			return;
		}
		const parentRelNodes = parentRel.nodes;
		if (!parentRelNodes || !Array.isArray(parentRelNodes)) {
			return;
		}
		for (let i = 0; i < parentRelNodes.length; i++) {
			const parentRelNodeID = parentRelNodes[i].id;
			if (!parentRelNodeID) {
				continue;
			}
			return this.byID[parentRelNodeID];
		}
	}

	includesTag(node, tag) {
		if (!node.tags || !Array.isArray(node.tags)) {
			return false;
		}
		for (let i = 0; i < node.tags.length; i++) {
			const tagObj = node.tags[i];
			if (tagObj && tagObj.name === tag) {
				return true;
			}
		}
		return false;
	}
}

function resolveNestedInRelations(node) {
	for (let key in node) {
		const value = node[key];
		if (!value || !Array.isArray(value.edges)) {
			continue;
		}
		if (value.edges.length === 0) {
			node[key] = null;
			continue;
		}
		const index = {
			readData: value,
			nodes: [],
			byID: {}
		};
		node[key] = index;
		value.edges.forEach((e) => {
			const node = e.node;
			if (!node.factSheet) {
				return;
			}
			index.nodes.push(node.factSheet);
			resolveNestedInRelations(node.factSheet);
			if (!node.factSheet.id) {
				return;
			}
			index.byID[node.factSheet.id] = node.factSheet;
		});
	}
}

export default DataIndex;
