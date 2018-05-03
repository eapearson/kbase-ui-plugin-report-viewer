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
        div = t('div');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.summary = params.summary;
            this.maxHeight = params.summaryHeight;
        }
    }

    function template() {
        return div({
            style: {
                width: '100%',
                fontFamily: 'Monaco,monospace',
                fontSize: '9pt',
                color: '#555',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                height: 'auto',
            },
            dataBind: {
                style: {
                    'max-height': 'maxHeight + "px"'
                },
                text: 'summary'
            }
        });
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component); 
});