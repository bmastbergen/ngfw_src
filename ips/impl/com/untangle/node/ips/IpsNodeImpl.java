/*
 * $Id$
 */
package com.untangle.node.ips;

import java.util.List;
import java.util.Set;
import org.apache.log4j.Logger;
import com.untangle.node.token.TokenAdaptor;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.SettingsManager;
import com.untangle.uvm.message.BlingBlinger;
import com.untangle.uvm.message.Counters;
import com.untangle.uvm.message.MessageManager;
import com.untangle.uvm.util.I18nUtil;
import com.untangle.uvm.util.TransactionWork;
import com.untangle.uvm.vnet.NodeBase;
import com.untangle.uvm.vnet.Affinity;
import com.untangle.uvm.vnet.Fitting;
import com.untangle.uvm.vnet.PipeSpec;
import com.untangle.uvm.vnet.SoloPipeSpec;
import com.untangle.uvm.node.EventLogQuery;

public class IpsNodeImpl extends NodeBase implements IpsNode
{
    private static final String SETTINGS_CONVERSION_SCRIPT = System.getProperty( "uvm.bin.dir" ) + "/ips-convert-settings.py";
    private final Logger logger = Logger.getLogger(getClass());

    private IpsSettings settings = null;
    final IpsStatisticManager statisticManager;
    final IpsStatistics statistics;

    private final EventHandler handler;
    private final SoloPipeSpec octetPipeSpec, httpPipeSpec;
    private final PipeSpec[] pipeSpecs;

    private IpsDetectionEngine engine;

    private final BlingBlinger scanBlinger;
    private final BlingBlinger detectBlinger;
    private final BlingBlinger blockBlinger;

    private EventLogQuery allEventQuery;
    private EventLogQuery blockedEventQuery;

    public IpsNodeImpl( com.untangle.uvm.node.NodeSettings nodeSettings, com.untangle.uvm.node.NodeProperties nodeProperties )
    {
        super( nodeSettings, nodeProperties );

        engine = new IpsDetectionEngine(this);
        handler = new EventHandler(this);
        statisticManager = new IpsStatisticManager();
        statistics = new IpsStatistics();

        // Put the octet stream close to the server so that it is after the http processing.
        octetPipeSpec = new SoloPipeSpec("ips-octet", this, handler,Fitting.OCTET_STREAM, Affinity.SERVER,10);
        httpPipeSpec = new SoloPipeSpec("ips-http", this, new TokenAdaptor(this, new IpsHttpFactory(this)), Fitting.HTTP_TOKENS, Affinity.SERVER,0);
        pipeSpecs = new PipeSpec[] { httpPipeSpec, octetPipeSpec };

        this.allEventQuery = new EventLogQuery(I18nUtil.marktr("All Events"),
                                               "FROM SessionLogEventFromReports evt " +
                                               "WHERE evt.policyId = :policyId " +
                                               "AND ipsName IS NOT NULL " +
                                               "ORDER BY evt.timeStamp DESC");

        this.blockedEventQuery = new EventLogQuery(I18nUtil.marktr("Blocked Events"),
                                                   "FROM SessionLogEventFromReports evt " +
                                                   "WHERE evt.policyId = :policyId " +
                                                   "AND ipsBlocked IS TRUE " +
                                                   "ORDER BY evt.timeStamp DESC");

        List<RuleClassification> classifications = FileLoader.loadClassifications();
        engine.setClassifications(classifications);

        MessageManager lmm = UvmContextFactory.context().messageManager();
        Counters c = lmm.getCounters(getNodeSettings().getId());
        scanBlinger = c.addActivity("scan", I18nUtil.marktr("Sessions scanned"), null, I18nUtil.marktr("SCAN"));
        detectBlinger = c.addActivity("detect", I18nUtil.marktr("Sessions logged"), null, I18nUtil.marktr("LOG"));
        blockBlinger = c.addActivity("block", I18nUtil.marktr("Sessions blocked"), null, I18nUtil.marktr("BLOCK"));
        lmm.setActiveMetrics(getNodeSettings().getId(), scanBlinger, detectBlinger, blockBlinger);
    }

    @Override
    protected PipeSpec[] getPipeSpecs()
    {
        logger.debug("Getting PipeSpec");
        return pipeSpecs;
    }

