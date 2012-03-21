Ext.namespace('Ung');
Ext.namespace('Ung.SetupWizard');

Ung.SetupWizard.BOGUS_ADDRESS = "192.0.2.1";

// The location of the blank pixel image
Ext.BLANK_IMAGE_URL = '/ext/resources/images/default/s.gif';
// the main internationalization object
var i18n=null;
// the main json rpc object
var rpc = {};

var oemName = "Untangle";

Ung.SetupWizard.LabelWidth = 200;
Ung.SetupWizard.LabelWidth2 = 214;
Ung.SetupWizard.LabelWidth3 = 120;
Ung.SetupWizard.LabelWidth4 = 100;

Ext.define('Ung.SetupWizard.TextField', {
    extend:'Ext.form.TextField',
    onRender : function(ct, position)
    {
        Ung.SetupWizard.TextField.superclass.onRender.call(this, ct, position);

        var parent = this.el.parent();

        if( this.boxLabel ) {
            this.labelEl = parent.createChild({
                tag: 'label',
                htmlFor: this.el.id,
                cls: 'x-form-textfield-detail',
                html: this.boxLabel
            });
        }
    }
});

Ext.define('Ung.SetupWizard.NumberField', {
    extend:'Ext.form.NumberField',
    onRender : function(ct, position)
    {
        Ung.SetupWizard.NumberField.superclass.onRender.call(this, ct, position);

        var parent = this.el.parent();

        if( this.boxLabel ) {
            this.labelEl = parent.createChild({
                tag: 'label',
                htmlFor: this.el.id,
                cls: 'x-form-textfield-detail',
                html: this.boxLabel
            });
        }
    }
});

Ext.apply(Ext.form.field.VTypes, {
    ipCheck : function( val, field )
    {
        return val.match( this.ipCheckRegex );
    },
    ipCheckText : 'Please enter a valid IP Address',
    ipCheckRegex : /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,

    passwordConfirmCheck : function(val,field){
            var pass_original = Ext.getCmp(field.comparePasswordField);
        return val == pass_original.getValue();
    },

    passwordConfirmCheckText : 'Passwords do not match',

    hostname : function( val, field )
    {
        var labels = val.split( "." );
        for ( var c = 0 ; c < labels.length ; c++ ) {
            if ( !labels[c].match( this.hostnameRegex )) {
                return false;
            }
        }

        return true;
    },

    hostnameRegex : /^[0-9A-Za-z]([-/_0-9A-Za-z]*[0-9A-Za-z])?$/,

    hostnameText : "Please enter a valid hostname"
});

Ext.define('Ung.SetupWizard.Welcome', {
    constructor : function( config )
    {
        var panel = Ext.create('Ext.form.Panel',{
            items : [{
                xtype : 'label',
                html : '<h2 class="wizard-title">' + Ext.String.format(i18n._( "Thanks for choosing {0}!" ),oemName) + '</h2>'
            },{
                xtype : 'label',
                cls : 'noborder',
                html : Ext.String.format(i18n._( 'This wizard will guide you through the initial setup and configuration of the {0} Server.'),oemName) +
                    '<br/><br/>'+
                    Ext.String.format(i18n._('Click {0}Next{1} to get started.'),'<b>','</b>')
            }]
        });
        
        this.card = {
            title : i18n._( "Welcome" ),
            panel : panel
        };
    }
});

Ext.define('Ung.SetupWizard.Settings', {
    constructor : function( config )
    {
        this.panel = Ext.create('Ext.form.Panel',{
            defaultType : 'fieldset',
            defaults : {
                autoHeight : true,
                cls : 'noborder'
            },
            items : [{
                xtype : 'label',
                html : '<h2 class="wizard-title">'+i18n._( "Configure the Server" )+'</h2>'
            },{
                defaultType : 'textfield',
                defaults : {
                    msgTarget : 'side',
                    validationEvent : 'blur'
                },
                items : [{
                    xtype : 'label',
                    html : i18n._( '<b>Choose a password for the admin account.</b>' ),
                    border : false
                },{
                    inputType : 'text',
                    fieldLabel : i18n._('Login'),
                    name : 'login',
                    value : 'admin',
                    readOnly : true,
                    fieldClass : 'noborder',
                    itemCls : 'small-top-margin'
                },{
                    inputType : 'password',
                    fieldLabel : i18n._('Password'),
                    name : 'password',
                    id : 'settings_password',
                    allowBlank : false,
                    minLength : 3,
                    minLengthText : i18n.sprintf(i18n._("The password is shorter than the minimum %d characters."), 3)
                },{
                    inputType : 'password',
                    fieldLabel : i18n._('Confirm Password'),
                    name : 'confirmPassword',
                    allowBlank : false,
                    comparePasswordField : 'settings_password',
                    vtype : 'passwordConfirmCheck'
                }]
            },{
                items : [{
                    xtype : 'label',
                    html : i18n._( '<b>Select a timezone.</b>' ),
                    border : false
                },{
                    xtype : 'combo',
                    name : 'timezone',
                    editable : false,
                    store : Ung.SetupWizard.TimeZoneStore,
                    width : 350,
                    listWidth : 355,
                    hideLabel : true,
                    mode : 'local',
                    value : Ung.SetupWizard.CurrentValues.timezone,
                    triggerAction : 'all',
                    listClass : 'x-combo-list-small',
                    ctCls : 'small-top-margin'
                }]
            }]
        });

        this.card = {
            title : i18n._( "Settings" ),
            //cardTitle : i18n._( "Configure the Server" ),
            panel : this.panel,
            onNext : Ext.bind(this.saveSettings, this ),
            onValidate : Ext.bind(this.validateSettings,this)
        };
    },
    validateSettings : function()
    {
        var rv = _validate(this.panel.items.items);
        return rv;
    },
    saveSettings : function( handler )
    {
        Ext.MessageBox.wait( i18n._( "Saving Settings" ), i18n._( "Please Wait" ));
        var saver = Ext.create('Ung.SetupWizard.SettingsSaver',this.panel, handler );
        saver.savePassword();
    }
});

