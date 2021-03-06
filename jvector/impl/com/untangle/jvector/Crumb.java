/**
 * $Id$
 */
package com.untangle.jvector;

public abstract class Crumb
{
    protected static final int DATA_MASK     = 0x1100;
    protected static final int SHUTDOWN_MASK = 0x1200;

    public static final int TYPE_DATA        = DATA_MASK | 1;      // Data crumb
    public static final int TYPE_UDP_PACKET  = DATA_MASK | 2;      // UDP Packet
    public static final int TYPE_OBJECT      = DATA_MASK | 3;      // Object crumb

    public static final int TYPE_SHUTDOWN    = SHUTDOWN_MASK | 1;  // Shutdown
    public static final int TYPE_RESET       = SHUTDOWN_MASK | 2;  // Reset

    public abstract void raze();
    public abstract int  type();

    public boolean isData()
    {
        return ( type() & DATA_MASK ) == DATA_MASK;
    }

    public boolean isShutdown()
    {
        return ( type() & SHUTDOWN_MASK ) == SHUTDOWN_MASK;
    }
}
