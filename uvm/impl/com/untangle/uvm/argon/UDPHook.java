/**
 * $Id$
 */
package com.untangle.uvm.argon;

import java.util.Iterator;

import org.apache.log4j.Logger;

import com.untangle.jnetcap.IPTraffic;
import com.untangle.jnetcap.NetcapHook;
import com.untangle.jnetcap.NetcapSession;
import com.untangle.jnetcap.NetcapUDPSession;
import com.untangle.jvector.Sink;
import com.untangle.jvector.Source;
import com.untangle.jvector.UDPSink;
import com.untangle.jvector.UDPSource;
import com.untangle.uvm.node.SessionEvent;


public class UDPHook implements NetcapHook
{
    private static UDPHook INSTANCE;
    private final Logger logger = Logger.getLogger(getClass());

    public static UDPHook getInstance() {
        if ( INSTANCE == null )
            init();

        return INSTANCE;
    }

    /* Singleton */
    private UDPHook()
    {
    }

    private static synchronized void init()
    {
        if ( INSTANCE == null )
            INSTANCE = new UDPHook();

        ArgonHook.init();
    }

    public void event( long sessionID )
    {
        new UDPArgonHook( sessionID ).run();
    }

    private class UDPArgonHook extends ArgonHook
    {
        /**
         * Default 70 second timeout for UDP sessions this fixes VOIP
         * which defaults to a 60 second timeout.
         **/
        protected static final int TIMEOUT = 70 * 1000;

        protected final NetcapUDPSession netcapUDPSession;

        protected final UDPSideListener clientSideListener = new UDPSideListener();
        protected final UDPSideListener serverSideListener = new UDPSideListener();

        protected IPTraffic serverTraffic = null;
        protected IPTraffic clientTraffic = null;

        protected ArgonUDPSession prevSession = null;

        protected UDPArgonHook( long id )
        {
            netcapUDPSession = new NetcapUDPSession( id );
        }

        protected int timeout()
        {
            return TIMEOUT;
        }

        protected NetcapSession netcapSession()
        {
            return netcapUDPSession;
        }

        protected SideListener clientSideListener()
        {
            return clientSideListener;
        }

        protected SideListener serverSideListener()
        {
            return serverSideListener;
        }

        /**
         * Complete the connection for the server side.  This merges
         * the sessions inside of the netcap session table.  It may
         * happen that this session has been merged out, at which point
         * this session is ended.
         */
        protected boolean serverComplete()
        {

            if ( sessionList.isEmpty()) {
                /* No sessions, complete with the current session parameters */
                serverTraffic = new IPTraffic( netcapUDPSession.serverSide());
            } else {
                /* Setup the UDP parameters to use the parameters from the last session in the chain */
                ArgonUDPSession session = (ArgonUDPSession)sessionList.get( sessionList.size() - 1 );

                if ( logger.isInfoEnabled()) {
                    logger.info( "UDP: Completing session:" );
                    logger.info( "Client: " + session.clientAddr() + ":" + session.clientPort());
                    logger.info( "Server: " + session.serverAddr() + ":" + session.serverPort());
                }

                serverTraffic = new IPTraffic( session.clientAddr(), session.clientPort(),
                                               session.serverAddr(), session.serverPort());

                serverTraffic.ttl( session.ttl());
                serverTraffic.tos( session.tos());
            }

            /* Packets cannot go back out on the client interface */
            /* Setup the marking */
            serverTraffic.isMarkEnabled( true );
            
            serverTraffic.mark( clientSide.clientIntf() );

            serverTraffic.lock();

            this.netcapUDPSession.setServerTraffic(serverTraffic);

            int intf = serverSide.serverIntf();

            if ( !netcapUDPSession.merge( serverTraffic, intf )) {
                /* Merged out and indicate that the session was rejected */
                state = ArgonIPNewSessionRequest.REJECTED;
                return false;
            }

            netcapUDPSession.serverComplete( serverTraffic );

            return true;
        }

