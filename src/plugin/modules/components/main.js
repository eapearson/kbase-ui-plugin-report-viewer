define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/viewModelBase',
    'kb_common/html',
    'kb_common/bootstrapUtils',
    './warnings',
    './report',
    './summary',
    './links',
    './files',
    './createdObjects'
], function (
    ko,
    reg,
    gen,
    ViewModelBase,
    html,
    BS,
    WarningsComponent,
    ReportComponent,
    SummaryComponent,
    LinksComponent,
    FilesComponent,
    CreateObjectsComponent
) {
    'use strict';

    let t = html.tag,
        span = t('span'),
        div = t('div');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.report = params.report;
            this.links = params.links;
            this.createdObjects = params.createdObjects;

            this.hasWarnings = false;
            if (this.report.warnings && this.report.warnings.length > 0) {
                this.hasWarnings = true;
            }

            if (this.report.text_message && this.report.text_message.length > 0) {
                this.hasSummary = true;
                this.summary = this.report.text_message;
                this.summaryHeight = this.report.summary_window_height || 500;
            } else {
                this.hasSummary = false;
            }

            if (this.report.file_links && this.report.file_links.length > 0) {
                this.hasFiles = true;
            } else {
                this.hasFiles = false;
            }

            if (this.links && this.links.length > 0) {
                this.hasLinks = true;
            } else {
                this.hasLinks = false;
            }


            if (this.report.direct_html && this.report.direct_html.length > 0) {
                this.hasDirectHtml = true;
                if (/<html/.test(this.report.direct_html)) {
                    this.hasDirectHtmlDocument = true;
                } else {
                    this.hasDirectHtmlDocument = false;
                }
            } else {
                this.hasDirectHtmlDocument = false;
                this.hasDirectHtml = false;
            }

            if (typeof this.report.direct_html_link_index === 'number' &&
            this.report.direct_html_link_index >= 0) {
                this.hasDirectHtmlIndex = true;
                this.directHtmlLink = this.links[this.report.direct_html_link_index];
            } else {
                this.hasDirectHtmlIndex = false;
                this.directHtmlLink = false;
                this.link = null;
            }

            if (this.hasDirectHtml || this.hasDirectHtmlIndex) {
                this.collapseSummary = true;
            } else {
                this.collapseSummary = false;
            }
        }
    }

    function buildIcon(arg) {
        var klasses = ['fa'],
            style = { verticalAlign: 'middle' };
        klasses.push('fa-' + arg.name);
        if (arg.rotate) {
            klasses.push('fa-rotate-' + String(arg.rotate));
        }
        if (arg.flip) {
            klasses.push('fa-flip-' + arg.flip);
        }
        if (arg.size) {
            if (typeof arg.size === 'number') {
                klasses.push('fa-' + String(arg.size) + 'x');
            } else {
                klasses.push('fa-' + arg.size);
            }
        }
        if (arg.classes) {
            arg.classes.forEach(function (klass) {
                klasses.push(klass);
            });
        }
        if (arg.style) {
            Object.keys(arg.style).forEach(function (key) {
                style[key] = arg.style[key];
            });
        }
        if (arg.color) {
            style.color = arg.color;
        }

        return span({
            dataElement: 'icon',
            style: style,
            class: klasses.join(' ')
        });
    }

    function buildCollapsiblePanel(args) {
        var collapseId = html.genId(),
            type = args.type || 'primary',
            classes = ['panel', 'panel-' + type],
            // collapseClasses = ['panel-collapse collapse'],
            // toggleClasses = [],
            style = args.style || {},
            icon;
        if (args.hidden) {
            classes.push('hidden');
        }
        // if (!args.collapsed) {
        //     collapseClasses.push('in');
        // } else {
        //     toggleClasses.push('collapsed');
        // }
        if (args.classes) {
            classes = classes.concat(args.classes);
        }
        if (args.icon) {
            icon = [' ', buildIcon(args.icon)];
        }
        return div({
            class: classes.join(' '),
            dataElement: args.name,
            style: style
        }, [
            div({ class: 'panel-heading' }, [
                div({
                    class: 'panel-title'
                }, span({
                    dataElement: 'title',
                    // class: toggleClasses.join(' '),
                    dataToggle: 'collapse',
                    dataTarget: '#' + collapseId,
                    style: { cursor: 'pointer' },
                    dataBind: {
                        css: {
                            collapsed: args.collapsed || false
                        }
                    }
                }, [args.title, icon]))
            ]),
            div({
                id: collapseId,
                class: 'panel-collapse collapse',
                dataBind: {
                    css: {
                        in: '!' + args.collapsed || true
                    }
                }
            }, div({
                class: 'panel-body',
                dataElement: 'body'
            }, [
                args.body
            ]))
        ]);
    }

    function template() {
        return div({}, [
            gen.if('hasWarnings',
                buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Warnings',
                    body: div({
                        dataBind: {
                            component: {
                                name: WarningsComponent.quotedName(),
                                params: {
                                    warnings: 'report.warnings'
                                }
                            }
                        }
                    })
                })),
            gen.if('report.objects_created && report.objects_created.length > 0',
                buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Objects Created',
                    body: div({
                        dataBind: {
                            component: {
                                name: CreateObjectsComponent.quotedName(),
                                params: {
                                    createdObjects: 'createdObjects',
                                }
                            }
                        }
                    })
                })),
            gen.if('hasDirectHtml || hasDirectHtmlIndex',
                buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Report',
                    body: div({
                        dataBind: {
                            component: {
                                name: ReportComponent.quotedName(),
                                params: {
                                    report: 'report',
                                    links: 'links'
                                }
                            }
                        }
                    })
                })),
            gen.if('hasSummary',
                buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Summary',
                    collapsed: '$component.collapseSummary',
                    body: div({
                        dataBind: {
                            component: {
                                name: SummaryComponent.quotedName(),
                                params: {
                                    summary: 'summary',
                                    height: 'summaryHeight'
                                }
                            }
                        }
                    })
                })),
            gen.if('hasLinks',
                buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Links',
                    body: div({
                        dataBind: {
                            component: {
                                name: LinksComponent.quotedName(),
                                params: {
                                    links: 'links'
                                }
                            }
                        }
                    })
                })),
            gen.if('hasFiles',
                buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Files',
                    body: div({
                        dataBind: {
                            component: {
                                name: FilesComponent.quotedName(),
                                params: {
                                    files: 'report.file_links'
                                }
                            }
                        }
                    })
                }))
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