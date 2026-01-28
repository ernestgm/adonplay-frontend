// PsdJsonEditor.js mejorado para manejar jerarquías

export class PsdJsonEditor {
    constructor(jsonData) {
        // Clon profundo para no afectar el objeto original externamente
        this.data = JSON.parse(JSON.stringify(jsonData));
        this.hierarchy = [];
        this._initialize();
    }

    _initialize() {
        // 1. Mapeamos todos los nodos por su índice para acceso rápido
        const nodeMap = new Map();
        this.data.descendants.forEach((node, idx) => {
            node._originalIdx = idx;
            node._children = [];
            // Sincronizamos el valor del texto a una propiedad de primer nivel 'value'
            // Normalizamos saltos de línea (\r de PSD a \n de Web)
            if (node.text) {
                let rawValue = String(node.text.value);
                node.value = rawValue
                    .replace(/\\r/g, '\n')
                    .replace(/\r/g, '\n')
                    .replace(/\n\n/g, '\n');

            } else {
                node.value = "";
            }
            nodeMap.set(idx, node);
        });

        // 2. Construimos el árbol real usando parentNodeIndex
        const rootNodes = [];
        this.data.descendants.forEach((node) => {
            if (node.parentNodeIndex === null || node.parentNodeIndex === -1) {
                rootNodes.push(node);
            } else {
                const parent = nodeMap.get(node.parentNodeIndex);
                if (parent) parent._children.push(node);
            }
        });

        this.hierarchy = rootNodes;
    }

    /**
     * Retorna la estructura de árbol para que la UI pueda
     * renderizar grupos dentro de grupos.
     */
    getHierarchy() {
        return this.hierarchy;
    }

    /**
     * Retorna solo las capas que son editables (texto), 
     * pero organizadas por jerarquía si es posible, 
     * o simplemente expone la jerarquía para que la UI filtre.
     */
    getEditableHierarchy(nodes = this.hierarchy) {
        const editable = [];
        nodes.forEach(node => {
            if (node.type === 'text') {
                editable.push({
                    id: node._originalIdx,
                    name: node.name,
                    value: node.text?.value?.replace(/\r/g, '\n') || "",
                    type: 'text'
                });
            } else if (node._children && node._children.length > 0) {
                const childrenEditable = this.getEditableHierarchy(node._children);
                if (childrenEditable.length > 0) {
                    editable.push({
                        id: node._originalIdx,
                        name: node.name,
                        type: 'group',
                        children: childrenEditable
                    });
                }
            }
        });
        return editable;
    }

    /**
     * Método de compatibilidad para obtener lista plana de editables
     */
    getEditableLayers() {
        return this.data.descendants
            .map((node, idx) => ({ node, idx }))
            .filter(({ node }) => node.type === 'text')
            .map(({ node, idx }) => ({
                id: idx,
                name: node.name,
                value: node.text?.value?.replace(/\r/g, '\n') || ""
            }));
    }

    /**
     * Lógica técnica para actualizar el texto sin romper el JSON
     */
    updateTextLayer(originalIndex, newValue) {
        const node = this.data.descendants[originalIndex];
        if (!node || !node.text) return;

        // PSD usa \r para saltos de línea
        const psdText = newValue.replace(/\n/g, '\r');
        node.text.value = psdText;

        // Actualizar nombre de capa para que sea reconocible
        // Quitamos saltos de línea del nombre de la capa para que no cause problemas visuales en herramientas
        node.name = newValue.replace(/[\r\n]/g, ' ').substring(0, 50);

        // REPARACIÓN DE FUENTES (Crucial para After Effects/Photoshop)
        if (node.text.font) {
            const f = node.text.font;
            // El lengthArray DEBE coincidir con la longitud del nuevo string
            f.lengthArray = [psdText.length];

            // Colapsamos propiedades de estilo para evitar desajustes de índices
            const props = ['styles', 'weights', 'names', 'sizes', 'colors', 'alignment', 'leading'];
            props.forEach(prop => {
                if (Array.isArray(f[prop]) && f[prop].length > 0) {
                    f[prop] = [f[prop][0]];
                }
            });
        }

        // Forzamos al motor de render a generar una nueva imagen
        delete node.src;

        return this.data;
    }

    getModifiedJson() {
        // Retornamos el JSON con el array plano original (descendants)
        // pero con los datos ya modificados.
        return this.data;
    }
}