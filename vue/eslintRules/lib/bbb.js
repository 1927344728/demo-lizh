var _ = require('lodash')

module.exports = {
    meta: {
        messages: {
            invalidName: 'Avoid use \'hello\' for identifier'
        }
    },
    create(context) {
        return {
            Identifier(node) {
                if (_.includes(node.name, 'hello')) {
                    context.report({
                        node,
                        messageId: 'invalidName'
                    })
                }
            }
        }
    }
}
