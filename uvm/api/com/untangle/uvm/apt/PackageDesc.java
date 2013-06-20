/**
 * $Id$
 */
package com.untangle.uvm.apt;

import java.io.Serializable;
import java.util.Map;

import org.json.JSONObject;
import org.json.JSONString;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;

/**
 * Holds information about a Debian package.
 */
@SuppressWarnings("serial")
public class PackageDesc implements Serializable, JSONString
{
    private static final Logger logger = Logger.getLogger(PackageDesc.class);

    public static final int UNKNOWN_POSITION = -1;

    private final String name;
    private final String displayName;
    private final String installedVersion;
    private final String availableVersion;
    private final String shortDescription;
    private final String longDescription;
    private final String fullVersion;
    private final int size;
    private final int installedSize;
    private final byte[] descIcon;
    private final int viewPosition;
    private final boolean autoStart;

    public PackageDesc(Map<String, String> m, String installedVersion)
    {
        name = m.get("package");

        displayName = m.get("display-name");

        // versions
        availableVersion = m.get("version");

        // view position 
        String v = m.get("view-position");
        viewPosition = null == v ? UNKNOWN_POSITION : Integer.parseInt(v);

        v = m.get("auto-start");
        autoStart = (v != null && Boolean.parseBoolean(v));

        // size
        v = m.get("size");
        size = null == v ? 0 : Integer.parseInt(v);
        v = m.get("installed-size");
        installedSize = null == v ? 0 : Integer.parseInt(v);

        // description
        v = m.get("description");
        int i = v.indexOf('\n');
        if (0 <= i) {
            shortDescription = v.substring(0, i);
            longDescription = v.substring(i + 1);
        } else {
            shortDescription = v;
            longDescription = "";
        }

        // description
        fullVersion = m.get("untangle-full-version");

        // desc icon
        v = m.get("desc-icon");
        if (null != v) {
            descIcon = decode(v);
        } else {
            descIcon = null;
        }

        this.installedVersion = installedVersion;
    }

    public String getName()
    {
        return name;
    }

    public String getDisplayName()
    {
        return displayName;
    }

    public String getInstalledVersion()
    {
        return installedVersion;
    }

    public String getAvailableVersion()
    {
        return availableVersion;
    }

    public String getShortDescription()
    {
        return shortDescription;
    }

    public String getLongDescription()
    {
        return longDescription;
    }

    public String getFullVersion()
    {
        return fullVersion;
    }

    public int getSize()
    {
        return size;
    }

    public int getInstalledSize()
    {
        return installedSize;
    }

    public byte[] descIcon()
    {
        byte[] retVal = null;

        if (null != descIcon) {
            retVal = new byte[descIcon.length];
            System.arraycopy(descIcon, 0, retVal, 0, descIcon.length);
        }

        return retVal;
    }

    public int getViewPosition()
    {
        return viewPosition;
    }

    public boolean isAutoStart()
    {
        return autoStart;
    }

    public boolean isInvisible()
    {
        return (viewPosition == UNKNOWN_POSITION);
    }

    // Object methods ----------------------------------------------------------

    public String toString()
    {
        return toJSONString();
    }

    public String toJSONString()
    {
        JSONObject jO = new JSONObject(this);
        return jO.toString();
    }

    // private methods ---------------------------------------------------------

    private byte[] decode(String v)
    {
        v = v.replaceAll("[ \t]", "");

        return Base64.decodeBase64(v.getBytes());
    }
}