Ext.define('Ung.SetupWizard.SettingsSaver', {
    password : null,

    constructor : function( panel, handler )
    {
        this.panel = panel;
        this.handler = handler;
    },

    savePassword : function()
    {
        /* New Password */
        this.password = this.panel.query('textfield[name="password"]')[0].getValue();
        rpc.setup.setAdminPassword( Ext.bind(this.saveTimeZone, this), this.password );
    },

    saveTimeZone : function( result, exception )
    {
        if( exception ) {
            Ext.MessageBox.alert(i18n._( "Unable to save the admin password" ), exception.message );
            return;
            }

        var timezone = this.panel.query('textfield[name="timezone"]')[0].getValue();

        rpc.setup.setTimeZone( Ext.bind(this.authenticate,this ), timezone );
    },

    authenticate : function( result, exception )
    {
        if ( exception ) {
            Ext.MessageBox.alert("Unable to save Time zone settings",exception.message);
            return;
        }

        /* Cache the password to reauthenticate later */
        Ung.SetupWizard.ReauthenticateHandler.password = this.password;

        Ext.Ajax.request({
            params : {
                username : 'admin',
                password : this.password
            },
            /* If it uses the default type then this will not work
             * because the authentication handler does not like utf8 */
            headers : {
                'Content-Type' : "application/x-www-form-urlencoded"
            },
            url : '/auth/login?url=/webui/setupSettings.js&realm=Administrator',
            callback : Ext.bind(this.getManagers,this )
        });
    },

    getManagers : function( options, success, response )
    {
        if ( success ) {
            eval( response.responseText );
            /* It is very wrong to do this all synchronously */
            rpc.jsonrpc = new JSONRpcClient( "/webui/JSON-RPC" );
            rpc.adminManager = rpc.jsonrpc.UvmContext.adminManager();
            rpc.networkManager = rpc.jsonrpc.UvmContext.networkManager();
            rpc.connectivityTester = rpc.jsonrpc.UvmContext.getConnectivityTester();
            rpc.toolboxManager = rpc.jsonrpc.UvmContext.toolboxManager();
            rpc.mailSender = rpc.jsonrpc.UvmContext.mailSender();

            Ext.MessageBox.hide();
            this.handler();
        } else {
            Ext.MessageBox.alert( i18n._( "Unable to save password." ));
        }
    }
});

Ext.define('Ung.SetupWizard.Interfaces', {
    constructor : function()
    {
        this.interfaceStore = Ext.create('Ext.data.ArrayStore',{
            fields:[{ name : "name" }, { name : "status" }],
            data : []
        });

        this.enableAutoRefresh = true;

        this.interfaceGrid = Ext.create('Ext.grid.Panel',{
            store : this.interfaceStore,
            loadMask : true,
            stripeRows : true,
            baseCls : 'small-top-margin',
            enableColumnResize : false,
            autoResizeColumn : 2,
            disableSelection : false,
            selModel : Ext.create('Ext.selection.RowModel',{singleSelect : true}),
            enableDragDrop : true,
            ddGroup : 'interfaceDND',
            ddText : '',
            viewConfig:{
               forceFit : true,
               plugins:{
                    ptype: 'gridviewdragdrop',
                    dragText: '',
                    dragGroup:'interfaceDND',
                    dropGroup:'interfaceDND'
                },
                listeners: {
                    "drop": {
                        fn:  Ext.bind(this.onDrop,this )
                    }
                }
            },
            height : 200,
            width : 470,
            columns : [{
                header : i18n._( "Name" ),
                dataIndex : 'name',
                sortable : false,
                fixed : true,
                width : 80,
                renderer : function( value ) {
                    return i18n._( value );
                }
            },{
                header : i18n._( "Status" ),
                dataIndex : 'status',
                sortable : false,
                renderer : function( value ) {
                    var divClass = "draggable-disabled-interface";
                    var status = i18n._( "unknown" );

                    if (value[3] == "Unknown") {
                        value[3] = i18n._("Unknown Vendor");
                    }
                    
                    if ( value[1] == "connected" ) {
                        status = i18n._( "connected" ) + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + " [" + value[0] + " | " + value[2] + " | " + value[3] + "]";
                        divClass = "draggable-enabled-interface";
                    }
                    if ( value[1] == "disconnected" ) {
                        status = i18n._( "disconnected" ) + "&nbsp;&nbsp;" + " [" + value[0] + " | " + value[2] + " | " + value[3] + "]";
                        divClass = "draggable-disabled-interface";
                    }
                    
                    return "<div class='" + divClass + "'>" + status + "</div>";
                },
                width : 475
            }]
        });

        
        var panelTitle = i18n._('Identify Network Cards');
        var panelText = "<font color=\"red\"><b>" + i18n._( "Important:") + "</b></font>";
        panelText += i18n._( " This step identifies the external, internal, and other network cards. ");
        panelText += "<br/>";
        panelText += "<br/>";

        panelText += "<b>" + i18n._("Step 1: ") + "</b>";
        panelText += i18n._( "Plug an active cable into one network card to determine which network card it is.");
        panelText += "<br/>";
        
        panelText += "<b>" + i18n._("Step 2: ") + "</b>";
        panelText += "<b>" + i18n._( "Drag and drop") + "</b>" + i18n._(" the network card to map it to the desired interface.");
        panelText += "<br/>";

        panelText += "<b>" + i18n._("Step 3: ") + "</b>";
        panelText += i18n._( "Repeat steps 1 and 2 for each network card and then click <i>Next</i>.");
        panelText += "<br/>";
        
        var panel = Ext.create('Ext.panel.Panel',{
            defaults : { cls : 'noborder' },
            items : [{
                html : '<h2 class=" wizard-title">'+panelTitle+'<h2>',
                border : false
            },{
                xtype : 'label',
                html : panelText,
                border : false
            }, this.interfaceGrid ]
        });

        this.isDragAndDropInitialized = false;

        this.card = {
            title : i18n._( "Network Cards" ),
            panel : panel,
            onLoad : Ext.bind(function( complete ) {

                this.refreshInterfaces();
                
                if ( this.isDragAndDropInitialized == false ) {
                    this.initializeDragAndDrop();
                }
                this.isDragAndDropInitialized = true;

                this.enableAutoRefresh = true;
                this.autoRefreshInterfaces();
                
                complete();
            }, this ),

            onNext : Ext.bind(this.saveInterfaceList, this )
        };
    },

    initializeDragAndDrop : function()
    {
        var data = this.fixInterfaceList( Ung.SetupWizard.CurrentValues.interfaceArray );

        this.interfaceStore.loadData( data );

    },

    onDrop : function(node,data,overModel,dropPosition,dropFunction, options)
    {
        var sm = this.interfaceGrid.getSelectionModel();
        var rows=sm.getSelection();

        if ( rows.length != 1 ) {
            return false;
        }
        var status = rows[0].get("status");
        var origStatus = overModel.get("status");

        this.interfaceStore.each( function( currentRow ) {
            if ( currentRow == overModel) {
                currentRow.set("status", status);
            }
            if ( currentRow == rows[0]) {
                currentRow.set("status", origStatus);
            }
        });
        sm.clearSelections();
    },

    /* Given a list of interfaces, this takes out the ones that are not used */
    fixInterfaceList : function( interfaceArray )
    {
        var cleanArray = [];

        var data = interfaceArray.list;
        var c, i;

        for ( c = 0 ;  c < data.length ; c++ ) {
            i = data[c];
            /* This is the VPN interfaces, and this is a magic number. */
            if ( i.systemName.indexOf( 'tun0' ) == 0 ) continue;

            /* This is an interface that does not exist */
            if ( i.systemName.indexOf( 'nointerface' ) == 0 ) continue;

            cleanArray.push( i );
        }

        /* Now create a new array, in order to handle reordering, it is better
         * to just have two few fields */
        interfaceList = [];

        for ( c = 0 ; c < cleanArray.length ; c++ ) {
            i = cleanArray[c];
            if (i.vendor == null) 
                i.vendor = "Unknown";
            if (i.macAddress == null) 
                i.macAddress = "";
            interfaceList.push( [ i.name, [ i.systemName, i.connectionState, i.macAddress, i.vendor ]] );
        }

        return interfaceList;
    },

    saveInterfaceList : function( handler )
    {
        Ext.MessageBox.wait( i18n._( "Remapping Network Interfaces" ), i18n._( "Please Wait" ));

        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.afterReauthenticate,this, [ handler ] ));

        /* disable auto refresh */
        this.enableAutoRefresh = false;
        
        console.log("before refresh network config");
        
        /* do this before the next step */
        rpc.setup.refreshNetworkConfig();
    },

    afterReauthenticate : function( handler )
    {
        console.log("afterReauthenticate");
        /* Commit the store to get rid of the change marks */
        this.interfaceStore.sync();

        /* Build the two interface arrays */
        var osArray = [];
        var userArray = [];
        this.interfaceStore.each( function( currentRow ) {
            var status = currentRow.get( "status" );
            userArray.push( currentRow.get( "name" ));
            osArray.push( status[0] );
        });

        console.log("Remapping interfaces....");
        rpc.networkManager.remapInterfaces( Ext.bind(this.errorHandler, this, [ handler ], true ), osArray, userArray );
    },

    errorHandler : function( result, exception, foo, handler )
    {
        console.log("Error handler");
        if(exception) {
            Ext.MessageBox.alert(i18n._( "Unable to remap the interfaces." ), exception.message );
            return;
        }

        Ext.MessageBox.hide();
        handler();
    },

    refreshInterfaces : function()
    {
        Ext.MessageBox.wait( i18n._( "Refreshing Network Interfaces" ), i18n._( "Please Wait" ));
        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.refreshInterfaces,this ));
    },

    autoRefreshInterfacesCallback : function( result, exception ) {
        if(exception != null) {
            Ext.MessageBox.alert(exception);
            return;
        }

        if (this.enableAutoRefresh) {
            Ext.defer(this.autoRefreshInterfaces,3000,this);
            this.completeRefreshInterfaces( result, exception );
        }
    },
    
    autoRefreshInterfaces : function() {
        rpc.networkManager.updateLinkStatus();
        rpc.networkManager.getNetworkConfiguration( Ext.bind(this.autoRefreshInterfacesCallback, this ) );
    },
    
    refreshInterfaces : function()
    {
        rpc.networkManager.updateLinkStatus();
        rpc.networkManager.getNetworkConfiguration( Ext.bind(this.completeRefreshInterfaces,this ) );
    },

    completeRefreshInterfaces : function( result, exception )
    {
        if ( exception ) {
            Ext.MessageBox.show({
                title:i18n._( "Unable to refresh the interfaces." ),
                msg:exception.message,
                width:300,
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.INFO
            });
            return;
        }

        var interfaceList = this.fixInterfaceList( result.interfaceList );

        if ( interfaceList.length != this.interfaceStore.getCount()) {
            Ext.MessageBox.alert( i18n._( "New interfaces" ), i18n._ ( "There are new interfaces, please restart the wizard." ), "" );
            return;
        }

        if ( interfaceList.length < 2) {
            Ext.MessageBox.alert( i18n._( "Missing interfaces" ), i18n._ ( "Untangle requires two or more network cards. Please reinstall with at least two network cards." ), "" );
            return;
        }
        
        var statusHash = {};
        /* XXX This status array is brittle and should be refactored. XXXX */
        for ( var c = 0 ;c < interfaceList.length ; c++ ) {
            var status = interfaceList[c][1];
            statusHash[status[0]] = status;
        }

        /* This is designed to handle the case where the interfaces have been remapped. */
        this.interfaceStore.each( function( currentRow ) {
            var status = currentRow.get( "status" );
            currentRow.set( "status", statusHash[status[0]]);
        });

        Ext.MessageBox.hide();
    }
});

