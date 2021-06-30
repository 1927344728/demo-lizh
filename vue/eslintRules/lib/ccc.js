var _ = require('lodash')

module.exports = {
    meta: {
        type: "suggestion"
    },
    create(context) {
        return {
            // VariableDeclarator(node) {
            //     let variableValue = (node.init.value || '') + (node.init.consequent.value || '') + (node.init.alternate.value || '')
            //     console.log(variableValue)
            //     if (_.includes(variableValue,'winbaoxian.cn')) {
            //         context.report({
            //             node,
            //             message: '测试环境地址是否写死？'
            //         })
            //     }
            // },
            Literal(node) {
                console.log(node)
                if (_.includes(node.value, 'winbaoxian.cn')) {
                    context.report({
                        node,
                        message: '测试环境地址是否写死？'
                    })
                }
            }
        }
    }
}