        /**
         * Complete the connection for the client side.  This pretty much just locks
         * the client side traffic object.  The connection always completes, if the
         * client is uninterested, they will send an ICMP packet which will one
         * day get vectored.
         */
        protected boolean clientComplete()
        {
            clientTraffic = IPTraffic.makeSwapped( netcapUDPSession.clientSide());

            /* Setup the marking */
            clientTraffic.isMarkEnabled( true );
                
            /* Packets cannot go back out on the server interface */
            clientTraffic.mark( serverSide.serverIntf() );

            clientTraffic.lock();

            this.netcapUDPSession.setClientTraffic(clientTraffic);

            return true;
        }

        protected void clientReject()
        {
            /* XXX do something */
        }


        protected void clientRejectSilent()
        {
            /* XXX do something */
        }

        protected Sink makeClientSink()
        {
            return new UDPSink( clientTraffic, clientSideListener);
        }

        protected Sink makeServerSink()
        {
            return new UDPSink( serverTraffic, serverSideListener);
        }

        protected Source makeClientSource()
        {
            return new UDPSource( netcapUDPSession.clientMailbox(), clientSideListener );
        }

        protected Source makeServerSource()
        {
            return new UDPSource( netcapUDPSession.serverMailbox(), serverSideListener );
        }

        protected void newSessionRequest( ArgonAgent agent, Iterator<?> iter, SessionEvent pe )
        {
            ArgonUDPNewSessionRequest request;

            if ( prevSession == null ) {
                request = new ArgonUDPNewSessionRequestImpl( sessionGlobalState, agent, pe );
            } else {
                request = new ArgonUDPNewSessionRequestImpl( prevSession, agent, pe, sessionGlobalState );
            }

            ArgonUDPSession session = agent.getNewSessionEventListener().newSession( request );

            processSession( request, session );

            if ( iter.hasNext()) {
                /* Only advance the previous session if the node requested the session */
                if (( request.state() == ArgonIPNewSessionRequest.REQUESTED ) ||
                    ( request.state() == ArgonIPNewSessionRequest.RELEASED && session != null )) {
                    logger.debug( "Passing new session data client: " + session.clientAddr());
                    prevSession = session;
                } else {
                    logger.debug( "Reusing session data" );
                }
            } else {
                prevSession = null;
            }
        }

        protected void liberate()
        {
	    if (logger.isDebugEnabled()) {
		logger.debug("Liberating UDP Session: "+netcapUDPSession);
	    }
            netcapUDPSession.liberate();
        }

        protected void raze()
        {
            try {
                netcapUDPSession.raze();
            } catch ( Exception e ) {
                logger.error( "Unable to raze UDP Session", e );
            }

            /* No longer need these */

            try {
                if ( serverTraffic != null )
                    serverTraffic.raze();
            } catch ( Exception e ) {
                logger.error( "Unable to raze server traffic", e );
            }

            try {
                if ( clientTraffic != null )
                    clientTraffic.raze();
            } catch ( Exception e ) {
                logger.error( "Unable to raze client traffic", e );
            }
        }

        public void checkEndpoints()
        {
            /* If both sides are shutdown, give a timeout to complete vectoring */
            if ( clientSideListener.isShutdown() && serverSideListener.isShutdown()) {
                if ( logger.isDebugEnabled()) {
                    logger.debug( "Stats" );
                    logger.debug( "client side: " + clientSideListener.stats());
                    logger.debug( "server side: " + serverSideListener.stats());
                }
            }
        }

        private class UDPSideListener extends SideListener
        {
            protected UDPSideListener()
            {
            }

            public void shutdownEvent( Source source )
            {
                super.shutdownEvent( source );
                checkEndpoints();
            }

            public void shutdownEvent( Sink sink )
            {
                super.shutdownEvent( sink );
                checkEndpoints();
            }
        }
    }
}
