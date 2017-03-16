/**
 * $Id$
 */
package com.untangle.app.application_control_lite;

import java.nio.ByteBuffer;
import java.util.Iterator;
import java.util.Set;
import java.util.regex.Pattern;

import com.untangle.uvm.util.AsciiCharBuffer;
import com.untangle.uvm.vnet.AbstractEventHandler;
import com.untangle.uvm.vnet.AppSession;
import com.untangle.uvm.vnet.AppSession;
import com.untangle.uvm.vnet.AppTCPSession;
import com.untangle.uvm.vnet.AppUDPSession;
import com.untangle.uvm.vnet.IPPacketHeader;
import org.apache.log4j.Logger;

public class EventHandler extends AbstractEventHandler
{
    private final Logger logger = Logger.getLogger(EventHandler.class);

    private Set<ApplicationControlLitePattern> _patternSet;
    private int                     _byteLimit;
    private int                     _chunkLimit;
    private boolean                 _stripZeros;
    private ApplicationControlLiteApp app;

    private class SessionInfo
    {
        public AsciiCharBuffer serverBuffer;
        public AsciiCharBuffer clientBuffer;

        public int serverBufferSize;
        public int clientBufferSize;

        public int serverChunkCount;
        public int clientChunkCount;

        public String protocol;
    }

    EventHandler( ApplicationControlLiteApp app )
    {
        super(app);

        this.app = app;
    }

    public void handleTCPNewSession ( AppTCPSession session )
    {
        SessionInfo sessInfo = new SessionInfo();
        // We now don't allocate memory until we need it.
        sessInfo.clientBuffer = null;
        sessInfo.serverBuffer = null;
        session.attach(sessInfo);
    }

    public void handleUDPNewSession ( AppUDPSession session )
    {
        SessionInfo sessInfo = new SessionInfo();
        // We now don't allocate memory until we need it.
        sessInfo.clientBuffer = null;
        sessInfo.serverBuffer = null;
        session.attach(sessInfo);
    }

    public void handleTCPClientChunk ( AppTCPSession session, ByteBuffer data )
    {
        _handleChunk( data.duplicate(), session, true );
        session.sendDataToServer( data );
        return;
    }

    public void handleTCPServerChunk ( AppTCPSession session, ByteBuffer data )
    {
        _handleChunk( data.duplicate(), session, true );
        session.sendDataToClient( data );
        return;
    }

    public void handleUDPClientPacket ( AppUDPSession session, ByteBuffer data, IPPacketHeader header ) 
    {
        _handleChunk( data.duplicate(), session, false );
        session.sendServerPacket( data, header );
    }

    public void handleUDPServerPacket ( AppUDPSession session, ByteBuffer data, IPPacketHeader header ) 
    {
        _handleChunk( data.duplicate(), session, true );
        session.sendClientPacket( data, header );
    }

    public void patternSet ( Set<ApplicationControlLitePattern> patternSet )
    {
        _patternSet = patternSet;
    }

    public void chunkLimit ( int chunkLimit )
    {
        _chunkLimit = chunkLimit;
    }

    public void byteLimit ( int byteLimit )
    {
        _byteLimit  = byteLimit;
    }

    public void stripZeros ( boolean stripZeros )
    {
        _stripZeros = stripZeros;
    }