Ext.define('Ung.SetupWizard.Internet', {
    constructor : function( config )
    {
        this.configTypes = [];
        this.configTypes.push( [ "dynamic", i18n._( "Dynamic (DHCP)" ) ] );
        this.configTypes.push( [ "static", i18n._( "Static" ) ] );
        this.configTypes.push( [ "pppoe", i18n._( "PPPoE" ) ] );

        this.cards = [];

        this.cards.push( this.dhcpPanel = Ext.create('Ext.form.Panel',{
            saveData : Ext.bind(this.saveDHCP,this ),
            border : false,
            cls : 'network-card-form-margin',
            labelWidth : Ung.SetupWizard.LabelWidth,
            defaultType : 'textfield',
            items : [{
                xtype : 'fieldset',
                title : i18n._( "DHCP Status" ),
                defaultType : 'textfield',
                defaults : {
                    readOnly : true,
                    fieldClass : 'noborder'
                },
                autoHeight : true,
                items : [{
                    name : "ip",
                    fieldLabel : i18n._( "IP Address" )
                },{
                    name : "netmask",
                    fieldLabel : i18n._( "Netmask" )
                },{
                    name : "gateway",
                    fieldLabel : i18n._( "Gateway" )
                },{
                    name : "dns1",
                    fieldLabel : i18n._( "Primary DNS" )
                },{
                    name : "dns2",
                    fieldLabel : i18n._( "Secondary DNS" )
                },{
                    xtype : 'button',
                    text : i18n._( 'Refresh' ),
                    handler : Ext.bind(this.refresh,this ),
                    disabled : false,
                    cls : 'right-align'
                },{
                    xtype : 'button',
                    text : i18n._( 'Test Connectivity' ),
                    //cls : 'test-connectivity',
                    handler : Ext.bind( this.testConnectivity, this, [null] ),
                    disabled : false
                }]
            }]}));


        this.cards.push( this.staticPanel = Ext.create('Ext.form.Panel',{
            saveData : Ext.bind(this.saveStatic,this ),
            border : false,
            cls : 'network-card-form-margin',
            labelWidth : Ung.SetupWizard.LabelWidth,
            defaultType : 'textfield',
            items : [{
                xtype : 'fieldset',
                title : i18n._( "Static Settings" ),
                defaultType : 'textfield',
                defaults : {
                    disabled : false,
                    msgTarget : 'side',
                    validationEvent : 'blur',
                    maskRe : /(\d+|\.)/,
                    vtype : 'ipCheck'
                },
                autoHeight : true,
                items : [{
                    name : "ip",
                    fieldLabel : i18n._( "IP Address" ),
                    allowBlank : false
                },{
                    name : "netmask",
                    fieldLabel : i18n._( "Netmask" ),
                    xtype : 'combo',
                    store : Ung.SetupWizard.NetmaskData,
                    mode : 'local',
                    triggerAction : 'all',
                    width : 120,
                    listWidth : 125,
                    value : "255.255.255.0",
                    editable : false,
                    allowBlank : false
                },{
                    name : "gateway",
                    fieldLabel : i18n._( "Gateway" ),
                    allowBlank : false
                },{
                    name : "dns1",
                    fieldLabel : i18n._( "Primary DNS" ),
                    allowBlank : false
                },{
                    name : "dns2",
                    fieldLabel : i18n._( "Secondary DNS (optional)"),
                    allowBlank : true
                },{
                    xtype : 'button',
                    text : i18n._( 'Test Connectivity' ),
                    cls : 'test-connectivity-2',
                    handler : Ext.bind( this.testConnectivity, this, [null] ),
                    disabled : false
                }]
            }]}));

        /* PPPoE Panel */
        this.pppoePanel = Ext.create('Ext.form.Panel',{
            saveData : Ext.bind(this.savePPPoE,this ),
            border : false,
            cls : 'network-card-form-margin',
            labelWidth : Ung.SetupWizard.LabelWidth2,
            defaultType : 'textfield',
            items : [{
                xtype : 'label',
                cls : 'noborder',
                border : false,
                html : Ext.String.format( i18n._( 'Using PPPoE on {0} is <b>NOT</b> recommended.' ), oemName) + "<br/>" +
                    i18n._("It is recommended to use the ISP-supplied modem in bridge mode to handle PPPoE.") + "<br/>" +
                    "&nbsp;<br/>"
            }, {
                xtype : 'fieldset',
                title : i18n._( "PPPoE Settings" ),
                defaultType : 'textfield',
                autoHeight : true,
                items : [{
                    fieldLabel : i18n._( "Username" ),
                    name : "username",
                    disabled : false,
                    readOnly : false,
                    fieldClass : '',
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px'
                },{
                    name : "password",
                    inputType : 'password',
                    fieldLabel : i18n._( "Password" ),
                    disabled : false,
                    readOnly : false,
                    fieldClass : '',
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px'
                }]
            }, {
                xtype : 'fieldset',
                title : i18n._( "PPPoE Status" ),
                defaultType : 'textfield',
                defaults : {
                    readOnly : true
                },
                autoHeight : true,
                items : [{
                    fieldLabel : i18n._( "IP Address" ),
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px',
                    name : "ip",
                    fieldClass : 'noborder'
                },{
                    fieldLabel : i18n._( "Netmask" ),
                    name : "netmask",
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px',
                    fieldClass : 'noborder'
                },{
                    name : "gateway",
                    fieldLabel : i18n._( "Gateway" ),
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px',
                    fieldClass : 'noborder'
                },{
                    name : "dns1",
                    fieldLabel : i18n._( "Primary DNS" ),
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px',
                    fieldClass : 'noborder'
                },{
                    name : "dns2",
                    fieldLabel : i18n._( "Secondary DNS" ),
                    labelStyle : 'width : '+Ung.SetupWizard.LabelWidth+'px',
                    fieldClass : 'noborder'
                },{
                    xtype : 'button',
                    text : i18n._( 'Refresh' ),
                    handler : Ext.bind(this.refresh,this ),
                    disabled : false,
                    cls : 'right-align'
                },{
                    xtype : 'button',
                    text : i18n._( 'Test Connectivity' ),
                    cls : 'test-connectivity',
                    handler : Ext.bind( this.testConnectivity, this, [null] ),
                    disabled : false
                }]
            }]});
        this.cards.push( this.pppoePanel );


        this.cardPanel = Ext.create('Ext.panel.Panel',{
            cls : 'untangle-form-panel',
            border : false,
            layout : 'card',
            items : this.cards,
            autoHeight : true,
            activePanel : 0,
            defaults : {
                autoHeight : true,
                border : false
                }
        });

        var configureText = i18n._("Configure the Internet Connection");
        
        var configure = Ext.create('Ext.form.Panel',{
            cls : "untangle-form-panel",
            border : false,
            autoHeight : true,
            labelWidth : Ung.SetupWizard.LabelWidth2,
            items : [{
                html : '<h2 class="wizard-title">'+configureText+'<h2>',
                border : false
            },{
                xtype : 'combo',
                fieldLabel : i18n._('Configuration Type'),
                name : 'configType',
                editable : false,
                store : this.configTypes,
                labelWidth : Ung.SetupWizard.LabelWidth2,
                mode : 'local',
                listeners : {
                    "select" : {
                        fn : Ext.bind(this.onSelectConfig,this )
                    }
                },
                width : 350,
                listWidth : 120,
                value : this.configTypes[0][0],
                triggerAction : 'all',
                listClass : 'x-combo-list-small'
            }]
        });

        var panel = Ext.create('Ext.panel.Panel',{
            cls : null,
            defaults : {
                cls : null
            },
            items : [ configure, this.cardPanel]
        });

        this.isInitialized = false;

        var cardTitle = i18n._( "Internet Connection" );
        this.card = {
            title : cardTitle,
            panel : panel,
            onLoad : Ext.bind(function( complete )
            {
                if ( !this.isInitialized ) {
                    this.cardPanel.layout.setActiveItem( 0 );
                }

                this.refreshNetworkDisplay();

                this.isInitialized = true;
                complete();
            },this),
            onNext : Ext.bind(this.testConnectivity,this ),
            onValidate : Ext.bind(this.validateInternetConnection,this)
        };
    },

    validateInternetConnection : function()
    {
        return _validate(this.cardPanel.layout.activeItem.items.items);
    },

    onSelectConfig : function( combo, record, index )
    {
        this.cardPanel.layout.setActiveItem( index );
    },

    afterReauthenticate : function( handler )
    {
        console.log("afterReauth(1)");
        this.cardPanel.layout.activeItem.saveData( handler );
        console.log("afterReauth(2)");
    },

    saveDHCP : function( handler, hideWindow )
    {
        if ( hideWindow == null ) {
            hideWindow = true;
        }

        var wanConfig = Ung.SetupWizard.CurrentValues.wanConfiguration;
        wanConfig.configType = "dynamic";

        var complete = Ext.bind(this.complete, this, [ handler, hideWindow ], true );
        rpc.networkManager.setSetupSettings( complete, wanConfig );
    },

    saveStatic : function( handler, hideWindow )
    {
        var wanConfig = Ung.SetupWizard.CurrentValues.wanConfiguration;
        wanConfig.configType = "static";

        if ( hideWindow == null ) {
            hideWindow = true;
        }

        // delete unused stuff
        delete wanConfig.primaryAddress;
        delete wanConfig.dns1Str;
        delete wanConfig.dns2Str;
        delete wanConfig.gatewayStr;

        wanConfig.primaryAddressStr = this.staticPanel.query('textfield[name="ip"]')[0].getValue() + "/" + this.staticPanel.query('textfield[name="netmask"]')[0].getValue();
        wanConfig.gateway = this.staticPanel.query('textfield[name="gateway"]')[0].getValue();
        wanConfig.dns1 = this.staticPanel.query('textfield[name="dns1"]')[0].getValue();
        var dns2 = this.staticPanel.query('textfield[name="dns2"]')[0].getValue();

        if ( dns2.length > 0 ) {
            wanConfig.dns2 = dns2;
        } else {
            wanConfig.dns2 = null;
        }

        var complete = Ext.bind(this.complete, this, [ handler, hideWindow ], true );
        rpc.networkManager.setSetupSettings( complete, wanConfig );
    },

    savePPPoE : function( handler, hideWindow )
    {
        var wanConfig = Ung.SetupWizard.CurrentValues.wanConfiguration;
        wanConfig.configType = "pppoe";

        if ( hideWindow == null ) {
            hideWindow = true;
        }

        wanConfig.PPPoEUsername = this.pppoePanel.query('textfield[name="username"]')[0].getValue();
        wanConfig.PPPoEPassword = this.pppoePanel.query('textfield[name="password"]')[0].getValue();

        var complete = Ext.bind(this.complete, this, [ handler, hideWindow ], true );
        rpc.networkManager.setSetupSettings( complete, wanConfig );
    },

    complete : function( result, exception, foo, handler, hideWindow )
    {
        if(exception) {
            Ext.MessageBox.show({
                title:i18n._( "Network Settings" ),
                msg:exception.message,
                width:300,
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.INFO
            });
            return;
        }

        Ung.SetupWizard.CurrentValues.wanConfiguration = result;

        this.refreshNetworkDisplay();

        if ( hideWindow || ( hideWindow == null )) {
            Ext.MessageBox.hide();
        }

        if (handler != null)
            handler();
    },

    /* Refresh the current network settings (lease or whatever) */
    refresh : function()
    {
        Ext.MessageBox.wait(i18n._("Refreshing..."), i18n._("Please Wait"));

        var handler = function() {
            Ext.MessageBox.hide();
        };

        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.saveData,this, [ handler, false ] ));
    },

    testConnectivity : function( afterFn )
    {
        if ( !( this.validateInternetConnection() === true )) {
            Ext.MessageBox.show({
                title : i18n._("Unable to Test Connectivity" ),
                msg : i18n._( "Please complete all of the required fields." ),
                width : 300,
                buttons : Ext.MessageBox.OK,
                icon : Ext.MessageBox.INFO
            });
            return;
        }

        Ext.MessageBox.wait(i18n._("Saving Settings..."), i18n._("Please Wait"));

        var handler = Ext.bind( this.execConnectivityTest, this, [afterFn] );
        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.saveData, this, [ handler, false ] ));
    },

    saveData : function( handler, hideWindow )
    {
        this.cardPanel.layout.activeItem.saveData( handler, hideWindow );
    },

    completeConnectivityTest : function( result, exception, foo, handler )
    {
        if ( exception ) {
            Ext.MessageBox.show({
                title:i18n._( "Network Settings" ),
                msg : i18n._( "Unable to complete connectivity test, please try again." ),
                width:300,
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.INFO
            });
            return;
        } else {
            Ext.MessageBox.hide();
        }

        var message = "";

        /**
         * If handler is null then this is just a manual connectivity test, so just show a pop-up
         */
        if (handler == null) {
            if (( result.tcpWorking == false )  && ( result.dnsWorking == false )) {
                message = i18n._( "Warning! Internet and DNS tests failed." );
            } else if ( result.tcpWorking == false ) {
                message = i18n._( "Warning! DNS tests succeeded, but Internet tests failed." );
            } else if ( result.dnsWorking == false ) {
                message = i18n._( "Warning! Internet tests succeeded, but DNS tests failed." );
            } else {
                message = i18n._( "Success!" );
            }
            Ext.MessageBox.show({
                title:i18n._( "Internet Status" ),
                msg:message,
                width:300,
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.INFO
            });
        }
        /**
         * If handler is not null, then "Next" has been pushed.
         * If connectivity is not valid, then display a warning, otherwise just continue
         */
        else {
            if (( result.tcpWorking == false )  && ( result.dnsWorking == false )) {
                message = i18n._( "Warning! Internet tests and DNS tests failed." );
            } else if ( result.tcpWorking == false ) {
                message = i18n._( "Warning! DNS tests succeeded, but Internet tests failed." );
            } else if ( result.dnsWorking == false ) {
                message = i18n._( "Warning! Internet tests succeeded, but DNS tests failed." );
            } else {
                message = null;
            }

            // if the test passed, just continue
            if (message == null) {
                handler();
                return;
            }

            var warningText = message + "<br/><br/>" +i18n._("It is recommended to configure valid internet settings before continuing. Try again?");
            Ext.Msg.confirm(i18n._("Warning:"), warningText, Ext.bind(function(btn, text) {
                if (btn == 'yes') {
                    return;
                } else {
                    handler();
                    return;
                }
            }, this));
        }
    },

    execConnectivityTest : function( handler )
    {
        Ext.MessageBox.wait(i18n._("Testing Connectivity..."), i18n._("Please Wait"));
        rpc.connectivityTester.getStatus( Ext.bind( this.completeConnectivityTest, this, [handler], true ));
    },

    /* This does not reload the settings, it just updates what is
     * displayed inside of the User Interface. */
    refreshNetworkDisplay : function()
    {
        var c = 0;
        Ung.SetupWizard.CurrentValues.wanConfiguration = rpc.networkManager.getWizardWAN();
        var wanConfig = Ung.SetupWizard.CurrentValues.wanConfiguration;
        var isConfigured = (wanConfig.primaryAddress != null);

        if ( wanConfig.primaryAddress == Ung.SetupWizard.BOGUS_ADDRESS ) {
            wanConfig.primaryAddress = null;
            wanConfig.gateway = null;
            wanConfig.dns1 = null;
            wanConfig.dns2 = null;
            isConfigured = false;
        }
        
        if (isConfigured) {
            for ( c = 0; c < this.configTypes.length ; c++ ) {
                if (this.configTypes[c][0] == wanConfig.configType)
                    this.cardPanel.layout.setActiveItem( c );
            }

            this.updateValue( this.card.panel.query('combo[name="configType"]')[0], wanConfig.configType);
            
            for ( c = 0; c < this.cards.length ; c++ ) {
                var card = this.cards[c];
                if (wanConfig.primaryAddress != null) {
                    this.updateValue( card.query('textfield[name="ip"]')[0] , wanConfig.primaryAddress.network );
                    this.updateValue( card.query('textfield[name="netmask"]')[0] , wanConfig.primaryAddress.netmask );
                    this.updateValue( card.query('textfield[name="gateway"]')[0], wanConfig.gateway );
                    this.updateValue( card.query('textfield[name="dns1"]')[0], wanConfig.dns1 );
                    this.updateValue( card.query('textfield[name="dns2"]')[0], wanConfig.dns2 );
                }
            }
        } else {
            /* not configured */
            for ( c = 0; c < this.cards.length ; c++ ) {
                var card = this.cards[c];
                this.updateValue( card.query('textfield[name="ip"]')[0] , "" );
                this.updateValue( card.query('textfield[name="netmask"]')[0] , "" );
                this.updateValue( card.query('textfield[name="gateway"]')[0], "" );
                this.updateValue( card.query('textfield[name="dns1"]')[0], "" );
                this.updateValue( card.query('textfield[name="dns2"]')[0], "" );
            }
        }
    },

    /* Guard the field to shield strange values from the user. */
    updateValue : function( field, value )
    {
        if ( field == null ) {
            return;
        }
        if ( value == null || value == "0.0.0.0" ) {
            value = "";
        }

        field.setValue( value );
    }

});

