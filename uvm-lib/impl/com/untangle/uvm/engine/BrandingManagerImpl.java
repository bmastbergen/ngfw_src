/*
 * $HeadURL: svn://chef/work/src/uvm-lib/impl/com/untangle/uvm/engine/BrandingManagerFactory.java $
 * Copyright (c) 2003-2007 Untangle, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * AS-IS and WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE, TITLE, or
 * NONINFRINGEMENT.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

package com.untangle.uvm.engine;

import org.apache.log4j.Logger;

import java.lang.reflect.Constructor;

import com.untangle.node.util.UtLogger;
import com.untangle.uvm.RemoteBrandingManager;
import com.untangle.uvm.LocalUvmContextFactory;
import com.untangle.uvm.node.NodeState;
import com.untangle.uvm.vnet.AbstractNode;

class BrandingManagerImpl implements RemoteBrandingManager
{
    private DefaultBrandingManager defaultBranding;

    private final String defaultCompanyName = "Untangle";
    private final String defaultCompanyUrl = "http://untangle.com/";

    private final Logger logger = Logger.getLogger(UvmContextImpl.class);
    
    public BrandingManagerImpl()
    {
        this.defaultBranding = new DefaultBrandingManager();
	}

    @Override
    public String getCompanyName()
    {
        /**
         * Start with the default
         */
        String ret = defaultCompanyName;

        /**
         * If there is an OEM name specified - use it instead
         */
        String oemName = LocalUvmContextFactory.context().oemManager().getOemName();
        if (oemName != null)
            ret = oemName;

        /**
         * If there is an Branding name specified - use it instead
         */
        String brandingName = this.getBrandingManager().getCompanyName();
        if (brandingName != null)
            ret = brandingName;

        return ret;
    }

    @Override
    public String getCompanyUrl()
    {
        /**
         * Start with the default
         */
        String ret = defaultCompanyUrl;

        /**
         * If there is an OEM name specified - use it instead
         */
        String oemUrl = LocalUvmContextFactory.context().oemManager().getOemUrl();
        if (oemUrl != null)
            ret = oemUrl;

        /**
         * If there is an Branding name specified - use it instead
         */
        String brandingUrl = this.getBrandingManager().getCompanyUrl();
        if (brandingUrl != null)
            ret = brandingUrl;
            
        return ret;
    }

    @Override
    public String getContactName()
    {
		return this.getBrandingManager().getContactName();
    }

    @Override
    public String getContactEmail()
    {
		return this.getBrandingManager().getContactEmail();
    }

    @Override
    public String getContactHtml()
    {
		return this.getBrandingManager().getContactHtml();
    }
    
    private RemoteBrandingManager getBrandingManager()
    {
        RemoteBrandingManager bnode = (RemoteBrandingManager)LocalUvmContextFactory.context().localNodeManager().node("untangle-node-branding");
        if (bnode != null && (((AbstractNode)bnode).getRunState() == NodeState.RUNNING)) {
            return bnode;
        }

        return this.defaultBranding;
    }
    
    private class DefaultBrandingManager implements RemoteBrandingManager
    {
        public boolean isDefaultLogo() {return true;}
        public String getContactHtml() {return "<a href='mailto:" + this.getContactEmail() + "'>" + this.getContactName() + "</a>";}
        public String getContactEmail() {return null;}
        public String getContactName() {return "your network administrator";} 
        public String getCompanyUrl() {return null;} 
        public String getCompanyName() {return null;} 
    }
}
