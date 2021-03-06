'use strict';

/**
 * public void extend([Object] child, [Object] parent, [Bool] extendConstructor)
 *
 * Extend an object
 */
module.exports = function extend(Child, Parent, extendConstructor) {
    'use strict';

    var constructor = Child;

    // TODO: work this part out later
    if (false && extendConstructor) {
        constructor = function constructor() {};
    }

    Child.prototype = Object.create(Parent.prototype);
    Child.prototype.constructor = constructor;
};