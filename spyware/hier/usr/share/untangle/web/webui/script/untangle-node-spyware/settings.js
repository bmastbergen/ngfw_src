if (!Ung.hasResource["Ung.Spyware"]) {
    Ung.hasResource["Ung.Spyware"] = true;
    Ung.NodeWin.registerClassName('untangle-node-spyware', "Ung.Spyware");

    Ext.define('Ung.Spyware', {
        extend:'Ung.NodeWin',
        gridCookiesList: null,
        gridSubnetList: null,
        panelBlockLists: null,
        gridPassList: null,
        gridCookieEventLog: null,
        gridSuspiciousEventLog: null,
        gridUrlEventLog: null,
        initComponent: function() {
            this.genericRuleFields = Ung.Util.getGenericRuleFields(this);
            this.buildBlockLists();
            this.buildPassList();
            this.buildUrlEventLog();
            this.buildCookieEventLog();
            this.buildSuspiciousEventLog();
            // builds a tab panel with the 3 panels
            this.buildTabPanel([this.panelBlockLists, this.gridPassList, 
                                this.gridUrlEventLog,
                                this.gridCookieEventLog,
                                this.gridSuspiciousEventLog]);
            this.callParent(arguments);
        },
        // Block lists panel
        buildBlockLists: function() {
            this.panelBlockLists = Ext.create('Ext.panel.Panel',{
                name: 'Block Lists',
                helpSource: 'block_lists',
                winCookiesList: null,
                winSubnetList: null,
                subCmps: [],
                title: this.i18n._("Block Lists"),
                parentId: this.getId(),
                cls: 'ung-panel',
                autoScroll: true,
                defaults: {
                    xtype: 'fieldset',
                    buttonAlign: 'left'
                },
                items: [{
                    title: this.i18n._('Web'),
                    labelWidth: 150,
                    items: [{
                        xtype: 'checkbox',
                        boxLabel: this.i18n._('Block Malware URLs (Community List)'),
                        hideLabel: true,
                        name: 'Block Malware URLs (Community List)',
                        checked: this.settings.scanUrls,
                        handler:Ext.bind(function(elem, checked) {
                            this.settings.scanUrls = checked;
                        }, this)
                    }, {
                        xtype: 'combo',
                        editable: false,
                        queryMode: 'local',
                        fieldLabel: this.i18n._('User Bypass'),
                        name: "User Bypass",
                        store: [["None", this.i18n._("None")],
                                ["Host", this.i18n._("Temporary")],
                                ["Global", this.i18n._("Permanent and Global")]],
                        displayField: 'unblockModeName',
                        valueField: 'unblockModeValue',
                        value: this.settings.unblockMode,
                        listeners: {
                            "change": {
                                fn: Ext.bind(function(elem, newValue) {
                                    this.settings.unblockMode = newValue;
                                }, this)
                            }
                        }
                    }]
                }, {
                    title: this.i18n._('Cookies'),
                    items: [{
                        xtype: 'checkbox',
                        boxLabel: this.i18n._('Block Tracking & Ad Cookies'),
                        hideLabel: true,
                        name: 'Block Tracking & Ad Cookies',
                        checked: this.settings.scanCookies,
                        handler:Ext.bind(function(elem, checked) {
                                    this.settings.scanCookies = checked;
                                }, this)
                    },
                    {
                        xtype:'button',
                        name: 'Edit Cookies List',
                        text: this.i18n._("Edit Cookie List"),
                        handler: Ext.bind(function() {
                            this.panelBlockLists.onManageCookiesList();
                        }, this)
                    }]
                }, {
                    title: this.i18n._('Traffic'),
                    items: [{
                        xtype: 'checkbox',
                        boxLabel: this.i18n._('Monitor Suspicious Traffic'),
                        hideLabel: true,
                        name: 'Monitor Suspicious Traffic',
                        checked: this.settings.scanSubnets,
                        handler: Ext.bind(function(elem, checked) {
                                    this.settings.scanSubnets = checked;
                                }, this)
                    },
                    {
                        xtype:'button',
                        name: 'Edit Traffic List',
                        text: this.i18n._("Edit Traffic List"),
                        handler: Ext.bind(function() {
                            this.panelBlockLists.onManageSubnetList();
                        }, this)
                    }]
                }],

                onManageCookiesList: function() {
                    if (!this.winCookiesList) {
                        var settingsCmp = Ext.getCmp(this.parentId);
                        settingsCmp.buildCookiesList();
                        this.winCookiesList = Ext.create('Ung.ManageListWindow',{
                            breadcrumbs: [{
                                title: i18n._(rpc.currentPolicy.name),
                                action: Ext.bind(function() {
                                    Ung.Window.cancelAction(
                                        this.gridCookiesList.isDirty() || this.isDirty(),
                                        Ext.bind(function() {
                                            this.panelBlockLists.winCookiesList.closeWindow();
                                            this.closeWindow();
                                        }, this)
                                    );
                                },settingsCmp)
                            }, {
                                title: settingsCmp.node.displayName,
                                action: Ext.bind(function() {
                                    this.panelBlockLists.winCookiesList.cancelAction();
                                },settingsCmp)
                            }, {
                                title: settingsCmp.i18n._("Block Lists"),
                                action: Ext.bind(function() {
                                    this.panelBlockLists.winCookiesList.cancelAction();
                                },settingsCmp)
                            }, {
                                title: settingsCmp.i18n._("Cookies List")
                            }],
                            grid: settingsCmp.gridCookiesList,
                            applyAction: function(callback) {
                                Ext.MessageBox.wait(i18n._("Saving..."), i18n._("Please wait"));
                                settingsCmp.gridCookiesList.getList(Ext.bind(function(saveList) {
                                    this.alterUrls(saveList.list);
                                    this.getRpcNode().setCookies(Ext.bind(function(result, exception) {
                                        if(Ung.Util.handleException(exception)) return;
                                        this.getRpcNode().getCookies(Ext.bind(function(result, exception) {
                                            Ext.MessageBox.hide();
                                            if(Ung.Util.handleException(exception)) return;
                                            this.settings.cookies = result;
                                            this.gridCookiesList.clearDirty();
                                            if(callback != null) {
                                                callback();
                                            }
                                        }, this));
                                    }, this), saveList);
                                },settingsCmp));
                            }    
                        });
                    }
                    this.winCookiesList.show();
                },
                onManageSubnetList: function() {
                    if (!this.winSubnetList) {
                        var settingsCmp = Ext.getCmp(this.parentId);
                        settingsCmp.buildSubnetList();
                        this.winSubnetList = Ext.create('Ung.ManageListWindow',{
                            breadcrumbs: [{
                                title: i18n._(rpc.currentPolicy.name),
                                action: Ext.bind(function() {
                                    Ung.Window.cancelAction(
                                        this.gridSubnetList.isDirty() || this.isDirty(),
                                        Ext.bind(function() {
                                            this.panelBlockLists.winSubnetList.closeWindow();
                                            this.closeWindow();
                                        }, this)
                                    );
                                },settingsCmp)
                            }, {
                                title: settingsCmp.node.displayName,
                                action: Ext.bind(function() {
                                    this.panelBlockLists.winSubnetList.cancelAction();
                                },settingsCmp)
                            }, {
                                title: settingsCmp.i18n._("Block Lists"),
                                action: Ext.bind(function() {
                                    this.panelBlockLists.winSubnetList.cancelAction();
                                },settingsCmp)
                            }, {
                                title: settingsCmp.i18n._("Subnet List")
                            }],
                            grid: settingsCmp.gridSubnetList,
                            applyAction: function(callback) {
                                Ext.MessageBox.wait(i18n._("Saving..."), i18n._("Please wait"));
                                settingsCmp.gridSubnetList.getList(Ext.bind(function(saveList) {
                                    this.alterUrls(saveList);
                                    this.getRpcNode().setSubnets(Ext.bind(function(result, exception) {
                                        if(Ung.Util.handleException(exception)) return;
                                        this.getRpcNode().getSubnets(Ext.bind(function(result, exception) {
                                            Ext.MessageBox.hide();
                                            if(Ung.Util.handleException(exception)) return;
                                            this.settings.subnets = result;
                                            this.gridSubnetList.clearDirty();
                                            if(callback != null) {
                                                callback();
                                            }
                                        }, this));
                                    }, this), saveList);
                                },settingsCmp));
                            }
                        });
                    }
                    this.winSubnetList.show();
                },

                beforeDestroy: function() {
                    Ext.destroy(this.winCookiesList, this.winSubnetList);
                    Ext.each(this.subCmps, Ext.destroy);
                    Ext.Panel.prototype.beforeDestroy.call(this);
                }
            });

        },
        // Cookies List
        buildCookiesList: function() {

            this.gridCookiesList = Ext.create('Ung.EditorGrid',{
                name: 'Cookies List',
                settingsCmp: this,
                emptyRow: {
                    "string": this.i18n._("[no identification]"),
                    "enabled": true,
                    "description": this.i18n._("[no description]")
                },
                title: this.i18n._("Cookies List"),
                dataProperty:'cookies',
                recordJavaClass: "com.untangle.uvm.node.GenericRule",
                fields: this.genericRuleFields,
                columns: [{
                    header: this.i18n._("identification"),
                    width: 140,
                    dataIndex: 'string',
                    flex: 1,
                    editor:{
                        xtype:'textfield'
                    }
                }, 
                {
                    xtype: 'checkcolumn',
                    header: "<b>" + this.i18n._("block") + "</b>",
                    dataIndex: 'enabled',
                    resizable: false,
                    width:55
                }],
                sortField: 'string',
                columnsDefaultSortable: true,
                rowEditorInputLines: [{
                    xtype:'textfield',
                    name: "Identification",
                    dataIndex: "string",
                    fieldLabel: this.i18n._("Identification"),
                    allowBlank: false,
                    width: 400
                }, {
                    xtype: 'checkbox',
                    name: "Block",
                    dataIndex: "enabled",
                    fieldLabel: this.i18n._("Block")
                }]
            });
        },

        // Subnet List
        buildSubnetList: function() {

            this.gridSubnetList = Ext.create('Ung.EditorGrid',{
                name: 'Subnet List',
                settingsCmp: this,
                emptyRow: {
                    "string": "1.2.3.4/24",
                    "name": this.i18n._("[no name]"),
                    "flagged": true,
                    "description": this.i18n._("[no description]")
                },
                title: this.i18n._("Subnet List"),
                dataProperty:'subnets',
                recordJavaClass: "com.untangle.uvm.node.GenericRule",
                fields: this.genericRuleFields,
                columns: [{
                        header: this.i18n._("name"),
                        width: 250,
                        dataIndex: 'name',
                        flex: 1,
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false
                        }
                    }, {
                        id: 'string',
                        header: this.i18n._("subnet"),
                        width: 300,
                        dataIndex: 'string',
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false
                        }
                    }, 
                    {
                     xtype:'checkcolumn',
                     header: "<b>" + this.i18n._("log") + "</b>",
                     dataIndex: 'flagged',
                     resizable: false,
                     width:55
                    }],
                sortField: 'name',
                columnsDefaultSortable: true,
                rowEditorInputLines: [{
                    xtype:'textfield',
                    name: "Name",
                    dataIndex: "name",
                    fieldLabel: this.i18n._("Name"),
                    allowBlank: false,
                    width: 250
                }, {
                    xtype:'textfield',
                    name: "Subnet",
                    dataIndex: "string",
                    fieldLabel: this.i18n._("Subnet"),
                    allowBlank: false,
                    width: 500
                }, {
                    xtype: 'checkbox',
                    name: "Log",
                    dataIndex: "flagged",
                    fieldLabel: this.i18n._("Log")
                }]
            });
        },
        // Pass List
        buildPassList: function() {
            var urlValidator = Ext.bind(function(fieldValue) {
                if (fieldValue.indexOf("https://") == 0) {
                    return this.i18n._("\"URL\" specified cannot be blocked because it uses secure http (https)");
                }
                if (fieldValue.indexOf("http://") == 0) {
                    fieldValue = fieldValue.substr(7);
                }
                if (fieldValue.indexOf("www.") == 0) {
                    fieldValue = fieldValue.substr(4);
                }
                if (fieldValue.indexOf("/") == fieldValue.length - 1) {
                    fieldValue = fieldValue.substring(0, fieldValue.length - 1);
                }
                if (fieldValue.trim().length == 0) {
                    return this.i18n._("Invalid \"URL\" specified");
                }
                return true;
            }, this);

            this.gridPassList = Ext.create('Ung.EditorGrid', {
                name: 'Pass List',
                helpSource: 'pass_list',
                settingsCmp: this,
                emptyRow: {
                    "string": "",
                    "enabled": true,
                    "description": this.i18n._("[no description]")
                },
                title: this.i18n._("Pass List"),
                dataProperty: 'passedUrls',
                recordJavaClass: "com.untangle.uvm.node.GenericRule",
                fields: this.genericRuleFields,
                sortField: 'string',
                columnsDefaultSortable: true,
                columns: [{
                    header: this.i18n._("site"),
                    width: 200,
                    dataIndex: 'string',
                    editor:{
                        xtype:'textfield'
                    }
                }, {
                    xtype: "checkcolumn",
                    header: "<b>" + this.i18n._("pass") + "</b>",
                    dataIndex: 'enabled',
                    width: 65,
                    resizable: false
                },
                {
                    header: this.i18n._("description"),
                    width: 200,
                    flex: 1,
                    dataIndex: 'description',
                    editor: { 
                        xtype:'textfield'
                    }
                }],
                sortField: 'string',
                columnsDefaultSortable: true,
                rowEditorInputLines: [{
                    xtype: 'textfield',
                    name: "Site",
                    dataIndex: "string",
                    fieldLabel: this.i18n._("Site"),
                    width: 500,
                    validator: urlValidator,
                    allowBlank: false,
                    blankText: this.i18n._("Invalid \"URL\" specified")
                }, {
                    xtype: 'checkbox',
                    name: "Pass",
                    dataIndex: "enabled",
                    fieldLabel: this.i18n._("Pass")
                }, {
                    xtype: 'textarea',
                    name: "Description",
                    dataIndex: "description",
                    fieldLabel: this.i18n._("Description"),
                    width: 500,
                    height: 60
                }]
                
            });
        },

        // Event Logs
        buildCookieEventLog: function() {
            this.gridCookieEventLog = Ext.create('Ung.GridEventLog',{
                settingsCmp: this,
                eventQueriesFn: this.getRpcNode().getCookieEventQueries,
                name: "Cookie Event Log",
                title: i18n._('Cookie Event Log'),
                fields: [{
                    name: 'time_stamp',
                    sortType: Ung.SortTypes.asTimestamp
                }, {
                    name: 'uid'
                }, {
                    name: 'swBlacklisted'
                }, {
                    name: 'swCookie'
                }, {
                    name: 'spyware_access_ident'
                }, {
                    name: 'uri'
                }, {
                    name: 'host'
                }, {
                    name: 'client',
                    mapping: 'c_client_addr'
                }, {
                    name: 'server',
                    mapping: 'c_server_addr'
                }],
                columns: [{
                    header: this.i18n._("timestamp"),
                    width: Ung.Util.timestampFieldWidth,
                    sortable: true,
                    dataIndex: 'time_stamp',
                    renderer: function(value) {
                        return i18n.timestampFormat(value);
                    }
                }, {
                    header: this.i18n._("client"),
                    width: Ung.Util.ipFieldWidth,
                    sortable: true,
                    dataIndex: 'client'
                }, {
                    header: this.i18n._("username"),
                    width: Ung.Util.usernameFieldWidth,
                    sortable: true,
                    dataIndex: 'uid'
                }, {
                    header: this.i18n._("host"),
                    width: Ung.Util.hostnameFieldWidth,
                    sortable: true,
                    dataIndex: 'host'
                }, {
                    header: this.i18n._("Uri"),
                    width: Ung.Util.uriFieldWidth,
                    sortable: true,
                    dataIndex: 'uri'
                }, {
                    header: this.i18n._("cookie"),
                    width: 100,
                    sortable: true,
                    dataIndex: 'swCookie'
                }, {
                    header: this.i18n._("server"),
                    width: Ung.Util.ipFieldWidth,
                    sortable: true,
                    dataIndex: 'server'
                }]
            });
        },

        buildUrlEventLog: function() {
            this.gridUrlEventLog = Ext.create('Ung.GridEventLog',{
                settingsCmp: this,
                eventQueriesFn: this.getRpcNode().getUrlEventQueries,
                name: "Web Event Log",
                title: i18n._('Web Event Log'),
                fields: [{
                    name: 'time_stamp',
                    sortType: Ung.SortTypes.asTimestamp
                }, {
                    name: 'uid'
                }, {
                    name: 'swBlacklisted'
                }, {
                    name: 'swCookie'
                }, {
                    name: 'spyware_access_ident'
                }, {
                    name: 'uri'
                }, {
                    name: 'host'
                }, {
                    name: 'client',
                    mapping: 'c_client_addr'
                }, {
                    name: 'server',
                    mapping: 'c_server_addr'
                }],
                columns: [{
                    header: this.i18n._("timestamp"),
                    width: Ung.Util.timestampFieldWidth,
                    sortable: true,
                    dataIndex: 'time_stamp',
                    renderer: function(value) {
                        return i18n.timestampFormat(value);
                    }
                }, {
                    header: this.i18n._("client"),
                    width: Ung.Util.ipFieldWidth,
                    sortable: true,
                    dataIndex: 'client'
                }, {
                    header: this.i18n._("username"),
                    width: Ung.Util.usernameFieldWidth,
                    sortable: true,
                    dataIndex: 'uid'
                }, {
                    header: this.i18n._("host"),
                    width: Ung.Util.hostnameFieldWidth,
                    sortable: true,
                    dataIndex: 'host'
                }, {
                    id: 'uri',
                    header: this.i18n._("Uri"),
                    width: Ung.Util.uriFieldWidth,
                    sortable: true,
                    flex: 1,
                    dataIndex: 'uri'
                }, {
                    header: this.i18n._("server"),
                    width: Ung.Util.ipFieldWidth,
                    sortable: true,
                    dataIndex: 'server'
                }]
            });
        },

        buildSuspiciousEventLog: function() {
            this.gridSuspiciousEventLog = Ext.create('Ung.GridEventLog',{
                settingsCmp: this,
                eventQueriesFn: this.getRpcNode().getSuspiciousEventQueries,
                name: "Traffic Event Log",
                title: i18n._('Traffic Event Log'),
                fields: [{
                    name: 'time_stamp',
                    sortType: Ung.SortTypes.asTimestamp
                }, {
                    name: 'uid'
                }, {
                    name: 'swBlacklisted'
                }, {
                    name: 'swCookie'
                }, {
                    name: 'spyware_access_ident'
                }, {
                    name: 'client',
                    mapping: 'c_client_addr'
                }, {
                    name: 'server',
                    mapping: 'c_server_addr'
                }],
                columns: [{
                    header: this.i18n._("timestamp"),
                    width: Ung.Util.timestampFieldWidth,
                    sortable: true,
                    dataIndex: 'time_stamp',
                    renderer: function(value) {
                        return i18n.timestampFormat(value);
                    }
                }, {
                    header: this.i18n._("client"),
                    width: Ung.Util.ipFieldWidth,
                    sortable: true,
                    dataIndex: 'client'
                }, {
                    header: this.i18n._("username"),
                    width: Ung.Util.usernameFieldWidth,
                    sortable: true,
                    dataIndex: 'uid'
                }, {
                    header: this.i18n._("subnet"),
                    width: 120,
                    sortable: true,
                    dataIndex: 'spyware_access_ident'
                }, {
                    header: this.i18n._("server"),
                    width: Ung.Util.ipFieldWidth,
                    sortable: true,
                    dataIndex: 'server'
                }]
            });
        },

        // private method
        alterUrls: function(list) {
            if (list != null) {
                for (var i = 0; i < list.length; i++) {
                    list[i]["string"] = this.alterUrl(list[i]["string"]);
                }
            }
        },
        // private method
        alterUrl: function(value) {
            if (value.indexOf("http://") == 0) {
                value = value.substr(7);
            }
            if (value.indexOf("www.") == 0) {
                value = value.substr(4);
            }
            if (value.indexOf("/") == value.length - 1) {
                value = value.substring(0, value.length - 1);
            }
            return value.trim();
        },
        // validation
        validate: function() {
            // ipMaskedAddress list must be validated server side
            var subnetSaveList = this.gridSubnetList ? this.gridSubnetList.getAddedDeletedModifiedLists(): null;
            if (subnetSaveList != null) {
                var ipMaskedAddressList = [];
                // added
                for (var i = 0; i < subnetSaveList[0].list.length; i++) {
                    ipMaskedAddressList.push(subnetSaveList[0].list[i]["string"]);
                }
                // modified
                for (var i = 0; i < subnetSaveList[2].list.length; i++) {
                    ipMaskedAddressList.push(subnetSaveList[2].list[i]["string"]);
                }
                if (ipMaskedAddressList.length > 0) {
                    try {
                        var result=null;
                        try {
                            result = this.getValidator().validate({
                                list: ipMaskedAddressList,
                                "javaClass": "java.util.LinkedList"
                            });
                        } catch (e) {
                            Ung.Util.rpcExHandler(e);
                        }
                        if (!result.valid) {
                            var errorMsg = "";
                            switch (result.errorCode) {
                              case 'INVALID_IPMADDR':
                                errorMsg = this.i18n._("Invalid subnet specified") + ": " + result.cause;
                                break;
                            default:
                                errorMsg = this.i18n._(result.errorCode) + ": " + result.cause;
                            }

                            this.panelBlockLists.onManageSubnetList();
                            this.gridSubnetList.focusFirstChangedDataByFieldValue("string", result.cause);
                            Ext.MessageBox.alert(this.i18n._("Validation failed"), errorMsg);
                            return false;
                        }
                    } catch (e) {
                        var message = e.message;
                        if (message == null || message == "Unknown") {
                            message = i18n._("Please Try Again");
                        }
                        Ext.MessageBox.alert("Failed", message);
                        return false;
                    }
                }
            }
            return true;
        },
        
        beforeSave: function(isApply, handler) {
            this.gridPassList.getList(Ext.bind(function(saveList) {
                this.alterUrls(saveList.list);
                this.settings.passedUrls = saveList;
                handler.call(this, isApply);
            }, this));
        }
        
    });
}
//@ sourceURL=spyware-settings.js