Ext.define('Ung.SetupWizard.InternalNetwork', {
    constructor : function( config )
    {
        this.panel = Ext.create('Ext.form.Panel',{
            defaultType : 'fieldset',
            defaults : {
                autoHeight : true,
                labelWidth : Ung.SetupWizard.LabelWidth3
            },
            items : [{
                xtype : 'label',
                html : '<h2 class="wizard-title">'+i18n._( "Configure the Internal Network Interface" )+'</h2>'
            },{
                cls : 'noborder  wizard-internal-network',
                items : [{
                    xtype : 'radio',
                    name : 'bridgeOrRouter',
                    inputValue : 'router',
                    boxLabel : i18n._( 'Router' ),
                    ctCls : 'large-option',
                    hideLabel : 'true',
                    listeners : {
                        change : {
                            fn : Ext.bind(function( checkbox, checked ) {
                                this.onSetRouter(checked);
                            },this )
                        }
                    }
                },{
                    xtype : 'label',
                    html : "<div class='wizard-network-image-description'>" + i18n._('This is recommended if the external port is plugged into the internet connection. This enables NAT on the Internal Interface and DHCP.') + "</div>"
                },{
                    name : 'network',
                    xtype : 'textfield',
                    itemCls : 'wizard-internal-network-address spacing-margin-1',
                    fieldLabel : i18n._('Internal Address'),
                    vText : i18n._('Please enter a valid Network  Address'),
                    vtype : 'ipCheck',
                    allowBlank : false,
                    msgTarget : 'side',
                    maskRe : /(\d+|\.)/,
                    disabled : true,
                    value : "192.168.1.1",
                    validationEvent : 'blur'
                },{
                    name : "netmask",
                    itemCls : 'wizard-internal-network-address',
                    fieldLabel : i18n._( "Internal Netmask" ),
                    xtype : 'combo',
                    store : Ung.SetupWizard.NetmaskData,
                    mode : 'local',
                    triggerAction : 'all',
                    value : "255.255.255.0",
                    width : 255,
                    listWidth : 125,
                    disabled : true,
                    editable : false
                },{
                    xtype : 'checkbox',
                    hideLabel : true,
                    checked : true,
                    disabled : true,
                    name : 'enableDhcpServer',
                    itemCls : 'wizard-label-margin-9',
                    boxLabel : i18n._("Enable DHCP Server (default)")
                },{
                    xtype : 'label',
                    cls : 'wizard-network-image',
                    html : '<img src="/skins/' + Ung.SetupWizard.currentSkin + '/images/admin/wizard/router.png"/>'
                }]
            }, {
                cls : 'noborder wizard-internal-network',
                items : [{
                    xtype : 'radio',
                    name : 'bridgeOrRouter',
                    inputValue : 'bridge',
                    boxLabel : i18n._('Transparent Bridge'),
                    ctCls : 'large-option',
                    hideLabel : 'true',
                    checked : true
                },{
                    xtype : 'label',
                    html : "<div class='wizard-network-image-description'>" + i18n._('This is recommended if the external port is plugged into a firewall/router. This bridges Internal and External and disables DHCP.') + "</div>"
                },{
                    xtype : 'label',
                    cls : 'wizard-network-image',
                    html : '<img src="/skins/' + Ung.SetupWizard.currentSkin + '/images/admin/wizard/bridge.png"/>'
                }]
            }]
        });

        this.card = {
            title : i18n._( "Internal Network" ),
            panel : this.panel,
            onLoad : Ext.bind(this.onLoadInternalSuggestion,this),
            onNext : Ext.bind(this.saveInternalNetwork,this ),
            onValidate : Ext.bind(this.validateInternalNetwork,this)
        };
    },
    onLoadInternalSuggestion : function( complete )
    {
        /* If the user modified the value, do not fetch a new value */
        if (( this.panel.query('combo[name="netmask"]')[0].getRawValue() != "255.255.255.0" ) ||
            (( this.panel.query('textfield[name="network"]')[0].getValue() != "192.168.1.1" ) &&
             ( this.panel.query('textfield[name="network"]')[0].getValue() != "172.16.0.1" ))) {
            complete();
            return;
        }

        // find the internal interface and see if its currently set to static.
        // if so change the default to router
        var netConf = rpc.networkManager.getNetworkConfiguration();
        if (netConf != null && netConf.interfaceList != null) {
            var intfs = netConf.interfaceList.list;
            for ( var c = 0 ;  c < intfs.length ; c++ ) {
                if (intfs[c].name == "Internal" && intfs[c].configType == "static" ) {
                    this.panel.query('radio[name="bridgeOrRouter"]')[0].setValue(true);
                    this.panel.query('radio[name="bridgeOrRouter"]')[1].setValue(false);
                }
            }
        }
        
        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.loadInternalSuggestion,this, [ complete ] ));
    },
    loadInternalSuggestion : function( complete )
    {
        rpc.networkManager.getWizardInternalAddressSuggestion( Ext.bind(this.completeLoadInternalSuggestion, this, [ complete ], true ), null );
    },
    completeLoadInternalSuggestion : function( result, exception, foo, handler )
    {
        if ( exception ) {
            /* Just ignore the attempt */
            handler();
            return;
        }

        this.panel.query('textfield[name="network"]')[0].setValue( result["network"] );
        this.panel.query('combo[name="netmask"]')[0].setValue( result["netmask"] );
        handler();

    },
    onSetRouter : function(isSet){
        var ar = [this.panel.query('textfield[name="network"]')[0],this.panel.query('combo[name="netmask"]')[0],this.panel.query('checkbox[name="enableDhcpServer"]')[0]];
        for(var i=0;i<ar.length;i++){
            ar[i].setDisabled(!isSet);
        }
        _invalidate(ar);
    },
    validateInternalNetwork : function()
    {
        var rv = true;
        var nic = false;
        for(var i=0;i<this.panel.query('radio[name="bridgeOrRouter"]').length;i++){
            if(this.panel.query('radio[name="bridgeOrRouter"]')[i].getValue()){
                nic = this.panel.query('radio[name="bridgeOrRouter"]')[i].inputValue;
                break;
            }
        }
        if ( nic == "router" ) {
            rv = _validate(this.panel.items.items);
        }
        return rv;
    },
    saveInternalNetwork : function( handler )
    {
        var value = this.panel.query('radio[name="bridgeOrRouter"]')[0].getGroupValue();

        if ( value == null ) {
            Ext.MessageBox.alert(i18n._( "Select a value" ), i18n._( "Please choose bridge or router." ));
            return;
        }

        Ext.MessageBox.wait( i18n._( "Saving Internal Network Settings" ), i18n._( "Please Wait" ));

        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.afterReauthenticate, this, [ handler ] ));
    },
    afterReauthenticate : function( handler )
    {
        var delegate = Ext.bind(this.complete, this, [ handler ], true );
        var value = this.panel.query('radio[name="bridgeOrRouter"]')[0].getGroupValue();
        if ( value == 'bridge' ) {
            rpc.networkManager.setWizardNatDisabled( delegate );
        } else {
            var network = this.panel.query('textfield[name="network"]')[0].getValue();
            var netmask = this.panel.query('combo[name="netmask"]')[0].getRawValue();
            var enableDhcpServer = this.panel.query('checkbox[name="enableDhcpServer"]')[0].getValue();
            rpc.networkManager.setWizardNatEnabled( delegate, network, netmask, enableDhcpServer );
        }
    },

    complete : function( result, exception, foo, handler )
    {
        if(exception) {
            Ext.MessageBox.alert(i18n._( "Local Network" ), i18n._( "Unable to save Local Network Settings" ) + exception.message );
            return;
        }

        Ext.MessageBox.hide();
        handler();
    }
});

