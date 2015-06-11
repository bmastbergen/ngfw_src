/**
 * $Id: IdpsNodeImpl.java 38584 2014-09-03 23:23:07Z dmorris $
 */

/*
 * The major difference between this module and others is configuration management.
 */
package com.untangle.node.idps;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.LinkedList;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.untangle.uvm.UvmContext;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.SettingsManager;
import com.untangle.uvm.node.SqlCondition;
import com.untangle.uvm.servlet.DownloadHandler;
import com.untangle.uvm.ExecManager;
import com.untangle.uvm.ExecManagerResult;
import com.untangle.uvm.util.I18nUtil;
import com.untangle.uvm.util.IOUtil;
import com.untangle.uvm.network.NetworkSettingsListener;
import com.untangle.uvm.network.NetworkSettings;
import com.untangle.uvm.network.InterfaceSettings;
import com.untangle.uvm.network.InterfaceStatus;
import com.untangle.uvm.node.EventLogEntry;
import com.untangle.uvm.node.IPMaskedAddress;
import com.untangle.uvm.node.NodeMetric;
import com.untangle.uvm.node.NodeManager;
import com.untangle.uvm.node.NodeSettings;
import com.untangle.uvm.vnet.NodeBase;
import com.untangle.uvm.vnet.Affinity;
import com.untangle.uvm.vnet.Fitting;
import com.untangle.uvm.vnet.PipelineConnector;
import com.untangle.uvm.ExecManagerResultReader;

public class IdpsNodeImpl extends NodeBase implements IdpsNode
{
    private final Logger logger = Logger.getLogger(getClass());

    private static final String STAT_SCAN = "scan";
    private static final String STAT_DETECT = "detect";
    private static final String STAT_BLOCK = "block";
    
    private final EventHandler handler;
    private final PipelineConnector [] connectors = new PipelineConnector[0];
    private final IdpsEventMonitor idpsEventMonitor;    

    private EventLogEntry allEventQuery;
    private EventLogEntry blockedEventQuery;

    private static final String IPTABLES_SCRIPT = "/etc/untangle-netd/iptables-rules.d/740-snort";
    private static final String GET_LAST_UPDATE = System.getProperty( "uvm.bin.dir" ) + "/idps-get-last-update-check";
    private static final String DEFAULTS_SETTINGS = "/usr/share/untangle-snort-config/current/templates/defaults.js";

    private float memoryThreshold = .25f;
    private boolean updatedSettingsFlag = false;

    private final NetworkListener listener;

    private List<IPMaskedAddress> homeNetworks = null;
    private List<String> interfaceIds = null;

    public IdpsNodeImpl( com.untangle.uvm.node.NodeSettings nodeSettings, com.untangle.uvm.node.NodeProperties nodeProperties )
    {
        super( nodeSettings, nodeProperties );

        handler = new EventHandler(this);
        this.homeNetworks = this.calculateHomeNetworks( UvmContextFactory.context().networkManager().getNetworkSettings(), false );
        this.interfaceIds = calculateInterfaces( UvmContextFactory.context().networkManager().getNetworkSettings() );
        this.listener = new NetworkListener();

        this.addMetric(new NodeMetric(STAT_SCAN, I18nUtil.marktr("Sessions scanned")));
        this.addMetric(new NodeMetric(STAT_DETECT, I18nUtil.marktr("Sessions logged")));
        this.addMetric(new NodeMetric(STAT_BLOCK, I18nUtil.marktr("Sessions blocked")));
        
        this.idpsEventMonitor   = new IdpsEventMonitor( this );

        this.allEventQuery = new EventLogEntry(I18nUtil.marktr("All Events"), "intrusion_prevention_events", new SqlCondition[]{});
        this.blockedEventQuery = new EventLogEntry(I18nUtil.marktr("Blocked Events"), "intrusion_prevention_events", new SqlCondition[]{ new SqlCondition("blocked","is","true") });

        UvmContextFactory.context().servletFileManager().registerDownloadHandler( new IdpsSettingsDownloadHandler() );
    }