    public IpsStatistics getStatistics()
    {
        return statistics;
    }

    public IpsSettings getSettings()
    {
        return settings;
    }

    public void setSettings(IpsSettings settings)
    {
        this.settings = settings;
        this.settings.updateStatistics(statistics);
        writeNodeSettings(this.settings);
        reconfigure();
    }

    public EventLogQuery[] getEventQueries()
    {
        return new EventLogQuery[] { this.allEventQuery, this.blockedEventQuery };
    }

    public void initializeNodeSettings()
    {
        logger.info("Loading Variables...");

        IpsSettings settings = new IpsSettings();
        settings.pokeVariables(IpsRuleManager.getDefaultVariables());
        settings.pokeImmutables(IpsRuleManager.getImmutableVariables());

        logger.info("Loading Rules...");
        IpsRuleManager manager = new IpsRuleManager(this); // A fake one for now.  XXX
        Set<IpsRule> ruleSet = FileLoader.loadAllRuleFiles(manager);

        settings.setMaxChunks(engine.getMaxChunks());
        settings.pokeRules(ruleSet);

        setSettings(settings);
        logger.info(ruleSet.size() + " rules loaded");

        statisticManager.stop();
    }

    public IpsDetectionEngine getEngine() {
        return engine;
    }

    // protected methods -------------------------------------------------------

    protected void postStop()
    {
        statisticManager.stop();
        engine.stop();
    }

    protected void preStart()
    {
        logger.info("Pre Start");

        statisticManager.start();
    }

    protected void postInit()
    {
        logger.info("Post init");

        readNodeSettings();
        reconfigure();
    }

    // private methods ---------------------------------------------------------

    private void readNodeSettings()
    {
        SettingsManager setman = UvmContextFactory.context().settingsManager();
        String nodeID = this.getNodeSettings().getId().toString();
        String settingsName = System.getProperty("uvm.settings.dir") + "/untangle-node-ips/settings_" + nodeID;
        String settingsFile = settingsName + ".js";
        IpsSettings readSettings = null;

        logger.info("Loading settings from " + settingsFile);

        try {
            readSettings =  setman.load( IpsSettings.class, settingsName);
        }

        catch (Exception exn) {
            logger.error("Could not read node settings", exn);
        }

        // if no settings found try getting them from the database
        if (readSettings == null) {
            logger.warn("No json settings found... attempting to import from database");

            try {
                String convertCmd = SETTINGS_CONVERSION_SCRIPT + " " + nodeID.toString() + " " + settingsFile;
                logger.warn("Running: " + convertCmd);
                UvmContextFactory.context().execManager().exec( convertCmd );
            }

            catch (Exception exn) {
                logger.error("Conversion script failed", exn);
            }

            try {
                readSettings = setman.load( IpsSettings.class, settingsName);
            }

            catch (Exception exn) {
                logger.error("Could not read node settings", exn);
            }

            if (readSettings != null) logger.warn("Database settings successfully imported");
        }

        try {
            if (readSettings == null) {
                logger.warn("No database or json settings found... initializing with defaults");
                initializeNodeSettings();
            }
            else {
                settings = readSettings;
                reconfigure();
            }
        }
        catch (Exception exn) {
            logger.error("Could not apply node settings", exn);
        }
    }

    private void writeNodeSettings(IpsSettings argSettings)
    {
        SettingsManager setman = UvmContextFactory.context().settingsManager();
        String nodeID = this.getNodeSettings().getId().toString();
        String settingsName = System.getProperty("uvm.settings.dir") + "/untangle-node-ips/settings_" + nodeID;

        try {
            setman.save( IpsSettings.class, settingsName, argSettings);
        }

        catch (Exception exn) {
            logger.error("Could not save node settings", exn);
        }
    }

    private void reconfigure()
    {
        engine.setSettings(settings);
        engine.onReconfigure();
        engine.setMaxChunks(settings.getMaxChunks());
        Set<IpsRule> rules = settings.grabRules();
        engine.clearRules();
        for(IpsRule rule : rules) {
            engine.addRule(rule);
        }
    }

    public void incrementScanCount()
    {
	scanBlinger.increment();
    }

    public void incrementDetectCount()
    {
	detectBlinger.increment();
    }

    public void incrementBlockCount()
    {
	blockBlinger.increment();
    }
}