Ext.define('Ung.SetupWizard.AutoUpgrades', {
    constructor : function( config )
    {
        this.panel = Ext.create('Ext.form.Panel',{
            defaultType : 'fieldset',
            defaults : {
                autoHeight : true,
                labelWidth : Ung.SetupWizard.LabelWidth3
            },
            items : [{
                xtype : 'label',
                html : '<h2 class="wizard-title">'+i18n._( "Configure Automatic Upgrade Settings" )+'</h2>'
            },{
                cls : 'noborder  wizard-auto-upgrades',
                items : [{
                    xtype : 'radio',
                    name : 'autoUpgradesRadio',
                    inputValue : 'yes',
                    boxLabel : i18n._( 'Install Upgrades Automatically' ),
                    ctCls : 'large-option',
                    hideLabel : 'true',
                    checked : true
                },{
                    xtype : 'label',
                    html : Ext.String.format( i18n._('Automatically install new versions of {0} software. '), oemName) + '<br/>' +
                         i18n._('This is the recommended for most sites.')
                }]
            }, {
                cls : 'noborder wizard-auto-upgrades',
                items : [{
                    xtype : 'radio',
                    name : 'autoUpgradesRadio',
                    inputValue : 'no',
                    boxLabel : i18n._('Do Not Install Upgrades Automatically.'),
                    ctCls : 'large-option',
                    hideLabel : 'true'
                },{
                    xtype : 'label',
                    html : Ext.String.format( i18n._('Do not automatically install new versions of {0} software.'), oemName) + '<br/>' +
                        i18n._('This is the recommended setting for large, complex, or sensitive sites.') + '<br/>' +
                        i18n._('Software Upgrades can be applied manually at any time when available.') 
                },{
                    xtype : 'label',
                    html : '<br/><br/>' + '<b>' + i18n._('Note:') + '</b>' + '<br/>' +
                        i18n._('Signatures for Virus Blocker, Spam Blocker, Web Filter, etc are still updated automatically.') + '<br/>' +
                        i18n._('If desired, a custom upgrade schedule can be configured after installation in the Upgrade Settings.') + '<br/>'
                    
                }]
            }]
        });

        this.card = {
            title : i18n._( "Automatic Upgrades" ),
            panel : this.panel,
            onLoad : Ext.bind(this.onLoadAutoSuggestion,this),
            onNext : Ext.bind(this.saveAutoUpgrades,this ),
            onValidate :Ext.bind(this.validateAutoUpgrades,this)
        };
    },
    onLoadAutoSuggestion : function( complete )
    {
        var autoUpgradesEnabled = rpc.toolboxManager.getUpgradeSettings().autoUpgrade;
        if (!autoUpgradesEnabled) {
            this.panel.query('radio[name="autoUpgradesRadio"]')[0].setValue(false);
            this.panel.query('radio[name="autoUpgradesRadio"]')[1].setValue(true);
        } 
        complete();
    },
    validateAutoUpgrades : function()
    {
        return true;
    },
    saveAutoUpgrades : function( handler )
    {
        var value = this.panel.query('radio[name="autoUpgradesRadio"]')[0].getGroupValue();
        if ( value == null ) {
            Ext.MessageBox.alert(i18n._( "Select a value" ), i18n._( "Please choose Yes or No." ));
            return;
        }
        Ext.MessageBox.wait( i18n._( "Saving Automatic Upgrades Settings" ), i18n._( "Please Wait" ));

        Ung.SetupWizard.ReauthenticateHandler.reauthenticate( Ext.bind(this.afterReauthenticate, this, [ handler ] ));
    },
    afterReauthenticate : function( handler )
    {
        var delegate = Ext.bind(this.complete, this, [ handler ], true );
        var value = this.panel.query('radio[name="autoUpgradesRadio"]')[0].getGroupValue();
        var upgradeSettings = rpc.toolboxManager.getUpgradeSettings();
        if ( value == "yes" ) {
            upgradeSettings.autoUpgrade = true;
            rpc.toolboxManager.setUpgradeSettings( delegate, upgradeSettings );
        } else {
            upgradeSettings.autoUpgrade = false;
            rpc.toolboxManager.setUpgradeSettings( delegate, upgradeSettings );
        }
    },
    complete : function( result, exception, foo, handler )
    {
        if(exception) {
            Ext.MessageBox.alert(i18n._( "Local Network" ), i18n._( "Unable to save Automatic Upgrade Settings" ) + exception.message );
            return;
        }

        Ext.MessageBox.hide();
        handler();
    }
});

