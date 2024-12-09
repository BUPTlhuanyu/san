/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 依赖注入，注入到实例上
 */

var warn = require('../util/warn');
var parseExpr = require('../parser/parse-expr');

function initInjections(ins, inject) {
    var normalized = null;
    if (!inject) {
        return;
    }
    else if (Array.isArray(inject)) {
        normalized = {};
        for (var i = 0; i < inject.length; i++) {
            normalized[inject[i]] = inject[i];
        }
    } else if (typeof inject === 'object') { 
        normalized = inject;
    } else {
        // #[begin] error
        warn('Invalid value for option "inject": expected an Array, but got' + typeof inject);
        // #[end]
        return;
    }
    for (var injectkey in normalized) {
        if (normalized.hasOwnProperty(injectkey)) {

            // #[begin] error
            if (injectkey in ins) {
                warn('\`' + injectkey + '\` is already existed.');
            }
            // #[end]

            var injectedInfo = normalized[injectkey];
            if (!injectedInfo && !injectedInfo.from) {
                // #[begin] error
                warn(
                    'The value corresponding to this key \`' +
                    injectkey +
                    '\` in the inject options is either empty or does not have the \`from\` attribute.'
                );
                // #[end]
                continue;
            }
            var provideKey = typeof injectedInfo === 'string' ? injectedInfo : injectedInfo.from;
            var expr = parseExpr(provideKey);
            var provideRootKey = expr.paths[0].value;

            var source = ins;
            while (source) {
                // 只匹配第一个路径
                if (source._provided && source._provided.hasOwnProperty(provideRootKey)) {
                    var value = source._provided[provideRootKey];
                    for (var i = 1, l = expr.paths.length; value != null && i < l; i++) {
                        value = value[expr.paths[i].value];
                    }
                    ins[injectkey] = value;
                    break
                }
                source = source.parentComponent;
            }
    
            if (!source) {
                // default 函数的触发只在第一层没找到的时候生效
                if (injectedInfo.default && injectedInfo.hasOwnProperty('default')) {
                    var provideDefault = injectedInfo.default;
                    ins[injectkey] = typeof provideDefault === 'function'
                        ? provideDefault.call(ins)
                        : provideDefault;
                }
                // #[begin] error
                else {
                    warn('Injection \`' + injectkey + '\` not found');
                }
                // #[end]
            }
        }
    }
}

function initProvide(ins, provide) {
    if (provide) {
        ins._provided = typeof provide === 'function'
            ? provide.call(ins)
            : provide;
    }
}

exports = module.exports = {initInjections, initProvide};
