// test
Ext.define('Ung.Application', {
    extend: 'Ext.app.Application',
    namespace: 'Ung',

    autoCreateViewport: false,
    name: 'Ung',

    rpc: null,

    controllers: ['Global'],

    defaultToken : '',

    mainView: 'Ung.view.main.Main',

    context: 'ADMIN', // set the context

    launch: function () {
        window.document.title = rpc.companyName + (rpc.hostname ? ' - ' + rpc.hostname : '');
        Ext.get('app-loader').destroy();

        Ext.getStore('policies').loadData(rpc.appsViews);
        Ext.getStore('policiestree').build();

        Metrics.start();

        Ext.fireEvent('afterlaunch'); // used in Main view ctrl

        document.addEventListener( 'paste', function(evt){
            var currentHash =  window.location.hash;
            if(currentHash != ""){
                return;
            }

            var url = evt.clipboardData.getData('text/plain');
            if(url && url.indexOf('#') > -1){
                var hashStart=url.substring(url.indexOf('#'));
                Ung.app.redirectTo(hashStart);
            }
        });

        // Ext.fireEvent('checkreports');

        Rpc.asyncData('rpc.dashboardManager.getSettings')
            .then(function (result) {
                Ung.dashboardSettings = result;
                Ext.getStore('widgets').loadData(result.widgets.list);

                Ung.app.reportscheck();

                // Ext.getStore('policiestree').build();
                // Ext.fireEvent('checkreports');
                // Ext.defer(function () {
                //     me.loadWidgets();
                // }, 1000);

                // DashboardQueue.paused = false;
                // me.updateWidgetsVisibility();
                // me.getView().setLoading(false);
            });


    },

    reportscheck: function () {
        var mainView = Ung.app.getMainView(), reportsApp = rpc.appManager.app('reports');
        if (!reportsApp) {
            rpc.reportsManager = null;
            Ext.getStore('reports').loadData([]);
            Ext.getStore('reportstree').build();
            mainView.getViewModel().set('reportsAppStatus', {
                installed: false,
                enabled: false
            });
            return;
        }

        // mainView.setLoading(true);
        rpc.reportsManager = reportsApp.getReportsManager();

        Ext.Deferred.parallel([
            Rpc.asyncPromise('rpc.reportsManager.getReportEntries'),
            Rpc.asyncPromise('rpc.reportsManager.getUnavailableApplicationsMap'),
            Rpc.asyncPromise('rpc.reportsManager.getCurrentApplications')
        ]).then(function (result) {
            if (result[0]) {
                Ext.getStore('reports').loadData(result[0].list);
            }
            if (result[1]) {
                Ext.getStore('unavailableApps').loadRawData(result[1].map);
            }
            if (result[2]) {
                Ext.getStore('categories').loadData(Ext.Array.merge(Util.baseCategories, result[2].list));
            }

            Ext.getStore('reportstree').build();
            mainView.getViewModel().set('reportsAppStatus', {
                installed: true,
                enabled: reportsApp.getRunState() === 'RUNNING'
            });
            // vm.notify();
            // mainView.setLoading(false);
            // Ext.fireEvent('init');
            console.log('done');
        }, function (ex) {
            console.log(ex);
        });
    }

});
