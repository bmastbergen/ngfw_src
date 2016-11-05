/**
 * $Id$
 */
package com.untangle.uvm;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Iterator;

import org.apache.log4j.Logger;

/**
 * The hook manager is a singleton to register and call hooks when certain actions occure
 *
 * Interested parties can register hook callbacks for certain names.
 * For example, to get a callback whenever network settings change you can register a callback
 * registerCallback( "network-settings-change", myCallback )
 *
 * hookNames are arbitrary strings so this can be used generically for any action
 */
public class HookManagerImpl implements HookManager
{
    private final Logger logger = Logger.getLogger(HookManagerImpl.class);

    /**
     * The singleton instance
     */
    private static final HookManagerImpl INSTANCE = new HookManagerImpl();

    /**
     * This map stores all the current active hooks for each group
     */
    private HashMap<String,LinkedList<HookCallback>> registeredCallbacks = new HashMap<String,LinkedList<HookCallback>>();
    
    private HookManagerImpl() {}

    public synchronized static HookManagerImpl getInstance()
    {
        return INSTANCE;
    }


    public boolean registerCallback( String hookName, HookCallback callback )
    {
        if ( callback == null || hookName == null ) {
            logger.warn( "Invalid argument: " + hookName + "," + callback );
            return false;
        }
        String callbackName = callback.getName();
        if ( callbackName == null ) {
            logger.warn( "Invalid callback name: " + callbackName );
            return false;
        }

        /**
         * Get the existing callback list for this group
         */
        LinkedList<HookCallback> callbacks = registeredCallbacks.get( hookName );
        if ( callbacks == null ) {
            callbacks = new LinkedList<HookCallback>();
            registeredCallbacks.put( hookName, callbacks );
        }

        /**
         * Check for duplicates
         */
        for ( HookCallback cb : callbacks ) {
            if ( callbackName.equals( cb.getName() ) ) {
                logger.warn( "Failed to register duplicate callback: " + callbackName );
                return false;
            }
        }

        logger.info( "Register hook[" + hookName + "] callback: " + callbackName );
        
        /**
         * Add it to the end of the list
         */
        callbacks.add( callback );
        return true;
    }

    public boolean unregisterCallback( String hookName, HookCallback callback )
    {
        if ( callback == null || hookName == null ) {
            logger.warn( "Invalid argument: " + hookName + "," + callback );
            return false;
        }
        String callbackName = callback.getName();
        if ( callbackName == null ) {
            logger.warn( "Invalid callback name: " + callbackName );
            return false;
        }

        LinkedList<HookCallback> callbacks = registeredCallbacks.get( hookName );
        if ( callbacks == null ) {
            return false;
        }
        
        Iterator<HookCallback> i = callbacks.iterator();
        boolean removed = false;
        while (i.hasNext()) {
            HookCallback cb = i.next();
            if ( callbackName.equals( cb.getName() ) ) {
                 i.remove();
                 removed = true;
            }
        }

        return removed;
    }

    public int callCallbacks( String hookName, Object o )
    {
        if ( hookName == null ) {
            logger.warn( "Invalid argument: " + hookName);
            return 0;
        }
        
        LinkedList<HookCallback> callbacks = registeredCallbacks.get( hookName );
        if ( callbacks == null ) {
            logger.debug( "Calling hook[" + hookName + "] callbacks (0 hooks)" );
            return 0;
        }

        logger.debug( "Calling hook[" + hookName + "] callbacks (" + callbacks.size() + " hooks)" );
        for ( HookCallback cb : callbacks ) {
            try {
                logger.debug( "Calling hook[" + hookName + "] callback " + cb.getName() );
                cb.callback( o );
            } catch (Exception e) {
                logger.warn( "Exception calling HookCallback[" + cb.getName() + "]:", e );
            }
        }

        return callbacks.size();
    }

    
    
}
