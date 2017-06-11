Ext.define('Ung.apps.ipsecvpn.view.GreNetworks', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.app-ipsec-vpn-grenetworks',
    itemId: 'gre-networks',
    title: 'GRE Networks'.t(),
    viewModel: true,

    tbar: [{
        xtype: 'tbtext',
        padding: '8 5',
        style: { fontSize: '12px', fontWeight: 600 },
        html: 'The GRE Networks tab contains configuration options for connecting this server to other servers and networks using the GRE protocol.'.t()
    }],

    items: [{
        xtype: 'textfield',
        bind: '{settings.virtualNetworkPool}',
        vtype: 'cidrBlock',
        allowBlank: false,
        labelWidth: 200,
        padding: '10 0 0 10',
        fieldLabel: 'GRE Address Pool'.t()
    }, {
        xtype: 'displayfield',
        padding: '10 0 0 10',
        value: 'Each Remote Network will have a corresponding GRE interface created on this server, with each interface being assigned an IP address from this pool.'.t()
    }, {
        xtype: 'app-ipsecvpn-gre-networks-grid',
        padding: '20 20 20 20'
    }]
});


Ext.define('Ung.apps.ipsecvpn.view.GreNetworksGrid', {
    extend: 'Ung.cmp.Grid',
    alias: 'widget.app-ipsecvpn-gre-networks-grid',
    itemId: 'gre-networks-grid',
    title: 'GRE Networks'.t(),

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: ['@add', '->', '@import', '@export']
    }],

    recordActions: ['edit', 'delete'],
    listProperty: 'settings.networks.list',
    emptyRow: {
        javaClass: 'com.untangle.app.ipsec_vpn.IpsecVpnNetwork',
        'active': true,
        'localAddress': '0.0.0.0',
        'remoteAddress': '0.0.0.0',
        'remoteNetworks': '0.0.0.0/24',
        'description': ''
        },

    bind: '{networkList}',

    columns: [{
        xtype: 'checkcolumn',
        header: 'Enabled'.t(),
        width: 80,
        dataIndex: 'active',
        resizable: false
    }, {
        header: 'Description'.t(),
        width: 300,
        flex: 1,
        dataIndex: 'description'
    }, {
        header: 'External IP'.t(),
        width: 150,
        dataIndex: 'localAddress',
    }, {
        header: 'Remote Host'.t(),
        width: 150,
        dataIndex: 'remoteAddress'
    }, {
        header: 'Remote Networks'.t(),
        width: 400,
        flex: 1,
        dataIndex: 'remoteNetworks'
    }],

    editorFields: [{
        fieldLabel: 'Enabled'.t(),
        bind: '{record.active}',
        xtype: 'checkbox'
    }, {
        fieldLabel: 'Description'.t(),
        bind: '{record.description}',
        xtype: 'textfield',
    }, {
        fieldLabel: 'Interface'.t(),
        xtype: 'combobox',
        bind: {
            store: '{wanListStore}',
            value: '{record.localInterface}'
        },
        allowblank: true,
        editable: false,
        queryMode: 'local',
        displayField: 'name',
        valueField: 'index',
            listeners: {
                change: function(cmp, nval, oval, opts) {
                    var wanlist = this.ownerCt.ownerCt.getViewModel().get('wanListData'); // FIXME - this feels really ugly
                    var finder = this.ownerCt.down("[fieldIndex='externalAddress']"); // FIXME - this feels ugly too
                    for( var i = 1 ; i < wanlist.length ; i++ ) {
                        if (nval == wanlist[i][0]) finder.setValue(wanlist[i][1]);
                    }
                }
            }
    }, {
        fieldLabel: 'External IP'.t(),
        fieldIndex: 'externalAddress',
        bind: {
            value: '{record.localAddress}',
            disabled: '{record.localInterface != 0}'
        },
        xtype: 'textfield',
        vtype: 'ipAddress'
    }, {
        fieldLabel: 'Remote Host'.t(),
        bind: '{record.remoteAddress}',
        xtype: 'textfield',
        vtype: 'ipAddress'
    }, {
        fieldLabel: 'Remote Networks'.t(),
        bind: '{record.remoteNetworks}',
        xtype: 'textarea',
        vtype: 'cidrBlockArea',
        width: 250,
        height: 200
    }]

});