Ext.define('Ung.SetupWizard.Complete', {
    constructor : function( config )
    {
        var panel = Ext.create('Ext.form.Panel',{
            items : [{
                xtype : 'label',
                html : '<h2 class="wizard-title">'+i18n._( "Congratulations!" )+'</h2>'
            },{
                xtype : 'label',
                html : Ext.String.format(i18n._( '<b>The {0} Server is now configured.</b><br/><br/>You are now ready to download and configure applications.' ),oemName),
                cls : 'noborder'
            }]
        });

        this.card = {
            title : i18n._( "Finished" ),
            cardTitle : i18n._( "Congratulations!" ),
            panel : panel,
            onNext : Ext.bind(this.openUserInterface,this )
        };
    },

    openUserInterface : function( handler )
    {
        Ext.MessageBox.wait( i18n._( "Loading User Interface..." ), i18n._( "Please Wait" ));

        //now that we are done, create the UID
        rpc.jsonrpc.UvmContext.createUID();

        //and set a flag so the wizard wont run again
        rpc.jsonrpc.UvmContext.wizardComplete();

        //now open the UI
        window.location.href="/webui/startPageNew.do?firstTimeRun=true";
    }
});

Ung.SetupWizard.TimeZoneStore = [];

Ung.Setup = {
    isInitialized : false,
    init : function()
    {
        console.log("Setup init");
        if ( this.isInitialized == true ) {
            return;
        }
        this.isInitialized = true;

        Ext.WindowMgr.zseed = 20000;

        rpc = {};

        /* Initialize the timezone data */
        for ( var i = 0; i < Ung.TimeZoneData.length; i++) {
            Ung.SetupWizard.TimeZoneStore.push([Ung.TimeZoneData[i][2], "(" + Ung.TimeZoneData[i][0] + ") " + Ung.TimeZoneData[i][1]]);
        }

        /* Initialize the netmask data */
        Ung.SetupWizard.NetmaskData = [
            "255.0.0.0",       "255.128.0.0",     "255.192.0.0",     "255.224.0.0",
            "255.240.0.0",     "255.248.0.0",     "255.252.0.0",     "255.254.0.0",
            "255.255.0.0",     "255.255.128.0",   "255.255.192.0",   "255.255.224.0",
            "255.255.240.0",   "255.255.248.0",   "255.255.252.0",   "255.255.254.0",
            "255.255.255.0",   "255.255.255.128", "255.255.255.192", "255.255.255.224",
            "255.255.255.240", "255.255.255.248", "255.255.255.252"
        ];

        rpc.setup = new JSONRpcClient("/setup/JSON-RPC").SetupContext;
        
        oemName = rpc.setup.getOemName();

        i18n = new Ung.I18N( { "map" : Ung.SetupWizard.CurrentValues.languageMap });

        document.title = i18n._( "Setup Wizard" );

        var welcome = Ext.create('Ung.SetupWizard.Welcome',{});
        var settings = Ext.create('Ung.SetupWizard.Settings',{});
        var interfaces = Ext.create('Ung.SetupWizard.Interfaces',{});
        var internet = Ext.create('Ung.SetupWizard.Internet',{});
        var internal = Ext.create('Ung.SetupWizard.InternalNetwork',{});
        var upgrades = Ext.create('Ung.SetupWizard.AutoUpgrades',{});
        var complete = Ext.create('Ung.SetupWizard.Complete',{});

        var cards = [];
        cards.push( welcome.card );
        cards.push( settings.card );
        cards.push( interfaces.card );
        cards.push( internet.card );
        cards.push( internal.card );
        cards.push( upgrades.card );
        cards.push( complete.card );

        this.wizard = Ext.create('Ung.Wizard',{
            height : 500,
            width : 800,
            cardDefaults : {
                labelWidth : Ung.SetupWizard.LabelWidth,
                cls : 'untangle-form-panel'
            },
            cards : cards,
            disableNext : false,
            el : "container"
        });

        this.wizard.render();
        Ext.QuickTips.init();

        if ( true ) {
            /* DEBUGGING CODE (Change to true to dynamically go to any page you want on load.) */
            var debugHandler = Ext.bind(function() {
                this.wizard.goToPage( 3 );
            }, this );
            var ss = Ext.create('Ung.SetupWizard.SettingsSaver', null, debugHandler );

            ss.password = "passwd";
            ss.authenticate( null, null );
            /* DEBUGGING CODE */
        } else {
            this.wizard.goToPage( 0 );
        }
    }
};

