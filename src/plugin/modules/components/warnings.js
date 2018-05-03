define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/viewModelBase',
    'kb_common/html'
], function (
    ko,
    reg,
    gen,
    ViewModelBase,
    html
) {
    'use strict';

    let t = html.tag,
        div = t('div'),
        p = t('p'),
        span = t('span');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.warnings = params.warnings;
        }
    }

    function template() {
        return div({
            style: {
                maxHeight: '100px',
                overflowY: 'auto',
                margin: '0px 5px 5px 10px'
            }
        }, [
            p([
                span({
                    dataBind: {
                        text: 'warnings.length'
                    }
                }),
                ' ',
                gen.plural('warnings', 'Warning', 'Warnings')
            ]),
            gen.foreach('warnings', div({
                style: {
                    margin: '5px'
                }
            }, [
                div({
                    style: {
                        margin: '0px 5px 5px 10px'
                    }
                }, span({
                    class: 'label label-warning',
                    dataBind: {
                        text: '$data'
                    }
                }))
            ]))
        ]);
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});