    private void _handleChunk ( ByteBuffer chunk, AppSession sess, boolean server )
    {
        SessionInfo sessInfo = (SessionInfo)sess.attachment();

        int chunkBytes = chunk.remaining();
        int bufferSize = server ? sessInfo.serverBufferSize: sessInfo.clientBufferSize;
        int bytesToWrite = chunkBytes > (this._byteLimit - bufferSize) ? this._byteLimit - bufferSize : chunkBytes;
        AsciiCharBuffer buf;
        int chunkCount;
        int written = 0;

        /**
         * grab the chunk
         */
        if (server) {
            buf = sessInfo.serverBuffer;
            chunkCount = sessInfo.serverChunkCount;
        } else {
            buf = sessInfo.clientBuffer;
            chunkCount = sessInfo.clientChunkCount;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("Got #" + chunkCount + " chunk from " + (server ? "server" : "client") + " of size " + chunkBytes + ", writing " + bytesToWrite + " of that");
        }

        if (buf == null) {
            // We thought about an optimization for the first chunk of
            // actually wrapping the chunk buffer itself. This would be
            // dangerous if anyone else in the pipeline held onto the
            // buffer for any reason (such as another application control lite). Too
            // scary for now.
            if (logger.isDebugEnabled()) {
                logger.debug("Creating new buffer of size " + bytesToWrite);
            }
            buf = AsciiCharBuffer.allocate(bytesToWrite, true);
        } else {
            buf = ensureRoomFor(buf, bytesToWrite);
        }
        ByteBuffer bbuf = buf.getWrappedBuffer();

        /**
         * copy the data into buf, possibly stripping zeros
         */
        for (int i = 0; i < bytesToWrite; i++) {
            byte b = chunk.get();
            if ((b != 0x00) || (!_stripZeros)) {
                bbuf.put(b);
                written++;
            }
        }
        bufferSize += written;
        chunkCount++;
        if (logger.isDebugEnabled()) {
            logger.debug("Wrote " + written + " bytes to buffer, now have " + bufferSize + " with capacity " + buf.capacity());
        }

        /**
         * update the buffer metadata
         */
        if (server) {
            sessInfo.serverBuffer = buf;
            sessInfo.serverBufferSize = bufferSize;
            sessInfo.serverChunkCount = chunkCount;
        } else {
            sessInfo.clientBuffer = buf;
            sessInfo.clientBufferSize = bufferSize;
            sessInfo.clientChunkCount = chunkCount;
        }

        ApplicationControlLitePattern elem = _findMatch(sessInfo, sess, server);
        app.incrementScanCount();
        if (elem != null) {
            sessInfo.protocol = elem.getProtocol();
            String l4prot = "";
            if (sess instanceof AppTCPSession)
                l4prot = "TCP";
            if (sess instanceof AppUDPSession)
                l4prot = "UDP";

            /**
             * Tag the session with metadata
             */
            sess.globalAttach(AppSession.KEY_APPLICATION_CONTROL_LITE_SIGNATURE,elem.getProtocol());
            sess.globalAttach(AppSession.KEY_APPLICATION_CONTROL_LITE_SIGNATURE_CATEGORY,elem.getCategory());
            sess.globalAttach(AppSession.KEY_APPLICATION_CONTROL_LITE_SIGNATURE_DESCRIPTION,elem.getDescription());
            sess.globalAttach(AppSession.KEY_APPLICATION_CONTROL_LITE_SIGNATURE_MATCHED,Boolean.TRUE);
                              
            app.incrementDetectCount();

            if (logger.isDebugEnabled()) {
                logger.debug( (elem.isBlocked() ? "Blocked: " : "Logged: ") + sessInfo.protocol + ": [" + l4prot + "] " +
                              sess.getClientAddr().getHostAddress() + ":" + sess.getClientPort() + " -> " +
                              sess.getServerAddr().getHostAddress() + ":" + sess.getServerPort());
            }

            ApplicationControlLiteEvent evt = new ApplicationControlLiteEvent(sess.sessionEvent(), sessInfo.protocol, elem.isBlocked());
            app.logEvent(evt);
            sess.attach(null);

            if (elem.isBlocked()) {
                app.incrementBlockCount();

                if (sess instanceof AppTCPSession) {
                    ((AppTCPSession)sess).resetClient();
                    ((AppTCPSession)sess).resetServer();
                }
                else if (sess instanceof AppUDPSession) {
                    ((AppUDPSession)sess).expireClient(); /* XXX correct? */
                    ((AppUDPSession)sess).expireServer(); /* XXX correct? */
                }
            }
            else {
                // We release session immediately upon first match.
                sess.attach(null);
                sess.release();
            }
        } else if (bufferSize >= this._byteLimit || (sessInfo.clientChunkCount+sessInfo.serverChunkCount) >= this._chunkLimit) {
            // Since we don't log this it isn't interesting
            // sessInfo.protocol = this._unknownString;
            // sessInfo.identified = true;
            if (logger.isDebugEnabled())
                logger.debug("Giving up after " + bufferSize + " bytes and " + (sessInfo.clientChunkCount+sessInfo.serverChunkCount) + " chunks");

            sess.globalAttach(AppSession.KEY_APPLICATION_CONTROL_LITE_SIGNATURE_MATCHED,Boolean.FALSE);
            sess.attach(null);
            sess.release();
        }
    }

    private ApplicationControlLitePattern _findMatch ( SessionInfo sessInfo, AppSession sess, boolean server )
    {
        AsciiCharBuffer buffer = server ? sessInfo.serverBuffer : sessInfo.clientBuffer;
        AsciiCharBuffer toScan = buffer.asReadOnlyBuffer();
        toScan.flip();

        for (Iterator<ApplicationControlLitePattern> iterator = _patternSet.iterator(); iterator.hasNext();) {
            ApplicationControlLitePattern elem = iterator.next();
            Pattern pat = PatternFactory.createRegExPattern(elem.getDefinition());
            if (pat != null && pat.matcher(toScan).find())
                return elem; /* XXX - can match multiple patterns */
        }

        return null;
    }

    // Only works with non-direct ByteBuffers.  Ignores mark.
    private AsciiCharBuffer ensureRoomFor( AsciiCharBuffer abuf, int bytesToAdd )
    {
        if (abuf.remaining() < bytesToAdd) {
            ByteBuffer buf = abuf.getWrappedBuffer();
            int oldCapacity = buf.capacity();
            // Make the buffer twice as big, or as big as needed, whichever is less.
            int newCapacity = (oldCapacity + 1) * 2;
            if (oldCapacity + bytesToAdd > newCapacity)
                newCapacity = oldCapacity + bytesToAdd;
            if (logger.isDebugEnabled()) {
                logger.debug("Expanding buffer to size " + newCapacity);
            }
            byte[] oldBytes = buf.array();
            byte[] newBytes = new byte[newCapacity];
            System.arraycopy(oldBytes, 0, newBytes, 0, oldBytes.length);
            AsciiCharBuffer newBuf = AsciiCharBuffer.wrap(newBytes);
            newBuf.position(buf.position());
            return  newBuf;
        } else {
            return abuf;
        }
    }
}
