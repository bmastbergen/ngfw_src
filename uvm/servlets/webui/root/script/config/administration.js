Ext.define('Webui.config.administration', {
    extend: 'Ung.ConfigWin',
    displayName: 'Administration',
    hasReports: true,
    reportCategory: 'Administration',
    panelAdmin: null,
    panelPublicAddress: null,
    panelCertificates: null,
    certGeneratorWindow: null,
    panelSnmp: null,
    panelSkins: null,
    uploadedCustomLogo: false,
    initComponent: function() {
        this.countries = [
            [ "US", i18n._("United States") ], [ "AF", i18n._("Afghanistan") ], [ "AL", i18n._("Albania") ], [ "DZ", i18n._("Algeria") ],
            [ "AS", i18n._("American Samoa") ], [ "AD", i18n._("Andorra") ], [ "AO", i18n._("Angola") ], [ "AI", i18n._("Anguilla") ],
            [ "AQ", i18n._("Antarctica") ], [ "AG", i18n._("Antigua and Barbuda") ], [ "AR", i18n._("Argentina") ], [ "AM", i18n._("Armenia") ],
            [ "AW", i18n._("Aruba") ], [ "AU", i18n._("Australia") ], [ "AT", i18n._("Austria") ], [ "AZ", i18n._("Azerbaijan") ],
            [ "BS", i18n._("Bahamas") ], [ "BH", i18n._("Bahrain") ], [ "BD", i18n._("Bangladesh") ], [ "BB", i18n._("Barbados") ],
            [ "BY", i18n._("Belarus") ], [ "BE", i18n._("Belgium") ], [ "BZ", i18n._("Belize") ], [ "BJ", i18n._("Benin") ], [ "BM", i18n._("Bermuda") ],
            [ "BT", i18n._("Bhutan") ], [ "BO", i18n._("Bolivia") ], [ "BA", i18n._("Bosnia and Herzegovina") ], [ "BW", i18n._("Botswana") ],
            [ "BV", i18n._("Bouvet Island") ], [ "BR", i18n._("Brazil") ], [ "IO", i18n._("British Indian Ocean Territory") ],
            [ "VG", i18n._("British Virgin Islands") ], [ "BN", i18n._("Brunei") ], [ "BG", i18n._("Bulgaria") ], [ "BF", i18n._("Burkina Faso") ],
            [ "BI", i18n._("Burundi") ], [ "KH", i18n._("Cambodia") ], [ "CM", i18n._("Cameroon") ], [ "CA", i18n._("Canada") ],
            [ "CV", i18n._("Cape Verde") ], [ "KY", i18n._("Cayman Islands") ], [ "CF", i18n._("Central African Republic") ],
            [ "TD", i18n._("Chad") ], [ "CL", i18n._("Chile") ], [ "CN", i18n._("China") ], [ "CX", i18n._("Christmas Island") ],
            [ "CC", i18n._("Cocos Islands") ], [ "CO", i18n._("Colombia") ], [ "KM", i18n._("Comoros") ], [ "CG", i18n._("Congo - Brazzaville") ],
            [ "CK", i18n._("Cook Islands") ], [ "CR", i18n._("Costa Rica") ], [ "HR", i18n._("Croatia") ], [ "CU", i18n._("Cuba") ],
            [ "CY", i18n._("Cyprus") ], [ "CZ", i18n._("Czech Republic") ], [ "DK", i18n._("Denmark") ], [ "DJ", i18n._("Djibouti") ],
            [ "DM", i18n._("Dominica") ], [ "DO", i18n._("Dominican Republic") ], [ "EC", i18n._("Ecuador") ], [ "EG", i18n._("Egypt") ],
            [ "SV", i18n._("El Salvador") ], [ "GQ", i18n._("Equatorial Guinea") ], [ "ER", i18n._("Eritrea") ], [ "EE", i18n._("Estonia") ],
            [ "ET", i18n._("Ethiopia") ], [ "FK", i18n._("Falkland Islands") ], [ "FO", i18n._("Faroe Islands") ], [ "FJ", i18n._("Fiji") ],
            [ "FI", i18n._("Finland") ], [ "FR", i18n._("France") ], [ "GF", i18n._("French Guiana") ], [ "PF", i18n._("French Polynesia") ],
            [ "TF", i18n._("French Southern Territories") ], [ "GA", i18n._("Gabon") ], [ "GM", i18n._("Gambia") ], [ "GE", i18n._("Georgia") ],
            [ "DE", i18n._("Germany") ], [ "GH", i18n._("Ghana") ], [ "GI", i18n._("Gibraltar") ], [ "GR", i18n._("Greece") ],
            [ "GL", i18n._("Greenland") ], [ "GD", i18n._("Grenada") ], [ "GP", i18n._("Guadeloupe") ], [ "GU", i18n._("Guam") ],
            [ "GT", i18n._("Guatemala") ], [ "GN", i18n._("Guinea") ], [ "GW", i18n._("Guinea-Bissau") ], [ "GY", i18n._("Guyana") ],
            [ "HT", i18n._("Haiti") ], [ "HM", i18n._("Heard Island and McDonald Islands") ], [ "HN", i18n._("Honduras") ],
            [ "HK", i18n._("Hong Kong SAR China") ], [ "HU", i18n._("Hungary") ], [ "IS", i18n._("Iceland") ], [ "IN", i18n._("India") ],
            [ "ID", i18n._("Indonesia") ], [ "IR", i18n._("Iran") ], [ "IQ", i18n._("Iraq") ], [ "IE", i18n._("Ireland") ],
            [ "IL", i18n._("Israel") ], [ "IT", i18n._("Italy") ], [ "CI", i18n._("Ivory Coast") ], [ "JM", i18n._("Jamaica") ],
            [ "JP", i18n._("Japan") ], [ "JO", i18n._("Jordan") ], [ "KZ", i18n._("Kazakhstan") ], [ "KE", i18n._("Kenya") ],
            [ "KI", i18n._("Kiribati") ], [ "KW", i18n._("Kuwait") ], [ "KG", i18n._("Kyrgyzstan") ], [ "LA", i18n._("Laos") ],
            [ "LV", i18n._("Latvia") ], [ "LB", i18n._("Lebanon") ], [ "LS", i18n._("Lesotho") ], [ "LR", i18n._("Liberia") ],
            [ "LY", i18n._("Libya") ], [ "LI", i18n._("Liechtenstein") ], [ "LT", i18n._("Lithuania") ], [ "LU", i18n._("Luxembourg") ],
            [ "MO", i18n._("Macao SAR China") ], [ "MK", i18n._("Macedonia") ], [ "MG", i18n._("Madagascar") ], [ "MW", i18n._("Malawi") ],
            [ "MY", i18n._("Malaysia") ], [ "MV", i18n._("Maldives") ], [ "ML", i18n._("Mali") ], [ "MT", i18n._("Malta") ],
            [ "MH", i18n._("Marshall Islands") ], [ "MQ", i18n._("Martinique") ], [ "MR", i18n._("Mauritania") ], [ "MU", i18n._("Mauritius") ],
            [ "YT", i18n._("Mayotte") ], [ "FX", i18n._("Metropolitan France") ], [ "MX", i18n._("Mexico") ], [ "FM", i18n._("Micronesia") ],
            [ "MD", i18n._("Moldova") ], [ "MC", i18n._("Monaco") ], [ "MN", i18n._("Mongolia") ], [ "MS", i18n._("Montserrat") ],
            [ "MA", i18n._("Morocco") ], [ "MZ", i18n._("Mozambique") ], [ "MM", i18n._("Myanmar") ], [ "NA", i18n._("Namibia") ],
            [ "NR", i18n._("Nauru") ], [ "NP", i18n._("Nepal") ], [ "NL", i18n._("Netherlands") ], [ "AN", i18n._("Netherlands Antilles") ],
            [ "NC", i18n._("New Caledonia") ], [ "NZ", i18n._("New Zealand") ], [ "NI", i18n._("Nicaragua") ], [ "NE", i18n._("Niger") ],
            [ "NG", i18n._("Nigeria") ], [ "NU", i18n._("Niue") ], [ "NF", i18n._("Norfolk Island") ], [ "KP", i18n._("North Korea") ],
            [ "MP", i18n._("Northern Mariana Islands") ], [ "NO", i18n._("Norway") ], [ "OM", i18n._("Oman") ], [ "PK", i18n._("Pakistan") ],
            [ "PW", i18n._("Palau") ], [ "PA", i18n._("Panama") ], [ "PG", i18n._("Papua New Guinea") ], [ "PY", i18n._("Paraguay") ],
            [ "PE", i18n._("Peru") ], [ "PH", i18n._("Philippines") ], [ "PN", i18n._("Pitcairn") ], [ "PL", i18n._("Poland") ],
            [ "PT", i18n._("Portugal") ], [ "PR", i18n._("Puerto Rico") ], [ "QA", i18n._("Qatar") ], [ "RE", i18n._("Reunion") ],
            [ "RO", i18n._("Romania") ], [ "RU", i18n._("Russia") ], [ "RW", i18n._("Rwanda") ], [ "SH", i18n._("Saint Helena") ],
            [ "KN", i18n._("Saint Kitts and Nevis") ], [ "LC", i18n._("Saint Lucia") ], [ "PM", i18n._("Saint Pierre and Miquelon") ],
            [ "VC", i18n._("Saint Vincent and the Grenadines") ], [ "WS", i18n._("Samoa") ], [ "SM", i18n._("San Marino") ],
            [ "ST", i18n._("Sao Tome and Principe") ], [ "SA", i18n._("Saudi Arabia") ], [ "SN", i18n._("Senegal") ], [ "SC", i18n._("Seychelles") ],
            [ "SL", i18n._("Sierra Leone") ], [ "SG", i18n._("Singapore") ], [ "SK", i18n._("Slovakia") ], [ "SI", i18n._("Slovenia") ],
            [ "SB", i18n._("Solomon Islands") ], [ "SO", i18n._("Somalia") ], [ "ZA", i18n._("South Africa") ],
            [ "GS", i18n._("South Georgia and the South Sandwich Islands") ], [ "KR", i18n._("South Korea") ], [ "ES", i18n._("Spain") ],
            [ "LK", i18n._("Sri Lanka") ], [ "SD", i18n._("Sudan") ], [ "SR", i18n._("Suriname") ], [ "SJ", i18n._("Svalbard and Jan Mayen") ],
            [ "SZ", i18n._("Swaziland") ], [ "SE", i18n._("Sweden") ], [ "CH", i18n._("Switzerland") ], [ "SY", i18n._("Syria") ],
            [ "TW", i18n._("Taiwan") ], [ "TJ", i18n._("Tajikistan") ], [ "TZ", i18n._("Tanzania") ], [ "TH", i18n._("Thailand") ],
            [ "TG", i18n._("Togo") ], [ "TK", i18n._("Tokelau") ], [ "TO", i18n._("Tonga") ], [ "TT", i18n._("Trinidad and Tobago") ],
            [ "TN", i18n._("Tunisia") ], [ "TR", i18n._("Turkey") ], [ "TM", i18n._("Turkmenistan") ], [ "TC", i18n._("Turks and Caicos Islands") ],
            [ "TV", i18n._("Tuvalu") ], [ "VI", i18n._("U.S. Virgin Islands") ], [ "UG", i18n._("Uganda") ], [ "UA", i18n._("Ukraine") ],
            [ "AE", i18n._("United Arab Emirates") ], [ "GB", i18n._("United Kingdom") ], [ "UM", i18n._("United States Minor Outlying Islands") ],
            [ "UY", i18n._("Uruguay") ], [ "UZ", i18n._("Uzbekistan") ], [ "VU", i18n._("Vanuatu") ], [ "VA", i18n._("Vatican") ],
            [ "VE", i18n._("Venezuela") ], [ "VN", i18n._("Vietnam") ], [ "WF", i18n._("Wallis and Futuna") ], [ "EH", i18n._("Western Sahara") ],
            [ "YE", i18n._("Yemen") ], [ "ZM", i18n._("Zambia") ], [ "ZW", i18n._("Zimbabwe") ]
        ];
        this.breadcrumbs = [{
            title: i18n._("Configuration"),
            action: Ext.bind(function() {
                this.cancelAction();
            }, this)
        }, {
            title: i18n._('Administration')
        }];
        this.initialSkin = this.getSkinSettings().skinName;
        this.buildAdmin();
        this.buildPublicAddress();
        this.buildCertificates();
        this.buildSnmp();
        this.buildSkins();

        // builds the tab panel with the tabs
        var adminTabs = [this.panelAdmin, this.panelPublicAddress, this.panelCertificates, this.panelSnmp, this.panelSkins];
        this.buildTabPanel(adminTabs);
        this.tabs.setActiveTab(this.panelAdmin);
        this.callParent(arguments);
    },
    // get base settings object
    getSkinSettings: function(forceReload) {
        if (forceReload || this.rpc.skinSettings === undefined) {
            try {
                this.rpc.skinSettings = rpc.skinManager.getSettings();
            } catch (e) {
                Ung.Util.rpcExHandler(e);
            }
        }
        return this.rpc.skinSettings;
    },
    // get admin settings
    getAdminSettings: function(forceReload) {
        if (forceReload || this.rpc.adminSettings === undefined) {
            try {
                this.rpc.adminSettings = rpc.adminManager.getSettings();
            } catch (e) {
                Ung.Util.rpcExHandler(e);
            }

        }
        return this.rpc.adminSettings;
    },
    // get system settings
    getSystemSettings: function(forceReload) {
        if (forceReload || this.rpc.systemSettings === undefined) {
            try {
                this.rpc.systemSettings = rpc.systemManager.getSettings();
            } catch (e) {
                Ung.Util.rpcExHandler(e);
            }
        }
        return this.rpc.systemSettings;
    },
    // get Current Server CertInfo
    getCertificateInformation: function(forceReload) {
        if (forceReload || this.rpc.currentServerCertInfo === undefined) {
            try {
                this.rpc.currentServerCertInfo = Ung.Main.getCertificateManager().getCertificateInformation();
            } catch (e) {
                Ung.Util.rpcExHandler(e);
            }

        }
        return this.rpc.currentServerCertInfo;
    },
    // get hostname
    getHostname: function(forceReload) {
        if ( forceReload || this.rpc.hostname === undefined || this.rpc.domainName === undefined ) {
            try {
                this.rpc.hostname = rpc.networkManager.getNetworkSettings()['hostName'];
                this.rpc.domainName = rpc.networkManager.getNetworkSettings()['domainName'];
            } catch (e) {
                Ung.Util.rpcExHandler(e);
            }

        }
        if ( this.rpc.domainName !== null && this.rpc.domainName !== "" )
            return this.rpc.hostname + "." + this.rpc.domainName;
        else
            return this.rpc.hostname;
    },

    buildAdmin: function() {
        var changePasswordColumn = Ext.create("Ung.grid.EditColumn",{
            header: this.i18n._("change password"),
            width: 130,
            iconClass: 'icon-edit-row',
            handler: function(view, rowIndex, colIndex, item, e, record) {
                // populate row editor
                this.grid.rowEditorChangePass.populate(record);
                this.grid.rowEditorChangePass.show();
            }
        });
        var thisReporting = this;
        var passwordValidator = function (fieldValue) {
          //validate password match
            var panel = this.up("panel");
            var pwd = panel.down('textfield[name="password"]');
            var confirmPwd = panel.down('textfield[name="confirmPassword"]');
            if(pwd.getValue() != confirmPwd.getValue()) {
                pwd.markInvalid();
                return thisReporting.i18n._('Passwords do not match');
            }
            pwd.clearInvalid();
            confirmPwd.clearInvalid();
            return true;
        };
        this.gridAdminAccounts=Ext.create('Ung.grid.Panel', {
            flex: 1,
            settingsCmp: this,
            title: this.i18n._("Admin Accounts"),
            bodyStyle: 'padding-bottom:30px;',
            autoScroll: true,
            hasEdit: false,
            name: 'gridAdminAccounts',
            dataExpression: "getAdminSettings().users.list",
            recordJavaClass: "com.untangle.uvm.AdminUserSettings",
            emptyRow: {
                "username": "",
                "description": "",
                "emailAddress": "",
                "password": null,
                "passwordHashBase64": null
            },
            sortField: 'username',
            plugins: [changePasswordColumn],
            fields: [{
                name: 'username'
            }, {
                name: 'description'
            }, {
                name: 'emailAddress'
            }, {
                name: 'password'
            }, {
                name: 'passwordHashBase64'
            }],
            columns: [{
                header: this.i18n._("Username"),
                width: 200,
                dataIndex: 'username',
                field:{
                    xtype:'textfield',
                    allowBlank: false,
                    emptyText: this.i18n._("[enter username]"),
                    blankText: this.i18n._("The username cannot be blank.")
                }
            }, {
                header: this.i18n._("Description"),
                width: 200,
                dataIndex: 'description',
                flex: 1,
                editor:{
                    xtype:'textfield',
                    emptyText: this.i18n._("[no description]")
                }
            },{
                header: this.i18n._("Email"),
                width: 200,
                dataIndex: 'emailAddress',
                editor: {
                    xtype:'textfield',
                    emptyText: this.i18n._("[no email]"),
                    vtype: 'email'
                }
            }, changePasswordColumn],
            rowEditorInputLines: [{
                xtype: "textfield",
                name: "Username",
                dataIndex: "username",
                fieldLabel: this.i18n._("Username"),
                emptyText: this.i18n._("[enter username]"),
                allowBlank: false,
                blankText: this.i18n._("The username cannot be blank."),
                width: 400
            }, {
                xtype: "textfield",
                name: "Description",
                dataIndex: "description",
                fieldLabel: this.i18n._("Description"),
                emptyText: this.i18n._("[no description]"),
                width: 400
            },{
                xtype: "textfield",
                name: "Email",
                dataIndex: "emailAddress",
                fieldLabel: this.i18n._("Email"),
                emptyText: this.i18n._("[no email]"),
                vtype: 'email',
                width: 400
            },{
                xtype: "textfield",
                inputType: 'password',
                name: "password",
                dataIndex: "password",
                fieldLabel: this.i18n._("Password"),
                width: 400,
                minLength: 3,
                minLengthText: Ext.String.format(this.i18n._("The password is shorter than the minimum {0} characters."), 3)
            },{
                xtype: "textfield",
                inputType: 'password',
                name: "confirmPassword",
                dataIndex: "password",
                fieldLabel: this.i18n._("Confirm Password"),
                width: 400
            }]
        });

        this.gridAdminAccounts.rowEditorChangePass = Ext.create("Ung.RowEditorWindow",{
            grid: this.gridAdminAccounts,
            inputLines: [{
                xtype: "textfield",
                inputType: 'password',
                name: "password",
                dataIndex: "password",
                fieldLabel: this.i18n._("Password"),
                width: 400,
                minLength: 3,
                minLengthText: Ext.String.format(this.i18n._("The password is shorter than the minimum {0} characters."), 3),
                validator: passwordValidator
            }, {
                xtype: "textfield",
                inputType: 'password',
                name: "confirmPassword",
                dataIndex: "password",
                fieldLabel: this.i18n._("Confirm Password"),
                width: 400,
                validator: passwordValidator
            }]
        });

        this.gridAdminAccounts.subCmps.push(this.gridAdminAccounts.rowEditorChangePass);

        this.panelAdmin = Ext.create('Ext.panel.Panel',{
            name: 'panelAdmin',
            helpSource: 'administration_admin',
            title: this.i18n._('Admin'),
            layout: { type: 'vbox', align: 'stretch' },
            cls: 'ung-panel',
            items: [
                this.gridAdminAccounts, {
                    xtype: 'checkbox',
                    fieldLabel: this.i18n._('Allow HTTP Administration'),
                    labelWidth: 200,
                    style: "margin-top: 10px",
                    checked: this.getSystemSettings().httpAdministrationAllowed,
                    listeners: {
                        "change": {
                            fn: Ext.bind(function(elem, newValue) {
                                this.getSystemSettings().httpAdministrationAllowed = newValue;
                            }, this)
                        }
                    }
                }, {
                    xtype:'fieldset',
                    title: this.i18n._('Note:'),
                    items: [{
                        xtype: 'label',
                        html: this.i18n._('HTTP is open on non-WANs (internal interfaces) for blockpages and other services.') + "<br/>" +
                            this.i18n._('This settings only controls the availability of <b>administration</b> via HTTP.')
                    }]
                }]
        });
    },

    buildPublicAddress: function() {
        this.panelPublicAddress = Ext.create('Ext.panel.Panel',{
            name: 'panelPublicAddress',
            helpSource: 'administration_public_address',
            title: this.i18n._('Public Address'),
            cls: 'ung-panel',
            autoScroll: true,
            items: {
                xtype: 'fieldset',
                items: [{
                    xtype: 'component',
                    margin: '0 0 10 0',
                    html: Ext.String.format(this.i18n._('The Public Address is the address/URL that provides a public location for the {0} Server. This address will be used in emails sent by the {0} Server to link back to services hosted on the {0} Server such as Quarantine Digests and OpenVPN Client emails.'), rpc.companyName)
                },{
                    xtype: 'radio',
                    boxLabel: this.i18n._('Use IP address from External interface (default)'),
                    hideLabel: true,
                    name: 'publicUrl',
                    checked: this.getSystemSettings().publicUrlMethod == "external",
                    listeners: {
                        "change": {
                            fn: Ext.bind(function(elem, checked) {
                                if (checked) {
                                    this.getSystemSettings().publicUrlMethod = "external";
                                    this.panelPublicAddress.down('textfield[name="publicUrlAddress"]').disable();
                                    this.panelPublicAddress.down('numberfield[name="publicUrlPort"]').disable();
                                }
                            }, this)
                        }
                    }
                },{
                    xtype: 'component',
                    margin: '0 0 10 25',
                    html: Ext.String.format(this.i18n._('This works if your {0} Server has a routable public static IP address.'), rpc.companyName)
                },{
                    xtype: 'radio',
                    boxLabel: this.i18n._('Use Hostname'),
                    hideLabel: true,
                    name: 'publicUrl',
                    checked: this.getSystemSettings().publicUrlMethod == "hostname",
                    listeners: {
                        "change": {
                            fn: Ext.bind(function(elem, checked) {
                                if (checked) {
                                    this.getSystemSettings().publicUrlMethod = "hostname";
                                    this.panelPublicAddress.down('textfield[name="publicUrlAddress"]').disable();
                                    this.panelPublicAddress.down('numberfield[name="publicUrlPort"]').disable();
                                }
                            }, this)
                        }
                    }
                },{
                    xtype: 'component',
                    margin: '0 0 5 25',
                    html: Ext.String.format(this.i18n._('This is recommended if the {0} Server\'s fully qualified domain name looks up to its IP address both internally and externally.'),
                            rpc.companyName)
                }, {
                    xtype: 'component',
                    margin: '0 0 10 25',
                    html: Ext.String.format( this.i18n._( 'Current Hostname: {0}'), '<i>' + this.getHostname(true) + '</i>' )
                }, {
                    xtype: 'radio',
                    boxLabel: this.i18n._('Use Manually Specified Address'),
                    hideLabel: true,
                    name: 'publicUrl',
                    checked: this.getSystemSettings().publicUrlMethod == "address_and_port",
                    listeners: {
                        "afterrender": {
                            fn: Ext.bind(function(elem) {
                                if(elem.getValue()) {
                                    this.panelPublicAddress.down('textfield[name="publicUrlAddress"]').enable();
                                    this.panelPublicAddress.down('numberfield[name="publicUrlPort"]').enable();
                                } else {
                                    this.panelPublicAddress.down('textfield[name="publicUrlAddress"]').disable();
                                    this.panelPublicAddress.down('numberfield[name="publicUrlPort"]').disable();
                                }
                            }, this)
                        },
                        "change": {
                            fn: Ext.bind(function(elem, checked) {
                                if (checked) {
                                    this.getSystemSettings().publicUrlMethod = "address_and_port";
                                    this.panelPublicAddress.down('textfield[name="publicUrlAddress"]').enable();
                                    this.panelPublicAddress.down('numberfield[name="publicUrlPort"]').enable();
                                }
                            }, this)
                        }
                    }
                },{
                    xtype: 'component',
                    margin: '0 0 10 25',
                    html: Ext.String.format(this.i18n._('This is recommended if the {0} Server is installed behind another firewall with a port forward from the specified hostname/IP that redirects traffic to the {0} Server.'), rpc.companyName)
                },{
                    xtype: 'textfield',
                    margin: '0 0 5 25',
                    fieldLabel: this.i18n._('IP/Hostname'),
                    name: 'publicUrlAddress',
                    value: this.getSystemSettings().publicUrlAddress,
                    allowBlank: false,
                    width: 400,
                    blankText: this.i18n._("You must provide a valid IP Address or hostname."),
                    disabled: this.getSystemSettings().publicUrlMethod != "address_and_port"
                },{
                    xtype: 'numberfield',
                    margin: '0 0 5 25',
                    fieldLabel: this.i18n._('Port'),
                    name: 'publicUrlPort',
                    value: this.getSystemSettings().publicUrlPort,
                    allowDecimals: false,
                    minValue: 0,
                    allowBlank: false,
                    width: 210,
                    blankText: this.i18n._("You must provide a valid port."),
                    vtype: 'port',
                    disabled: this.getSystemSettings().publicUrlMethod != "address_and_port"
                }]
            }
        });
    },

    buildCertificates: function() {
        this.panelCertificates = Ext.create('Ext.panel.Panel', {
            name: 'panelCertificates',
            helpSource: 'administration_certificates',
            title: this.i18n._('Certificates'),
            cls: 'ung-panel',
            autoScroll: true,
            defaults: {
                xtype: 'fieldset'
            },
            items: [{
                title: this.i18n._('Certificate Authority'),
                defaults: { labelWidth: 150 },
                html: '<HR>',
                items: [{
                    xtype: 'component',
                    margin: '5 0 5 0',
                    html:  this.i18n._("The Certificate Authority is used to create and sign the HTTPS certificates used by several applications and services such as HTTPS Inspector and Captive Portal.  It can also be used to sign the internal web server certificate. To eliminate certificate security warnings on client computers and devices, you should download the root certificate and add it to the list of trusted authorities on each client connected to your network.")
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Valid starting'),
                    id: 'rootca_status_notBefore',
                    value: this.getCertificateInformation() == null ? "" : i18n.timestampFormat(this.getCertificateInformation().rootcaDateValid)
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Valid until'),
                    id: 'rootca_status_notAfter',
                    value: this.getCertificateInformation() == null ? "" : i18n.timestampFormat(this.getCertificateInformation().rootcaDateExpires)
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Subject DN'),
                    id: 'rootca_status_subjectDN',
                    value: this.getCertificateInformation() == null ? "" : this.getCertificateInformation().rootcaSubject
                },{
                    xtype: 'fieldset',
                    layout: 'column',
                    items: [{
                        xtype: 'button',
                        margin: '0 5 0 5',
                        minWidth: 200,
                        text: this.i18n._('Generate Certificate Authority'),
                        iconCls: 'action-icon',
                        handler: Ext.bind(function() {
                            this.certGeneratorPopup("ROOT", null, this.i18n._('Generate Certificate Authority'));
                        }, this)
                    },{
                        xtype: 'component',
                        margin: '0 5 0 5',
                        columnWidth: 1,
                        html: this.i18n._('Click here to re-create the internal certificate authority.  Use this to change the information in the Subject DN of the root certificate.')
                    }]
                },{
                    xtype: 'fieldset',
                    layout: 'column',
                    items: [{
                        xtype: 'button',
                        margin: '0 5 0 5',
                        minWidth: 200,
                        text: this.i18n._('Download Root Certificate'),
                        iconCls: 'action-icon',
                        handler: Ext.bind(function() {
                            var downloadForm = document.getElementById('downloadForm');
                            downloadForm["type"].value = "root_certificate_download";
                            downloadForm.submit();
                        }, this)
                    },{
                        xtype: 'component',
                        margin: '0 5 0 5',
                        columnWidth: 1,
                        html: this.i18n._('Click here to download the root certificate.  Installing this certificate on client devices will allow them to trust certificates generated by this server.')
                    }]
                },{
                    xtype: 'fieldset',
                    layout: 'column',
                    items: [{
                        xtype: 'button',
                        margin: '0 5 0 5',
                        minWidth: 200,
                        text: this.i18n._('Download Root Certificate Installer'),
                        iconCls: 'action-icon',
                        handler: Ext.bind(function() {
                            var downloadForm = document.getElementById('downloadForm');
                            downloadForm["type"].value = "root_certificate_installer_download";
                            downloadForm.submit();
                        }, this)
                    },{
                        xtype: 'component',
                        margin: '0 5 0 5',
                        columnWidth: 1,
                        html: this.i18n._('Click here to download the root certificate installer.  It installs the root certificate appropriately on a Windows device.')
                    }]
                }]
            },{
                title: this.i18n._('Server Certificate'),
                defaults: { labelWidth: 150 },
                html: '<HR>',
                items: [{
                    xtype: 'component',
                    margin: '5 0 5 0',
                    html:  this.i18n._("The Server Certificate is used to secure all HTTPS connections with this server.  There are two options for creating this certificate.  You can create a certificate signed by the Certificate Authority created and displayed above, or you can purchase a certificate that is signed by a third party certificate authority such as Thawte, Verisign, etc.")
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Valid starting'),
                    id: 'server_status_notBefore',
                    value: this.getCertificateInformation() == null ? "" : i18n.timestampFormat(this.getCertificateInformation().serverDateValid)
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Valid until'),
                    id: 'server_status_notAfter',
                    value: this.getCertificateInformation() == null ? "" : i18n.timestampFormat(this.getCertificateInformation().serverDateExpires)
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Issuer DN'),
                    id: 'server_status_issuerDN',
                    value: this.getCertificateInformation() == null ? "" : this.getCertificateInformation().serverIssuer
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Subject DN'),
                    id: 'server_status_subjectDN',
                    value: this.getCertificateInformation() == null ? "" : this.getCertificateInformation().serverSubject
                },{
                    xtype: 'displayfield',
                    fieldLabel: this.i18n._('Alternative Names'),
                    id: 'server_status_SAN',
                    value: this.getCertificateInformation() == null ? "" : this.getCertificateInformation().serverNames
                },{
                    xtype: 'fieldset',
                    layout: 'column',
                    items: [{
                        xtype: 'button',
                        margin: '0 5 0 5',
                        minWidth: 200,
                        text: this.i18n._('Generate Server Certificate'),
                        iconCls: 'action-icon',
                        handler: Ext.bind(function() {
                            this.certGeneratorPopup("SERVER", this.getHostname(true), this.i18n._('Generate Server Certificate'));
                        }, this)
                    },{
                        xtype: 'component',
                        margin: '0 5 0 5',
                        columnWidth: 1,
                        html: this.i18n._('Click here to create a server certificate signed by the Certificate Authority displayed above.  Use this to change the information in the Subject DN of the server certificate.')
                    }]
                }]
            },{
                title: this.i18n._('Third Party Server Certificate'),
                defaults: { labelWidth: 150 },
                items: [{
                    xtype: 'component',
                    margin: '5 0 5 0',
                    html:  this.i18n._("To use a server certificate signed by a third party certificate authority, you must first generate a Certificate Signing Request (CSR) using the first button below.  This will allow you to create a new CSR which will be downloaded to your computer.  You will provide this file to the certificate vendor of your choice, and they will use it to create a signed server certificate which you can import using the second button below.")
                },{
                    xtype: 'fieldset',
                    layout: 'column',
                    items: [{
                        xtype: 'component',
                        width: 20,
                        cls: 'step_counter',
                        html: '1'
                    },{
                        xtype: 'button',
                        margin: '0 5 0 5',
                        minWidth: 200,
                        text: this.i18n._('Create Signature Signing Request'),
                        iconCls: 'action-icon',
                        handler: Ext.bind(function() {
                            this.certGeneratorPopup("CSR", this.getHostname(true), this.i18n._("Create Signature Signing Request"));
                        }, this)
                    },{
                        xtype: 'component',
                        margin: '0 5 0 5',
                        columnWidth: 1,
                        html: this.i18n._('Click here to generate and download a new Certificate Signing Request (CSR) to your computer.')
                    }]
                },{
                    xtype: 'fieldset',
                    layout: 'column',
                    items: [{
                        xtype: 'component',
                        width: 20,
                        cls: 'step_counter',
                        html: '2'
                    },{
                        xtype: 'button',
                        margin: '0 5 0 5',
                        minWidth: 200,
                        text: this.i18n._('Import Signed Server Certificate'),
                        iconCls: 'action-icon',
                        handler: Ext.bind(function() { this.handleCertificateUpload(); }, this)
                    },{
                        xtype: 'component',
                        margin: '0 5 0 5',
                        columnWidth: 1,
                        html: this.i18n._('Click here to upload a signed server certificate that you received from the CSR you created in step one.')
                    }]
                }]
            }]
        });
    },

    certGeneratorPopup: function(certMode, hostName, titleText) {
        var helptipRenderer = function(c) {
            Ext.create('Ext.tip.ToolTip', {
                target: c.getEl(),
                html: c.helptip,
                dismissDelay: 0,
                anchor: 'bottom'
            });
        };

        try {
            netStatus = Ung.Main.getNetworkManager().getInterfaceStatus();
        } catch (e) {
            Ung.Util.rpcExHandler(e);
        }

        addressList = "";
        addressList += hostName;

        for( x = 0 ; x < netStatus.list.length ; x++)
        {
            var netItem = netStatus.list[x];
            if (netItem.v4Address === null) { continue; }
            addressList += ",";
            addressList += netItem.v4Address;
        }

        this.certGeneratorWindow = Ext.create("Ext.Window", {
            title: titleText,
            layout: 'fit',
            width: 600,
            height: (certMode === "ROOT" ? 320 : 360),
            border: true,
            modal: true,
            items: [{
                xtype: "form",
                layout: 'anchor',
                border: false,
                defaults: {
                    anchor: '98%',
                    margin: "10 10 10 10",
                    labelWidth: 150,
                    listeners: {
                        render: helptipRenderer
                    }
                },
                items: [{
                    xtype: 'combo',
                    fieldLabel: this.i18n._('Country') + " (C)",
                    name: 'Country',
                    id: 'Country',
                    helptip: this.i18n._("Select the country in which your organization is legally registered."),
                    allowBlank: true,
                    store: this.countries,
                    queryMode: 'local',
                    editable: false
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('State/Province') + " (ST)",
                    name: "State",
                    helptip: this.i18n._('Name of state, province, region, territory where your organization is located. Please enter the full name. Do not abbreviate.'),
                    allowBlank: false
                    
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('City/Locality') + " (L)",
                    name: "Locality",
                    helptip: this.i18n._('Name of the city/locality in which your organization is registered/located. Please spell out the name of the city/locality. Do not abbreviate.'),
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Organization') + " (O)",
                    name: "Organization",
                    helptip: this.i18n._("The name under which your business is legally registered. The listed organization must be the legal registrant of the domain name in the certificate request. If you are enrolling as a small business/sole proprietor, please enter the certificate requester's name in the 'Organization' field, and the DBA (doing business as) name in the 'Organizational Unit' field."),
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Organizational Unit ') + " (OU)",
                    name: "OrganizationalUnit",
                    helptip: this.i18n._("Optional. Use this field to differentiate between divisions within an organization. For example, 'Engineering' or 'Human Resources.' If applicable, you may enter the DBA (doing business as) name in this field."),
                    allowBlank: true
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Common Name') + " (CN)",
                    name: "CommonName",
                    helptip: this.i18n._("The name entered in the 'CN' (common name) field MUST be the fully-qualified domain name of the website for which you will be using the certificate (e.g., 'www.domainnamegoeshere'). Do not include the 'http://' or 'https://' prefixes in your common name. Do NOT enter your personal name in this field."),
                    allowBlank: false,
                    value: hostName
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Subject Alternative Names'),
                    name: "AltNames",
                    helptip: this.i18n._("Optional. Use this field to enter a comma seperated list of one or more alternative host names or IP addresses that may be used to access the website for which you will be using the certificate."),
                    allowBlank: true,
                    value: (certMode === "ROOT" ? "" : addressList),
                    hidden: (certMode === "ROOT" ? true : false)
                }],
                buttons: [{
                    xtype: "button",
                    text: this.i18n._("Generate"),
                    name: "Accept",
                    width: 120,
                    handler: Ext.bind(function() {
                        this.certGeneratorWorker(certMode);
                    }, this)
                },{
                    xtype: "button",
                    text: this.i18n._("Cancel"),
                    name: "Cancel",
                    width: 120,
                    handler: Ext.bind(function() {
                        this.certGeneratorWindow.close();
                    }, this)
                }]
            }]
        });

        this.certGeneratorWindow.show();
    },

    certGeneratorWorker: function(certMode)
    {
        var form_C = this.certGeneratorWindow.down('[name="Country"]');
        var form_ST = this.certGeneratorWindow.down('[name="State"]');
        var form_L = this.certGeneratorWindow.down('[name="Locality"]');
        var form_O = this.certGeneratorWindow.down('[name="Organization"]');
        var form_OU = this.certGeneratorWindow.down('[name="OrganizationalUnit"]');
        var form_CN = this.certGeneratorWindow.down('[name="CommonName"]');
        var form_SAN = this.certGeneratorWindow.down('[name="AltNames"]');

        if (form_C.getValue() == null)  { Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._('The Country field must not be empty')); return; }
        if (form_ST.getValue().length == 0) { Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._('The State field must not be empty')); return; }
        if (form_L.getValue().length == 0)  { Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._('The Locality field must not be empty')); return; }
        if (form_O.getValue().length == 0)  { Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._('The Organization field must not be empty')); return; }
        if (form_CN.getValue().length == 0) { Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._('The Common Name field must not be empty')); return; }

        var certSubject = ("/CN=" + form_CN.getValue());
        if ((form_C.getValue()) && (form_C.getValue().length > 0)) certSubject += ("/C=" + form_C.getValue());
        if ((form_ST.getValue()) && (form_ST.getValue().length > 0)) certSubject += ("/ST=" + form_ST.getValue());
        if ((form_L.getValue()) && (form_L.getValue().length > 0)) certSubject += ("/L=" + form_L.getValue());
        if ((form_O.getValue()) && (form_O.getValue().length > 0)) certSubject += ("/O=" + form_O.getValue());
        if ((form_OU.getValue()) && (form_OU.getValue().length > 0)) certSubject += ("/OU=" + form_OU.getValue());

        altNames = "";
        if ((form_SAN.getValue()) && (form_SAN.getValue().length > 0)) {
            altNames = form_SAN.getValue();
            var hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
            // Parse subject alt name list. For IP's prefix with both DNS: and IP:, for hostnames prefix with DNS:, otherwise is left unchanged
            var altNameTokens = altNames.split(',');
            var altNamesArray=[];
            for(var i=0; i<altNameTokens.length; i++) {
                var altName = altNameTokens[i].trim();
                if(Ext.form.VTypes.ipAddress(altName)) {
                    altName="IP:"+altName+",DNS:"+altName;
                } else if(hostnameRegex.test(altName)) {
                    altName="DNS:"+altName;
                }
                altNamesArray.push(altName);
            }
            altNames = altNamesArray.join(',');
        }

        // for a CSR we handle it like a file download which will cause the
        // client browser to prompt the user to save the resulting file
        if (certMode === "CSR")
        {
            this.certGeneratorWindow.close();
            var downloadForm = document.getElementById('downloadForm');
            downloadForm["type"].value = "certificate_request_download";
            downloadForm["arg1"].value = certSubject;
            downloadForm["arg2"].value = altNames;
            downloadForm.submit();
            return;
        }

        // for ROOT mode we just throw up a success dialog and refresh the display
        if (certMode === "ROOT")
        {
        certFunction = Ung.Main.getCertificateManager().generateCertificateAuthority;

            certFunction(Ext.bind(function(result)
            {
            this.certGeneratorWindow.close();
            refreshDisplay = this.updateCertificateDisplay();

                if (result)
                {
                Ext.MessageBox.alert(i18n._("Success"), i18n._("Certificate Authority generation successfully completed. Click OK to continue."), refreshDisplay);
                }
                else
                {
                Ext.MessageBox.alert(i18n._("Failure"), this.i18n._("Error during Certificate Authority generation.  Click OK to continue."), refreshDisplay);
                }

            }, this), certSubject, altNames);
        }

        // deal with restarting apache when creating a new server certificate
        if (certMode === "SERVER")
        {
        certFunction = Ung.Main.getCertificateManager().generateServerCertificate;

            certFunction(Ext.bind(function(result)
            {
            this.certGeneratorWindow.close();

                if (result)
                {
                // stop the metric manager so we don't get a session timeout error
                Ung.MetricManager.stop();

                // create a restart window
                var restartWindow = Ext.create('Ext.window.MessageBox', { minProgressWidth: 360 });

                // the cert manager will reload apache to activate the new cert
                // so we show a please wait message and then click to continue
                restartWindow.wait(i18n._("Generating server certificate and restarting web server..."), i18n._("Please Wait"), {
                    interval: 1000,
                    increment: 15,
                    duration: 15000,
                    scope: this,
                    fn: function() {
                        restartWindow.hide();
                        Ext.MessageBox.alert(i18n._("Success"), i18n._("Certificate generation successfully completed. Click OK to return to the main page."), Ung.Util.goToStartPage);
                        }
                    });
                }

                else
                {
                    Ext.MessageBox.alert(i18n._("Failure"), this.i18n._("Error during certificate generation."));
                }
            }, this), certSubject, altNames);
        }
    },

    handleCertificateUpload: function() {
        master = this;
        popup = new Ext.Window({
            title: this.i18n._("Import Signed Server Certificate"),
            layout: 'fit',
            width: 600,
            height: 120,
            border: true,
            xtype: 'form',
            items: [{
                xtype: "form",
                id: "upload_signed_cert_form",
                url: "upload",
                border: false,
                items: [{
                    xtype: 'filefield',
                    fieldLabel: this.i18n._("File"),
                    name: "filename",
                    id: "filename",
                    margin: "10 10 10 10",
                    width: 560,
                    labelWidth: 50,
                    allowBlank: false,
                    validateOnBlur: false
                }, {
                    xtype: "hidden",
                    name: "type",
                    value: "server_cert"
                    }]
                }],
                buttons: [{
                    xtype: "button",
                    text: this.i18n._("Upload Certificate"),
                    name: "Upload Certificate",
                    width: 200,
                    handler: Ext.bind(function() {
                        this.handleFileUpload();
                    }, this)
                }, {
                    xtype: "button",
                    text: this.i18n._("Cancel"),
                    name: "Cancel",
                    width: 100,
                    handler: Ext.bind(function() {
                        popup.close();
                    }, this)
                }]
        });

        popup.show();
    },

    handleFileUpload: function()
    {
        var prova = Ext.getCmp("upload_signed_cert_form");
        var fileText = prova.items.get(0);
        var form = prova.getForm();

        if (fileText.getValue().length === 0)
        {
            Ext.MessageBox.alert(this.i18n._("Invalid or missing File"), this.i18n._("Please select a certificate to upload."));
            return false;
        }

        form.submit({
            success: function(form, action) {
                popup.close();

                Ung.MetricManager.stop();

                // create a restart window
                var restartWindow = Ext.create('Ext.window.MessageBox', { minProgressWidth: 360 });

                // the cert manager will reload apache to activate the new cert
                // so we show a please wait message and then click to continue
                restartWindow.wait(i18n._("Uploading server certificate and restarting web server..."), i18n._("Please Wait"), {
                    interval: 1000,
                    increment: 15,
                    duration: 15000,
                    scope: this,
                    fn: function() {
                        restartWindow.hide();
                        Ext.MessageBox.alert(i18n._("Success"), i18n._("Certificate upload successfully completed. Click OK to return to the main page."), Ung.Util.goToStartPage);
                        }
                    });
                },

            failure: function(form, action) {
                popup.close();
                Ext.MessageBox.alert(i18n._("Failure"), action.result.msg);
                }
            });

        return true;
    },

    updateCertificateDisplay: function() {
        var certInfo = this.getCertificateInformation(true);
        if (certInfo != null) {
            Ext.getCmp('rootca_status_notBefore').setValue(i18n.timestampFormat(certInfo.rootcaDateValid));
            Ext.getCmp('rootca_status_notAfter').setValue(i18n.timestampFormat(certInfo.rootcaDateExpires));
            Ext.getCmp('rootca_status_subjectDN').setValue(certInfo.rootcaSubject);

            Ext.getCmp('server_status_notBefore').setValue(i18n.timestampFormat(certInfo.serverDateValid));
            Ext.getCmp('server_status_notAfter').setValue(i18n.timestampFormat(certInfo.serverDateExpires));
            Ext.getCmp('server_status_subjectDN').setValue(certInfo.serverSubject);
            Ext.getCmp('server_status_issuerDN').setValue(certInfo.serverIssuer);
        }
    },

    buildSnmp: function() {
        var passwordValidator = function () {
            var name = this.name;
            var confirmPos = name.search("Confirm");
            if( confirmPos != -1 ){
                name = name.substring( 0, confirmPos );
            }
            var panel = this.up("panel");
            var pwd = panel.down('textfield[name="' + name + '"]');
            var confirmPwd = panel.down('textfield[name="' + name + 'Confirm"]');
            if(pwd.getValue() != confirmPwd.getValue()) {
                pwd.markInvalid();
                return i18n._('Passwords do not match');
            }
            if( pwd.getValue().length < 8 ){
                pwd.markInvalid();
                return i18n._('Password is too short.');
            }
            pwd.clearInvalid();
            confirmPwd.clearInvalid();
            return true;
        };

        this.panelSnmp = Ext.create('Ext.panel.Panel',{
            name: 'panelSnmp',
            helpSource: 'administration_snmp',
            title: this.i18n._('SNMP'),
            cls: 'ung-panel',
            autoScroll: true,
            defaults: {
                xtype: 'fieldset'
            },
            items: [{
                title: this.i18n._('SNMP'),
                defaults: {
                    labelWidth: 200
                },
                items: [{
                    xtype: 'checkbox',
                    boxLabel: this.i18n._('Enable SNMP Monitoring'),
                    hideLabel: true,
                    name: 'snmpEnabled',
                    checked: this.getSystemSettings().snmpSettings.enabled,
                    listeners: {
                        "change": {
                            fn: Ext.bind(function(elem, checked) {
                                this.getSystemSettings().snmpSettings.enabled = checked;
                                if (checked) {
                                    Ext.getCmp('administration_snmp_communityString').enable();
                                    Ext.getCmp('administration_snmp_sysContact').enable();
                                    Ext.getCmp('administration_snmp_sysLocation').enable();
                                    Ext.getCmp('administration_snmp_v3enabled').enable();
                                    var v3EnabledCmp = Ext.getCmp('administration_snmp_v3enabled');
                                    if (v3EnabledCmp.getValue()) {
                                        Ext.getCmp('administration_snmp_v3required').enable();
                                        Ext.getCmp('administration_snmp_v3username').enable();
                                        Ext.getCmp('administration_snmp_v3authenticationProtocol').enable();
                                        Ext.getCmp('administration_snmp_v3authenticationPassphrase').enable();
                                        Ext.getCmp('administration_snmp_v3authenticationPassphraseConfirm').enable();
                                        Ext.getCmp('administration_snmp_v3privacyProtocol').enable();
                                        Ext.getCmp('administration_snmp_v3privacyPassphrase').enable();
                                        Ext.getCmp('administration_snmp_v3privacyPassphraseConfirm').enable();
                                    }
                                    Ext.getCmp('administration_snmp_sendTraps').enable();
                                    var sendTrapsCmp = Ext.getCmp('administration_snmp_sendTraps');
                                    if (sendTrapsCmp.getValue()) {
                                        Ext.getCmp('administration_snmp_trapCommunity').enable();
                                        Ext.getCmp('administration_snmp_trapHost').enable();
                                        Ext.getCmp('administration_snmp_trapPort').enable();
                                    }
                                } else {
                                    Ext.getCmp('administration_snmp_communityString').disable();
                                    Ext.getCmp('administration_snmp_sysContact').disable();
                                    Ext.getCmp('administration_snmp_sysLocation').disable();
                                    Ext.getCmp('administration_snmp_v3enabled').disable();
                                    Ext.getCmp('administration_snmp_v3required').disable();
                                    Ext.getCmp('administration_snmp_v3username').disable();
                                    Ext.getCmp('administration_snmp_v3authenticationProtocol').disable();
                                    Ext.getCmp('administration_snmp_v3authenticationPassphrase').disable();
                                    Ext.getCmp('administration_snmp_v3authenticationPassphraseConfirm').disable();
                                    Ext.getCmp('administration_snmp_v3privacyProtocol').disable();
                                    Ext.getCmp('administration_snmp_v3privacyPassphrase').disable();
                                    Ext.getCmp('administration_snmp_v3privacyPassphraseConfirm').disable();
                                    Ext.getCmp('administration_snmp_sendTraps').disable();
                                    Ext.getCmp('administration_snmp_trapCommunity').disable();
                                    Ext.getCmp('administration_snmp_trapHost').disable();
                                    Ext.getCmp('administration_snmp_trapPort').disable();
                                }
                            }, this)
                        }
                    }
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Community'),
                    name: 'communityString',
                    id: 'administration_snmp_communityString',
                    value: this.getSystemSettings().snmpSettings.communityString == 'CHANGE_ME' ? this.i18n._('CHANGE_ME'): this.getSystemSettings().snmpSettings.communityString,
                    allowBlank: false,
                    blankText: this.i18n._("An SNMP \"Community\" must be specified."),
                    disabled: !this.getSystemSettings().snmpSettings.enabled
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('System Contact'),
                    name: 'sysContact',
                    id: 'administration_snmp_sysContact',
                    value: this.getSystemSettings().snmpSettings.sysContact == 'MY_CONTACT_INFO' ? this.i18n._('MY_CONTACT_INFO'): this.getSystemSettings().snmpSettings.sysContact,
                    disabled: !this.getSystemSettings().snmpSettings.enabled
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('System Location'),
                    name: 'sysLocation',
                    id: 'administration_snmp_sysLocation',
                    value: this.getSystemSettings().snmpSettings.sysLocation == 'MY_LOCATION' ? this.i18n._('MY_LOCATION'): this.getSystemSettings().snmpSettings.sysLocation,
                    disabled: !this.getSystemSettings().snmpSettings.enabled
                },{
                    xtype: 'checkbox',
                    boxLabel: this.i18n._('Enable Traps'),
                    hideLabel: true,
                    name: 'sendTraps',
                    id: 'administration_snmp_sendTraps',
                    checked: this.getSystemSettings().snmpSettings.sendTraps,
                    disabled: !this.getSystemSettings().snmpSettings.enabled,
                    listeners: {
                        "change": {
                            fn: Ext.bind(function(elem, checked) {
                                this.getSystemSettings().snmpSettings.sendTraps = checked;
                                if (checked) {
                                    Ext.getCmp('administration_snmp_trapCommunity').enable();
                                    Ext.getCmp('administration_snmp_trapHost').enable();
                                    Ext.getCmp('administration_snmp_trapPort').enable();
                                } else {
                                    Ext.getCmp('administration_snmp_trapCommunity').disable();
                                    Ext.getCmp('administration_snmp_trapHost').disable();
                                    Ext.getCmp('administration_snmp_trapPort').disable();
                                }
                            }, this)
                        }
                    }
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Community'),
                    name: 'trapCommunity',
                    id: 'administration_snmp_trapCommunity',
                    value: this.getSystemSettings().snmpSettings.trapCommunity == 'MY_TRAP_COMMUNITY' ? this.i18n._('MY_TRAP_COMMUNITY'): this.getSystemSettings().snmpSettings.trapCommunity,
                    allowBlank: false,
                    blankText: this.i18n._("An Trap \"Community\" must be specified."),
                    disabled: !this.getSystemSettings().snmpSettings.enabled || !this.getSystemSettings().snmpSettings.sendTraps
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Host'),
                    name: 'trapHost',
                    id: 'administration_snmp_trapHost',
                    value: this.getSystemSettings().snmpSettings.trapHost == 'MY_TRAP_HOST' ? this.i18n._('MY_TRAP_HOST'): this.getSystemSettings().snmpSettings.trapHost,
                    allowBlank: false,
                    blankText: this.i18n._("An Trap \"Host\" must be specified."),
                    disabled: !this.getSystemSettings().snmpSettings.enabled || !this.getSystemSettings().snmpSettings.sendTraps
                },{
                    xtype: 'numberfield',
                    fieldLabel: this.i18n._('Port'),
                    name: 'trapPort',
                    id: 'administration_snmp_trapPort',
                    value: this.getSystemSettings().snmpSettings.trapPort,
                    allowDecimals: false,
                    minValue: 0,
                    allowBlank: false,
                    blankText: this.i18n._("You must provide a valid port."),
                    vtype: 'port',
                    disabled: !this.getSystemSettings().snmpSettings.enabled || !this.getSystemSettings().snmpSettings.sendTraps
                },{
                    xtype: 'checkbox',
                    boxLabel: this.i18n._('Enable SNMP v3'),
                    hideLabel: true,
                    name: 'snmpv3Enabled',
                    id: 'administration_snmp_v3enabled',
                    checked: this.getSystemSettings().snmpSettings.v3Enabled,
                    disabled: !this.getSystemSettings().snmpSettings.enabled,
                    listeners: {
                        "change": {
                            fn: Ext.bind(function(elem, checked) {
                                this.getSystemSettings().snmpSettings.v3enabled = checked;
                                if (checked) {
                                        Ext.getCmp('administration_snmp_v3required').enable();
                                        Ext.getCmp('administration_snmp_v3username').enable();
                                        Ext.getCmp('administration_snmp_v3authenticationPassphrase').enable();
                                        Ext.getCmp('administration_snmp_v3authenticationProtocol').enable();
                                        Ext.getCmp('administration_snmp_v3authenticationPassphraseConfirm').enable();
                                        Ext.getCmp('administration_snmp_v3privacyProtocol').enable();
                                        Ext.getCmp('administration_snmp_v3privacyPassphrase').enable();
                                        Ext.getCmp('administration_snmp_v3privacyPassphraseConfirm').enable();
                                } else {
                                    Ext.getCmp('administration_snmp_v3required').disable();
                                    Ext.getCmp('administration_snmp_v3username').disable();
                                    Ext.getCmp('administration_snmp_v3authenticationProtocol').disable();
                                    Ext.getCmp('administration_snmp_v3authenticationPassphrase').disable();
                                    Ext.getCmp('administration_snmp_v3authenticationPassphraseConfirm').disable();
                                    Ext.getCmp('administration_snmp_v3privacyProtocol').disable();
                                    Ext.getCmp('administration_snmp_v3privacyPassphrase').disable();
                                    Ext.getCmp('administration_snmp_v3privacyPassphraseConfirm').disable();
                                }
                            }, this)
                        }
                    }
                },{
                    xtype: 'textfield',
                    fieldLabel: this.i18n._('Username'),
                    name: 'snmpv3Username',
                    id: 'administration_snmp_v3username',
                    value: this.getSystemSettings().snmpSettings.v3Username,
                    allowBlank: false,
                    blankText: this.i18n._("Username must be specified."),
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled 
                },{    
                    xtype: 'combo',
                    fieldLabel: this.i18n._('Authentication Protocol'),
                    name: "snmpv3AuthenticationProtocol",
                    id: "administration_snmp_v3authenticationProtocol",
                    store: [
                        ["sha", this.i18n._("SHA") ],
                        ["md5", this.i18n._("MD5") ]
                    ],
                    editable: false,
                    queryMode: 'local',
                    value: this.getSystemSettings().snmpSettings.v3AuthenticationProtocol ? this.getSystemSettings().snmpSettings.v3AuthenticationProtocol : "sha",
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled
                },{
                    xtype: 'textfield',
                    inputType: 'password',
                    fieldLabel: this.i18n._('Authentication Passphrase'),
                    name: 'snmpv3AuthenticationPassphrase',
                    id: 'administration_snmp_v3authenticationPassphrase',
                    value: this.getSystemSettings().snmpSettings.v3AuthenticationPassphrase,
                    allowBlank: false,
                    blankText: this.i18n._("Authentication Passphrase must be specified."),
                    validator: passwordValidator,
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled 
                },{
                    xtype: 'textfield',
                    inputType: 'password',
                    fieldLabel: this.i18n._('Confirm Authentication Passphrase'),
                    name: 'snmpv3AuthenticationPassphraseConfirm',
                    id: 'administration_snmp_v3authenticationPassphraseConfirm',
//                        value: this.getSystemSettings().snmpSettings.v3AuthenticationPassphrase,
                    allowBlank: false,
                    blankText: this.i18n._("Confirm Authentication Passphrase must be specified."),
                    validator: passwordValidator,
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled 
                },{    
                    xtype: 'combo',
                    fieldLabel: this.i18n._('Privacy Protocol'),
                    name: "snmpv3PrivacyProtocol",
                    id: "administration_snmp_v3privacyProtocol",
                    store: [
                        ["des", this.i18n._("DES") ],
                        ["aes", this.i18n._("AES") ]
                    ],
                    editable: false,
                    queryMode: 'local',
                    value: this.getSystemSettings().snmpSettings.v3PrivacyProtocol ? this.getSystemSettings().snmpSettings.v3PrivacyProtocol : "des",
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled
                },{
                    xtype: 'textfield',
                    inputType: 'password',
                    fieldLabel: this.i18n._('Privacy Passphrase'),
                    name: 'snmpv3PrivacyPassphrase',
                    id: 'administration_snmp_v3privacyPassphrase',
                    value: this.getSystemSettings().snmpSettings.v3PrivacyPassphrase,
                    allowBlank: false,
                    blankText: this.i18n._("Privacy Passphrase must be specified."),
                    validator: passwordValidator,
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled 
                },{
                    xtype: 'textfield',
                    inputType: 'password',
                    fieldLabel: this.i18n._('Confirm Privacy Passphrase'),
                    name: 'snmpv3PrivacyPassphraseConfirm',
                    id: 'administration_snmp_v3privacyPassphraseConfirm',
//                        value: this.getSystemSettings().snmpSettings.v3PrivacyPassphrase,
                    allowBlank: false,
                    blankText: this.i18n._("Confirm Privacy Passphrase must be specified."),
                    validator: passwordValidator,
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled 
                },{
                    xtype: 'checkbox',
                    hideEmptyLabel: false,
                    boxLabel: this.i18n._('Require only SNMP v3'),
                    name: 'snmpv3Require',
                    id: 'administration_snmp_v3required',
                    checked: this.getSystemSettings().snmpSettings.v3Required,
                    validator: passwordValidator,
                    disabled: !this.getSystemSettings().snmpSettings.v3Enabled || !this.getSystemSettings().snmpSettings.enabled 
                }]
            }]
        });
    },

    buildSkins: function() {
        this.adminSkinsStore = Ext.create("Ext.data.JsonStore",{
            fields: [{
                name: 'name'
            },{
                name: 'displayName',
                convert: Ext.bind(function(v) {
                    if ( v == "Default" ) return this.i18n._("Default");
                    return v;
                }, this)
            }]
        });

        this.panelSkins = Ext.create('Ext.panel.Panel',{
            name: "panelSkins",
            helpSource: 'administration_skins',
            title: this.i18n._('Skins'),
            cls: 'ung-panel',
            autoScroll: true,
            defaults: {
                xtype: 'fieldset'
            },
            items: [{
                title: this.i18n._('Administration Skin'),
                items: [{
                    xtype: 'combo',
                    name: "skinName",
                    store: this.adminSkinsStore,
                    displayField: 'displayName',
                    valueField: 'name',
                    forceSelection: true,
                    editable: false,
                    queryMode: 'local',
                    hideLabel: true,
                    width: 300,
                    listeners: {
                        "select": {
                            fn: Ext.bind(function(elem, record) {
                                this.getSkinSettings().skinName = record.get("name");
                            }, this)
                        }
                    }
                }]
            },{
                title: this.i18n._('Upload New Skin'),
                items: {
                    xtype: 'form',
                    name: 'uploadSkinForm',
                    url: 'upload',
                    border: false,
                    items: [{
                        xtype: 'filefield',
                        fieldLabel: this.i18n._('File'),
                        name: 'uploadSkinFile',
                        width: 500,
                        labelWidth: 50,
                        allowBlank: false,
                        validateOnBlur: false
                    },{
                        xtype: 'button',
                        text: this.i18n._("Upload"),
                        handler: Ext.bind(function() {
                            this.panelSkins.onUpload();
                        }, this)
                    },{
                        xtype: 'hidden',
                        name: 'type',
                        value: 'skin'
                    }]
                }
            }],
            onUpload: Ext.bind(function() {
                var form = this.panelSkins.down('form[name="uploadSkinForm"]');
                form.submit({
                    waitMsg: this.i18n._('Please wait while your skin is uploaded...'),
                    success: Ext.bind(function( form, action ) {
                        rpc.skinManager.getSkinsList(Ext.bind(function(result, exception) {
                            if(Ung.Util.handleException(exception)) return;
                            var filefield = this.panelSkins.down('filefield[name="uploadSkinFile"]');
                            if ( filefield) {
                                filefield.reset();
                            }
                            this.adminSkinsStore.loadData(result.list);
                            Ext.MessageBox.alert( this.i18n._("Succeeded"), this.i18n._("Upload Skin Succeeded"));
                        }, this));
                    }, this ),
                    failure: Ext.bind(function( form, action ) {
                        var errorMsg = this.i18n._("Upload Skin Failed");
                        if (action.result && action.result.msg) {
                            switch (action.result.msg) {
                            case 'Invalid Skin':
                                errorMsg = this.i18n._("Invalid Skin");
                                break;
                            case 'The default skin can not be overwritten':
                                errorMsg = this.i18n._("The default skin can not be overwritten");
                                break;
                            case 'Error creating skin folder':
                                errorMsg = this.i18n._("Error creating skin folder");
                                break;
                            default:
                                errorMsg = this.i18n._("Upload Skin Failed");
                            }
                        }
                        Ext.MessageBox.alert(this.i18n._("Failed"), errorMsg);
                    }, this )
                });
            }, this)
        });
        rpc.skinManager.getSkinsList(Ext.bind(function(result, exception) {
            if(Ung.Util.handleException(exception)) return;
            this.adminSkinsStore.loadData(result.list);
            var skinCombo=this.panelSkins.down('combo[name="skinName"]');
            if(skinCombo!=null) {
                skinCombo.setValue(this.getSkinSettings().skinName);
                skinCombo.clearDirty();
            }
        }, this));
    },

    // validation function
    validate: function() {
        return  this.validateAdminAccounts() && this.validatePublicAddress() && this.validateSnmp();
    },

    //validate Admin Accounts
    validateAdminAccounts: function() {
        var listAdminAccounts = this.gridAdminAccounts.getList();
        var oneWritableAccount = false;

        // verify that the username is not duplicated
        for(var i=0; i<listAdminAccounts.length;i++) {
            for(var j=i+1; j<listAdminAccounts.length;j++) {
                if (listAdminAccounts[i].username == listAdminAccounts[j].username) {
                    Ext.MessageBox.alert(this.i18n._('Warning'), Ext.String.format(this.i18n._("The username name: \"{0}\" in row: {1}  already exists."), listAdminAccounts[j].username, j+1),
                        Ext.bind(function () {
                            this.tabs.setActiveTab(this.panelAdmin);
                        }, this)
                    );
                    return false;
                }
            }

            if (!listAdminAccounts[i].readOnly) {
                oneWritableAccount = true;
            }

        }

        // verify that there is at least one valid entry after all operations
        if(listAdminAccounts.length <= 0 ) {
            Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._("There must always be at least one valid account."),
                Ext.bind(function () {
                    this.tabs.setActiveTab(this.panelAdmin);
                }, this)
            );
            return false;
        }

        // verify that there was at least one non-read-only account
        if(!oneWritableAccount) {
            Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._("There must always be at least one non-read-only (writable) account."),
                Ext.bind(function () {
                    this.tabs.setActiveTab(this.panelAdmin);
                }, this)
            );
            return false;
        }

        return true;
    },

    //validate Public Address
    validatePublicAddress: function() {
        if (this.getSystemSettings().publicUrlMethod == "address_and_port") {
            var publicUrlAddressCmp = this.panelPublicAddress.down('textfield[name="publicUrlAddress"]');
            if (!publicUrlAddressCmp.isValid()) {
                Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._("You must provide a valid IP Address or hostname."),
                    Ext.bind(function () {
                        this.tabs.setActiveTab(this.panelPublicAddress);
                        publicUrlAddressCmp.focus(true);
                    }, this)
                );
                return false;
            }
            var publicUrlPortCmp = this.panelPublicAddress.down('numberfield[name="publicUrlPort"]');
            if (!publicUrlPortCmp.isValid()) {
                Ext.MessageBox.alert(this.i18n._('Warning'), Ext.String.format(this.i18n._("The port must be an integer number between {0} and {1}."), 1, 65535),
                    Ext.bind(function () {
                        this.tabs.setActiveTab(this.panelPublicAddress);
                        publicUrlPortCmp.focus(true);
                    }, this)
                );
                return false;
            }
            //prepare for save
            this.getSystemSettings().publicUrlAddress = publicUrlAddressCmp.getValue();
            this.getSystemSettings().publicUrlPort = publicUrlPortCmp.getValue();
        }

        return true;
    },

    //validate SNMP
    validateSnmp: function() {
        var isSnmpEnabled = this.getSystemSettings().snmpSettings.enabled;
        if (isSnmpEnabled) {
            var snmpCommunityCmp = Ext.getCmp('administration_snmp_communityString');
            if (!snmpCommunityCmp.isValid()) {
                Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._("An SNMP \"Community\" must be specified."),
                    Ext.bind(function () {
                        this.tabs.setActiveTab(this.panelSnmp);
                        snmpCommunityCmp.focus(true);
                    }, this)
                );
                return false;
            }

            var sendTrapsCmp = Ext.getCmp('administration_snmp_sendTraps');
            var isTrapEnabled = sendTrapsCmp.getValue();
            var snmpTrapCommunityCmp, snmpTrapHostCmp, snmpTrapPortCmp;
            if (isTrapEnabled) {
                snmpTrapCommunityCmp = Ext.getCmp('administration_snmp_trapCommunity');
                if (!snmpTrapCommunityCmp.isValid()) {
                    Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._("An Trap \"Community\" must be specified."),
                        Ext.bind(function () {
                            this.tabs.setActiveTab(this.panelSnmp);
                            snmpTrapCommunityCmp.focus(true);
                        }, this)
                    );
                    return false;
                }

                snmpTrapHostCmp = Ext.getCmp('administration_snmp_trapHost');
                if (!snmpTrapHostCmp.isValid()) {
                    Ext.MessageBox.alert(this.i18n._('Warning'), this.i18n._("An Trap \"Host\" must be specified."),
                        Ext.bind(function () {
                            this.tabs.setActiveTab(this.panelSnmp);
                            snmpTrapHostCmp.focus(true);
                        }, this)
                    );
                    return false;
                }

                snmpTrapPortCmp = Ext.getCmp('administration_snmp_trapPort');
                if (!snmpTrapPortCmp.isValid()) {
                    Ext.MessageBox.alert(this.i18n._('Warning'), Ext.String.format(this.i18n._("The port must be an integer number between {0} and {1}."), 1, 65535),
                        Ext.bind(function () {
                            this.tabs.setActiveTab(this.panelSnmp);
                            snmpTrapPortCmp.focus(true);
                        }, this)
                    );
                    return false;
                }
            }

            var v3EnabledCmp = Ext.getCmp('administration_snmp_v3enabled');
            var isV3Enabled = v3EnabledCmp.getValue();

            //prepare for save
            var snmpSysContactCmp = Ext.getCmp('administration_snmp_sysContact');
            var snmpSysLocationCmp = Ext.getCmp('administration_snmp_sysLocation');

            this.getSystemSettings().snmpSettings.communityString = snmpCommunityCmp.getValue();
            this.getSystemSettings().snmpSettings.sysContact = snmpSysContactCmp.getValue();
            this.getSystemSettings().snmpSettings.sysLocation = snmpSysLocationCmp.getValue();
            this.getSystemSettings().snmpSettings.sendTraps = isTrapEnabled;
            if (isTrapEnabled) {
                this.getSystemSettings().snmpSettings.trapCommunity = snmpTrapCommunityCmp.getValue();
                this.getSystemSettings().snmpSettings.trapHost = snmpTrapHostCmp.getValue();
                this.getSystemSettings().snmpSettings.trapPort = snmpTrapPortCmp.getValue();
            }

            this.getSystemSettings().snmpSettings.v3Enabled = isV3Enabled;
            if( isV3Enabled ){    
                this.getSystemSettings().snmpSettings.v3Required = Ext.getCmp('administration_snmp_v3required').getValue();
                this.getSystemSettings().snmpSettings.v3Username = Ext.getCmp('administration_snmp_v3username').getValue();
                this.getSystemSettings().snmpSettings.v3AuthenticationProtocol = Ext.getCmp('administration_snmp_v3authenticationProtocol').getValue();
                this.getSystemSettings().snmpSettings.v3AuthenticationPassphrase = Ext.getCmp('administration_snmp_v3authenticationPassphrase').getValue();
                this.getSystemSettings().snmpSettings.v3PrivacyProtocol = Ext.getCmp('administration_snmp_v3privacyProtocol').getValue();
                this.getSystemSettings().snmpSettings.v3PrivacyPassphrase = Ext.getCmp('administration_snmp_v3privacyPassphrase').getValue();
            }

        }
        return true;
    },
    beforeSave: function(isApply, handler) {
        handler.call(this, isApply);
    },
    save: function(isApply) {
        this.saveSemaphore = 2;
        Ext.MessageBox.wait(i18n._("Saving..."), i18n._("Please wait"));

        this.getAdminSettings().users.list=this.gridAdminAccounts.getList();

        rpc.adminManager.setSettings(Ext.bind(function(result, exception) {
            this.afterSave(exception, isApply);
        }, this), this.getAdminSettings());

        rpc.skinManager.setSettings(Ext.bind(function(result, exception) {
            this.afterSave(exception, isApply);
        }, this), this.getSkinSettings());
    },
    afterSave: function(exception, isApply) {
        if(Ung.Util.handleException(exception)) return;
        this.saveSemaphore--;
        if (this.saveSemaphore == 0) {
            // access settings should be saved last as saving these changes may disconnect the user from the Untangle box
            rpc.systemManager.setSettings(Ext.bind(function(result, exception) {
                if(Ung.Util.handleException(exception)) return;
                //If skin changed it needs a refresh
                if(this.initialSkin != this.getSkinSettings().skinName) {
                    Ung.Util.goToStartPage();
                    return;
                }
                if(isApply) {
                    this.getAdminSettings(true);
                    this.getCertificateInformation(true);
                    this.getHostname(true);
                    this.clearDirty();
                    Ext.MessageBox.hide();
                } else {
                    Ext.MessageBox.hide();
                    this.closeWindow();
                }
            }, this), this.getSystemSettings());
        }
    }
});
//# sourceURL=administration.js