Ung.SetupWizard.ReauthenticateHandler = {
    username : "admin",
    password : "",

    /* Must reauthenticate in order to refresh the managers */
    reauthenticate : function( handler )
    {
        console.log("reauthenticate");
        Ext.Ajax.request({
            params : {
                username : this.username,
                password : this.password
            },
            /* If it uses the default type then this will not work
             * because the authentication handler does not like utf8 */
            headers : {
                'Content-Type' : "application/x-www-form-urlencoded"
            },
            url : '/auth/login?url=/webui/setupSettings.js&realm=Administrator',
            callback : Ext.bind(this.reloadManagers, this, [ handler ], 4 )
        });
    },

    reloadManagers : function( options, success, response, handler )
    {
        console.log("reloadManagers");
        if ( success ) {
            /* It is very wrong to do this all synchronously */
            rpc.jsonrpc = new JSONRpcClient( "/webui/JSON-RPC" );
            rpc.adminManager = rpc.jsonrpc.UvmContext.adminManager();
            rpc.networkManager = rpc.jsonrpc.UvmContext.networkManager();
            rpc.connectivityTester = rpc.jsonrpc.UvmContext.getConnectivityTester();
            rpc.toolboxManager = rpc.jsonrpc.UvmContext.toolboxManager();
            rpc.mailSender = rpc.jsonrpc.UvmContext.mailSender();
            handler();
        } else {
            Ext.MessageBox.alert( i18n._( "Unable to save settings." ));
        }
    }
};


