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
        p = t('p'),
        a = t('a'),
        div = t('div'),
        ul = t('ul'),
        li = t('li');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.links = params.links;
        }
    }

    function buildLinks() {
        return ul({
            style: {
            },
            dataBind: {
                foreach: 'links'
            }
        }, li([
            a({
                dataBind: {
                    attr: {
                        href: '$data.url',
                    },
                    text: '$data.label || $data.name'
                },
                target: '_blank'
            }),
            gen.if('$data.description', div({
                dataBind: {
                    text: '$data.description'
                }
            }))
        ]));
    }

    function buildNoLinks() {
        return p({
            style: {
                fontStyle: 'italic'
            }
        }, 'No links for this report');
    }

    function template() {
        return div(gen.if('links && links.length > 0',
            buildLinks(),
            buildNoLinks()));
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});