    @Override
    protected PipelineConnector[] getConnectors()
    {
        return this.connectors;
    }

    public EventLogEntry[] getEventQueries()
    {
        return new EventLogEntry[] { this.allEventQuery, this.blockedEventQuery };
    }

    protected void postInit()
    {
        logger.info("Post init");

        readNodeSettings();
    }

    protected void preStop()
    {
        super.preStop();

        UvmContextFactory.context().networkManager().unregisterListener( this.listener );
        try{
            this.idpsEventMonitor.disable();
        }catch( Exception e ){
            logger.warn( "Error disabling IDPS Event Monitor", e );
        }
    }

    protected void postStop()
    {
        UvmContextFactory.context().daemonManager().decrementUsageCount( "snort-untangle" );
        iptablesRules();
    }

    protected void preStart()
    {
        super.preStart();
        UvmContextFactory.context().daemonManager().incrementUsageCount( "snort-untangle" );
        UvmContextFactory.context().networkManager().registerListener( this.listener );
        this.idpsEventMonitor.start();
        this.idpsEventMonitor.enable();
    }

    protected void postStart()
    {
        iptablesRules();
    }

    public void reconfigure()
    {

        String homeNetValue = "";
        for( IPMaskedAddress ma : this.homeNetworks ){
            homeNetValue += 
                ( homeNetValue.length() > 0 ? "," : "" ) + 
                ma.getMaskedAddress().getHostAddress().toString() + "/" + ma.getPrefixLength();
        }

        String interfacesValue = "";
        for( String i : this.interfaceIds ){
            interfacesValue += 
                ( interfacesValue.length() > 0 ? "," : "" ) + i; 
        }

        String configCmd = new String(System.getProperty("uvm.bin.dir") + 
            "/idps-create-config.py" + 
            " --node_id " + this.getNodeSettings().getId().toString() +
            " --home_net " + homeNetValue + 
            " --interfaces " + interfacesValue + 
            " --iptables_script " + IPTABLES_SCRIPT
        );

        String result = UvmContextFactory.context().execManager().execOutput(configCmd );
        try{
            String lines[] = result.split("\\r?\\n");
            for ( String line : lines ){
                if( line.trim().length() > 1 ){
                    logger.warn("reconfigure: idps-create-config: " + line);
                }
            }
        }catch( Exception e ){
            logger.warn( "Unable to generate snort configuration:", e );
        }
        reloadEventMonitorMap();
        stop();
        start();
    }

    public Date getLastUpdate()
    {
        try {
            String result = UvmContextFactory.context().execManager().execOutput( GET_LAST_UPDATE + " rules");
            long timeSeconds = Long.parseLong( result.trim());

            return new Date( timeSeconds * 1000l );
        } catch ( Exception e ) {
            logger.warn( "Unable to get last update.", e );
            return null;
        } 
    }

    public Date getLastUpdateCheck()
    {
        try {
            String result = UvmContextFactory.context().execManager().execOutput( GET_LAST_UPDATE );
            long timeSeconds = Long.parseLong( result.trim());

            return new Date( timeSeconds * 1000l );
        } catch ( Exception e ) {
            logger.warn( "Unable to get last update.", e );
            return null;
        } 
    }

    // private methods ---------------------------------------------------------

    private void readNodeSettings()
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        String settingsFile = System.getProperty("uvm.settings.dir") + "/untangle-node-idps/settings_" + this.getNodeSettings().getId().toString() + ".js";

