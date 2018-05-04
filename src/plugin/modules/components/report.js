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
        a = t('a'),
        span = t('span'),
        iframe = t('iframe');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.report = params.report;
            this.links = params.links;

            if (this.report.direct_html && this.report.direct_html.length > 0) {
                this.hasDirectHtml = true;
                if (/<html/.test(this.report.direct_html)) {
                    this.hasDirectHtmlDocument = true;
                } else {
                    this.hasDirectHtmlDocument = false;
                }
                this.wrappedDirectHtml = wrapHtmlDoc(div({
                }, this.report.direct_html)).replace(/"/g, '&quot;');
            } else {
                this.hasDirectHtmlDocument = false;
                this.hasDirectHtml = false;
            }

            if (typeof this.report.direct_html_link_index === 'number' &&
            this.report.direct_html_link_index >= 0) {
                this.hasDirectHtmlIndex = true;
                this.link = this.links[this.report.direct_html_link_index];
            } else {
                this.hasDirectHtmlIndex = false;
                this.link = null;
            }

            this.height = this.report.html_window_height || 500;

            this.frameId = 'frame_' + html.genId();
        }
    }

    function buildIframeSrc() {
        return iframe({
            style: {
                display: 'block',
                width: '100%',
                margin: 0,
                padding: 0
            },
            dataBind: {
                style: {
                    'max-height': 'height + "px"',
                    'height': 'height + "px"'
                },
                attr: {
                    id: 'frameId',
                    'data-frame': 'frameId',
                    src: 'link.url'
                }
            },
            frameborder: '0',
            scrolling: 'yes'
        });
    }

    function wrapHtmlDoc(content) {
        if (/<html/.test(content)) {
            console.warn('Html document inserted into iframe');
            return content;
        }
        var t = html.tag,
            htmlTag = t('html'),
            head = t('head'),
            body = t('body');
        return htmlTag([
            head(),
            body({
                style: {
                    margin: '0px',
                    padding: '0px',
                    overflow: 'auto'
                }
            }, [
                content
            ])
        ]);
    }

    function buildIframe() {
        return iframe({
            style: {
                display: 'block',
                width: '100%',
                height: 'auto',
                margin: 0,
                padding: 0
            },
            dataBind: {
                style: {
                    'max-height': 'height + "px"'
                },
                attr: {
                    id: 'frameId',
                    'data-frame': 'frameId',
                    srcdoc: 'wrappedDirectHtml'
                }
            },
            frameborder: '0',
            scrolling: 'no',
            // srcdoc: content
        });
    }

    function buildIframeDataPlain() {
        return iframe({
            style: {
                display: 'block',
                width: '100%',
                margin: 0,
                padding: 0
            },
            dataBind: {
                style: {
                    'max-height': 'height + "px"',
                    'height': 'height + "px"'
                },
                attr: {
                    id: 'frameId',
                    'data-frame': 'frameId',
                    src: '"data:text/html;charset=utf-8," + encodeURIComponent(report.direct_html)'
                }
            },
            frameborder: '0',
        });
    }

    function buildReportButton() {
        return div({
            style: {
                margin: '4px 4px 8px 0',
                xborder: '1px silver solid'
            }
        }, a({
            target: '_blank',
            class: 'btn btn-default',
            dataBind: {
                attr: {
                    href: 'link.url'
                }
            }
        }, 'View report in separate window'));
    }

    // inserts html into the iframe as content
    function buildIframeDirect() {
        return buildIframe();
    }

    function buildDirectHtml() {
        return gen.if('hasDirectHtmlDocument',
            buildIframeDataPlain(),
            gen.if('hasDirectHtml',
                buildIframeDirect(),
                'nothing'));
    }

    function buildNotFound() {
        return div({
            class: 'alert alert-danger'
        }, [
            'Report not found for index ',
            span({
                dataBind: {
                    text: 'report.direct_html_link_index'
                }
            })
        ]);
    }

    function buildDirectHtmlIndex() {
        return div([
            gen.if('link', [
                buildReportButton(),
                buildIframeSrc()
            ], buildNotFound())
        ]);
    }

    function template() {
        return div({
            style: {}
        }, [
            gen.if('hasDirectHtmlIndex', buildDirectHtmlIndex(), buildDirectHtml())

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