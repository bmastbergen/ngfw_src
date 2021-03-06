/**
 * $Id$
 */
package com.untangle.jvector;

import com.untangle.jnetcap.Netcap;
import com.untangle.jnetcap.UDPPacket;

public abstract class PacketCrumb extends DataCrumb
{
    protected byte ttl;
    protected byte tos;
    protected byte options[];

    /**
     * Create a new Packet Crumb.</p>
     *
     * @param ttl     - Time To Live for the packet.
     * @param tos     - Type of service for the packet.
     * @param options - Type of service for the packet.          
     * @param data    - Byte array containing the data.
     * @param offset  - Offset in the byte array.
     * @param limit   - Limit of the data.
     */
    public PacketCrumb( byte ttl, byte tos, byte options[], byte[] data, int offset, int limit )
    {
        super( data, offset, limit );
        
        this.ttl     = ttl;
        this.tos     = tos;
        this.options = options;
    }

    protected PacketCrumb( UDPPacket packet, byte[] data, int offset, int limit )
    {
        this( packet.attributes().ttl(), packet.attributes().tos(), null, data, offset, limit );        
    }

    protected PacketCrumb( UDPPacket packet, byte[] data, int limit )
    {
        this( packet, data, 0, limit );
    }

    protected PacketCrumb( UDPPacket packet, byte[] data )
    {
        this( packet, data, data.length );
    }
    
    static PacketCrumb makeCrumb( UDPPacket packet ) throws JVectorException
    {
        int protocol = packet.attributes().getProtocol();

        switch ( protocol ) {
        case Netcap.IPPROTO_UDP:
            return new UDPPacketCrumb( packet, packet.data() );
        default:
            throw new JVectorException( "Unable to determine which crumb to create from protocol: " + protocol );
        }
    }
    
    public abstract int type();

    public byte ttl() 
    { 
        return ttl; 
    }
    
    public byte tos() 
    { 
        return tos;
    }

    public byte[] options()
    {
        return options;
    }

    public void ttl( byte value )
    {
        ttl = value;
    }

    public void tos( byte value )
    {
        tos = value;
    }

    public void options( byte[] value )
    {
        options = value;
    }

    public void raze()
    {
        /* XXX What should go in here, C structure is freed automatically */
    }
}
