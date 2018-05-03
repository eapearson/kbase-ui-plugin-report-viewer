define([
    'knockout',
    'kb_common/html',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/dynamicServiceClient',
    './components/main'
], function(
    ko,
    html,
    GenericClient,
    DynamicServiceClient,
    MainComponent
) {
    'use strict';

    let t = html.tag,
        div = t('div');

    function escapeHtml (string) {
        if (typeof string !== 'string') {
            return;
        }
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return String(string).replace(/[&<>"'`=/]/g, (s) => {
            return entityMap[s];
        });
    }

    class Viewer {
        constructor(config) {
            this.runtime = config.runtime;
            this.workspaceId = config.workspaceId;
            this.objectId = config.objectId;
            this.objectVersion = config.objectVersion;
        }

        

        getLinks() {
            let ref = [this.workspaceId, this.objectId, this.objectVersion].join('/');
            let client = new GenericClient({
                url: this.runtime.config('services.ServiceWizard.url'),
                token: this.runtime.service('session').getAuthToken(),
                module: 'ServiceWizard'
            });
            return client.callFunc('get_service_status', [{
                module_name: 'HTMLFileSetServ',
                version: null
            }])
                .spread((serviceStatus) => {
                    var htmlServiceURL = serviceStatus.url;
                    if (this.report.html_links && this.report.html_links.length) {
                        return this.report.html_links.map((item, index) => {
                            return {
                                name: item.name,
                                // If label is not provided, name must be.
                                label: escapeHtml(item.label || item.name),
                                url: [htmlServiceURL, 'api', 'v1', ref, '$', index, item.name].join('/'),
                                description: item.description
                            };
                        });
                    } else {
                        return [];
                    }
                });
        }

        fetchReport() {
            let client = new GenericClient({
                module: 'Workspace',
                url: this.runtime.config('services.workspace.url'),
                token: this.runtime.service('session').getAuthToken()
            });
            return client.callFunc('get_objects', [[{
                wsid: this.workspaceId,
                objid: this.objectId,
                ver: this.objectVersion
            }]])
                .spread((object) => {
                    // console.log('obj', object);
                    if (!object[0]) {
                        throw new Error('Not found');
                    }
                    return object[0].data;
                });
        }

        loadRootComponent() {
            this.node.innerHTML = div({
                dataBind: {
                    component: {
                        name: MainComponent.quotedName(),
                        params: {
                            report: 'report',
                            links: 'links',
                            runtime: 'runtime',
                            workspaceId: 'workspaceId',
                            objectId: 'objectId',
                            objectVersion: 'objectVersion'
                        }
                    }
                }
            });
            let vm = {
                report: this.report,
                links: this.links,
                runtime: this.runtime,
                workspaceId: self.workspaceId,
                objectId: self.objectId,
                objectVersion: self.objectVersion
            };
            ko.applyBindings(vm, this.node);
        }

        // LIFECYCLE

        attach(node) {
            this.node = node;
        }

        start(params) {
            this.workspaceId = params.workspaceId;
            this.objectId = params.objectId;
            this.objectVersion = params.objectVersion;
            this.node.innerHTML = html.loading();

            return this.fetchReport()
                .then((report) => {
                    this.report = report;
                    return this.getLinks();
                })
                .then((links) => {
                    this.links = links;
                    // console.log('got it', result);
                    this.loadRootComponent();
                })
                .catch((err) => {
                    console.error('error', err);
                });
        }

        stop() {
            
        }

        detach() {
            this.node = '';
        }

    }

    return Viewer;
});