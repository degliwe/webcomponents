/*
@param string elementID :
@param  object extendedPrototype :
@param bool shadowDom :
 */
export default function factory(elementID, extendedPrototype, shadowDom) {

    const importDoc = document.currentScript.ownerDocument; // importee
    const proto = Object.create(HTMLElement.prototype); // Create a HTMLElement.prototype
    Object.assign(proto, extendedPrototype) // composition

    //TODO rename _init to init
    proto._init = function () {
        // Checks if the attribute has been overwritten
        const attrs = this.attributes
        for (var i = 0; i < attrs.length; i++) {
            console.log('init attr',attrs[i])
            if (this.hasAttribute(attrs[i])) {
                const attr = this.getAttribute(attrs[i]);
                this.setAttr(attr.localName, attr.value);
            } // else default value
        }
        if(proto.init) proto.init()
    };

    // Fires when an attribute was added, removed, or updated
    proto.attributeChangedCallback = function (attr, oldVal, newVal) {

        //todo check if attr exist in extendedPrototype.api
        if (this.hasAttribute(attr) && attr != "class") {
            this.setAttr(attr, newVal);
        }
    };

    // Sets new value to attribute
    proto.setAttr = function (attr, val) {
        this[attr] = val; //eval(val);
        console.log('setAttr',val)
        //this.setAttribute(attr,val)

    };

    proto.createdCallback = function () {
        let template
        if(proto.template){ // template provided as template string
            const parser = new DOMParser()
            const templateDoc = parser.parseFromString(proto.template,'text/html')
            template = templateDoc.body.firstElementChild
        }else{ // get template provided as <template/>
            template = importDoc.querySelector('#' + elementID).content
        }
        const clone = document.importNode(template, true) // import template into

        if (shadowDom){
            const root = this.createShadowRoot();
            proto.dom = root // get reference to markup
            root.appendChild(clone);
        }else{
            proto.dom = this // get reference to markup
            this.appendChild(clone);
        }
        this._init();
    };

    proto.attachedCallback = function(){
        if(proto._attachedCallback) proto._attachedCallback()
    }

    proto.detachedCallback = function(){
        if(proto._detachedCallback) proto._detachedCallback()
    }

    return document.registerElement(elementID, {prototype: proto});
};