        logger.info("Loading settings from " + settingsFile);

    }

    public void setScanCount( long value )
    {
        this.setMetric(STAT_SCAN, value);
    }

    public void setDetectCount( long value)
    {
        this.setMetric(STAT_DETECT, value);
    }

    public void setBlockCount( long value )
    {
        this.setMetric(STAT_BLOCK, value);
    }

    /**
     * Insert or remove iptables rules if snort daemon is running
     */
    private synchronized void iptablesRules()
    {
        File f = new File( IPTABLES_SCRIPT  );
        if( !f.exists() ){
            logger.warn("Cannot find init script:" + IPTABLES_SCRIPT);
        }

        ExecManagerResult result = UvmContextFactory.context().execManager().exec( IPTABLES_SCRIPT );
        try {
            String lines[] = result.getOutput().split("\\r?\\n");
            logger.info( IPTABLES_SCRIPT + ": ");
            for ( String line : lines )
                logger.info( IPTABLES_SCRIPT + ": " + line);
        } catch (Exception e) {
            logger.warn( "Unable to process " + IPTABLES_SCRIPT + ":", e );
        }

        if ( result.getResult() != 0 ) {
            logger.error("Failed to run " + IPTABLES_SCRIPT+ " (return code: " + result.getResult() + ")");
            throw new RuntimeException("Failed to manage rules");
        }
    }

    public String getSettingsFileName()
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        return System.getProperty("uvm.settings.dir") + "/untangle-node-idps/settings_" + this.getNodeSettings().getId().toString() + ".js";
    }

    public String getDefaultsSettingsFileName()
    {
        return DEFAULTS_SETTINGS;
    }

    public void initializeSettings()
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        String nodeId = this.getNodeSettings().getId().toString();
        String tempFileName = "/tmp/settings_" + getNodeSettings().getNodeName() + "_" + nodeId + ".js";

        String configCmd = new String(System.getProperty("uvm.bin.dir") + 
            "/idps-sync-settings.py" + 
            " --node_id " + nodeId +
            " --rules /usr/share/untangle-snort-config/current" +
            " --settings " + tempFileName
        );
        String result = UvmContextFactory.context().execManager().execOutput(configCmd );
        try{
            String lines[] = result.split("\\r?\\n");
            for ( String line : lines ){
                if( line.trim().length() > 1 ){
                    logger.warn("initializeSettings: idps-sync-settings: " + line);
                }
            }
        }catch( Exception e ){
            logger.warn("Unable to initialize settings: ", e );
        }

        try {
            settingsManager.save( getSettingsFileName(), tempFileName, true );
        } catch (Exception exn) {
            logger.error("Could not save node settings", exn);
        }
    }

    public void saveSettings( String tempFileName )
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();

        try {
            settingsManager.save( getSettingsFileName(), tempFileName, true );
        } catch (Exception exn) {
            logger.error("Could not save node settings", exn);
        }
    }

    public void setUpdatedSettingsFlag( boolean updatedSettingsFlag ){
        this.updatedSettingsFlag = updatedSettingsFlag;
    }
    public boolean getUpdatedSettingsFlag(){
        return this.updatedSettingsFlag;
    }

    public void reloadEventMonitorMap(){
        this.idpsEventMonitor.unified2Parser.reloadEventMap();
    }

    /*
     * IDPS settings are very large, around 30MB.  Managing this through uvm's
     * standard settings management causes Java garbage collection to go nuts
     * and almost always causes uvm to reload.
     * 
     * Besides not wanting to re-work uvm's GC settings, the bigger issue
     * is that uvm does not need to know anything about IDPS settings;
     * everything is handled in backend scripts that manage and generate
     * configuration for Snort.
     *
     * Therefore, the easiest way to get around the GC issue is to simply
     * make IDPS settings use the download manager for downloads and uploads.
     *
     */
    private class IdpsSettingsDownloadHandler implements DownloadHandler
    {
        private static final String CHARACTER_ENCODING = "utf-8";

        @Override
        public String getName()
        {
            return "IdpsSettings";
        }
        
        public void serveDownload( HttpServletRequest req, HttpServletResponse resp )
        {

            String action = req.getParameter("arg1");
            String nodeId = req.getParameter("arg2");

            UvmContext uvm = UvmContextFactory.context();
            NodeManager nm = uvm.nodeManager();
            IdpsNode node = (IdpsNode) nm.node( Long.parseLong(nodeId) );

            if (node == null ) {
                logger.warn("Invalid parameters: " + nodeId );
                return;
            }

            if( action.equals("load") ||
                action.equals("wizard") ){
                String settingsName;
                if( action.equals("wizard") ){
                    settingsName = node.getDefaultsSettingsFileName();
                }else{
                    settingsName = node.getSettingsFileName();
                }
                try{
                    resp.setCharacterEncoding(CHARACTER_ENCODING);
                    resp.setHeader("Content-Type","application/json");

                    File f = new File( settingsName );
                    if( !f.exists() && 
                        action.equals("load") ){
                        node.initializeSettings();
                    }
                    byte[] buffer = new byte[1024];
                    int read;
                    FileInputStream fis = new FileInputStream(settingsName);
                    OutputStream out = resp.getOutputStream();
                
                    while ( ( read = fis.read( buffer ) ) > 0 ) {
                        out.write( buffer, 0, read);
                    }

                    fis.close();
                    out.flush();
                    out.close();

                } catch (Exception e) {
                    logger.warn("Failed to load IDPS settings",e);
                }
                node.setUpdatedSettingsFlag( false );
            }else if( action.equals("save")) {
                /*
                 * Save/uploads are a bit of a problem due to size.  For load/downloads,
                 * the settings file is automatically compressed by Apache/Tomcat from 
                 * around 30MB to 3MB which is hardly noticable.
                 *
                 * The reverse is almost never true and the client will attempt to upload 
                 * without compression.  To get around this, we receive a JSON "patch"
                 * which we pass to the configuration management scripts to integrate into settings.
                 */
                SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
                String tempPatchName = "/tmp/changedDataSet_untangle-node-idps_settings_" + nodeId + ".js";
                String tempSettingsName = "/tmp/untangle-node-idps_settings_" + nodeId + ".js";
                int verifyResult = 1;
                try{
                    byte[] buffer = new byte[1024];
                    int read;
                    InputStream in = req.getInputStream();
                    FileOutputStream fos = new FileOutputStream( tempPatchName );

                    while ( ( read = in.read( buffer ) ) > 0 ) {
                        fos.write( buffer, 0, read);
                    }

                    in.close();
                    fos.flush();
                    fos.close();

                    /*
                     * If client takes too long to upload, we'll get an incomplete settings file and all will be bad.
                     */
                    String verifyCommand = new String( "python -m simplejson.tool " + tempPatchName + "> /dev/null 2>&1" );
                    verifyResult = UvmContextFactory.context().execManager().execResult(verifyCommand);

                    String configCmd = new String(
                        System.getProperty("uvm.bin.dir") + 
                        "/idps-sync-settings.py" + 
                        " --node_id " + nodeId +
                        " --rules /usr/share/untangle-snort-config/current" +
                        " --settings " + tempSettingsName + 
                        " --patch " + tempPatchName
                    );
                    String result = UvmContextFactory.context().execManager().execOutput(configCmd );
                    try{
                        String lines[] = result.split("\\r?\\n");
                        for ( String line : lines ){
                            if( line.trim().length() > 1 ){
                                logger.warn("DownloadHandler: idps-sync-settings: " + line);
                            }
                        }
                    }catch( Exception e ){
                        logger.warn("Unable to initialize settings: ", e );
                    }

                    File fp = new File( tempPatchName );
                    fp.delete();

                }catch( IOException e ){
                    logger.warn("Failed to save IDPS settings");
                }

                String responseText = "{success:true}";
                if( verifyResult == 0 ){
                    node.saveSettings( tempSettingsName );
                }else{
                     responseText = "{success:false}";
                }

                try{
                    resp.setCharacterEncoding(CHARACTER_ENCODING);
                    resp.setHeader("Content-Type","application/json");

                    OutputStream out = resp.getOutputStream();
                    out.write( responseText.getBytes(), 0, responseText.getBytes().length );
                    out.flush();
                    out.close();
                } catch (Exception e) {
                    logger.warn("Failed to send IDPS save response");
                }
            }
        }
    }

    /*
     * The HOME_NET snort value is highly dependent on non-WAN interface values.
     * If it changes, we must reconfigure snort.  However, reconfiguring snort
     * is an expensive operation due to timeto restart snort.  To make this as painless
     * as possible, at startup we calculate initial HOME_NET value and recalc on
     * network changes.  Only if HOME_NET changes will a reconfigure occur.
     */

    /*
     * Build non-WAN networks
     */
    private List<IPMaskedAddress> calculateHomeNetworks( NetworkSettings networkSettings, boolean getWan )
    {
        boolean match;
        IPMaskedAddress maskedAddress;
        List<IPMaskedAddress> addresses = new LinkedList<IPMaskedAddress>();
        for( InterfaceSettings interfaceSettings : networkSettings.getInterfaces() ){
            if ( interfaceSettings.getDisabled() || interfaceSettings.getBridged() ){
                continue;
            }
            if( ( ( getWan == false ) && ( interfaceSettings.getIsWan() == true ) ) ||
                ( ( getWan == true ) && ( interfaceSettings.getIsWan() == false ) ) ){
                continue;
            }
            
            addresses.add(new IPMaskedAddress( interfaceSettings.getV4StaticAddress(), interfaceSettings.getV4StaticPrefix()));
            for ( InterfaceSettings.InterfaceAlias alias : interfaceSettings.getV4Aliases() ) {
                /*
                 * Don't add if already in list 
                 */
                match = false;
                maskedAddress = new IPMaskedAddress( alias.getStaticAddress(), alias.getStaticNetmask() );
                for( IPMaskedAddress ma : addresses ){
                    if( ma.getMaskedAddress().getHostAddress().equals( maskedAddress.getMaskedAddress().getHostAddress() ) &&
                        ( ma.getPrefixLength() == maskedAddress.getPrefixLength() ) ){
                        match = true;
                    }
                }
                if( match == false ){
                    addresses.add( maskedAddress );
                }
            }   
        }
        if( addresses.size() == 0 ){
            /*
             * No LAN interfaces were found.  This means the system
             * is in bridged-to-WAN networking mode and we should
             * use the WAN network as home.
             */
            addresses = calculateHomeNetworks(networkSettings, true);
        }
        return addresses; 
    }

    /*
     * Build active interface identifiers.
     */
    private List<String> calculateInterfaces( NetworkSettings networkSettings )
    {
        List<String> interfaces = new LinkedList<String>();
        for( InterfaceSettings interfaceSettings : networkSettings.getInterfaces() ){
            if ( interfaceSettings.getDisabled() ){
                continue;
            }
            interfaces.add( interfaceSettings.getSystemDev() );
        }
        return interfaces; 
    }

    /*
     * Compare currently known non-WAN addresses to new addresses.  
     * If they're different, trigger a reconfigure event.
     */
    private void networkSettingsEvent( NetworkSettings networkSettings ) throws Exception
    {
        List<IPMaskedAddress> newHomeNetworks = calculateHomeNetworks( networkSettings, false );

        boolean sameNetworks = true;
        if( newHomeNetworks.size() != this.homeNetworks.size() ){
            sameNetworks = false;
        }else{
            int minLength = Math.min( this.homeNetworks.size(), newHomeNetworks.size() );
            for( int i = 0; i < minLength; i++ ){
                if( ( this.homeNetworks.get(i).getMaskedAddress().getHostAddress().toString().equals(newHomeNetworks.get(i).getMaskedAddress().getHostAddress().toString()) == false ) ||
                    ( this.homeNetworks.get(i).getPrefixLength() != newHomeNetworks.get(i).getPrefixLength() ) ){
                    sameNetworks = false;
                }
            }
        }
        if( sameNetworks == false ){
            this.homeNetworks = newHomeNetworks;
            this.interfaceIds = calculateInterfaces(networkSettings);
            this.reconfigure();
        }
    }

    private class NetworkListener implements NetworkSettingsListener
    {
        public void event( NetworkSettings settings )
        {
            if ( logger.isDebugEnabled()){
                logger.debug( "network settings changed:" + settings );  
            } 
            try {
                networkSettingsEvent( settings );
            } catch( Exception e ) {
                logger.error( "Unable to reconfigure IDPS" );
            }
        }
    }
}
