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
    './files'
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
    FilesComponent
) {
    'use strict';

    let t = html.tag,
        div = t('div');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.report = params.report;
            this.links = params.links;

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
        }
    }

    function template() {
        return div({}, [
            gen.if('hasWarnings',
                BS.buildCollapsiblePanel({
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
            BS.buildCollapsiblePanel({
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
            }),
            BS.buildCollapsiblePanel({
                classes: ['kb-panel-light'],
                title: 'Created Objects',
                body: 'here'
            }),
            gen.if('hasSummary',
                BS.buildCollapsiblePanel({
                    classes: ['kb-panel-light'],
                    title: 'Summary',
                    collapsed: true,
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
            BS.buildCollapsiblePanel({
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
            }),
            BS.buildCollapsiblePanel({
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
            })

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